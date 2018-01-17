var account = window.account

cc.Class({
    extends: cc.Component,

    properties: {
        scrollView: cc.ScrollView,
        viewContent:cc.Layout,
        chatItem: cc.Prefab,
        returnBtn: cc.Button,
        enterBtn: cc.Button,
        enterText: cc.EditBox,
        showBtn: cc.Button,
        nameLab: cc.Label,
        roomLab: cc.Label,
    },

    // use this for initialization
    onLoad: function () {
        // this.createList()
        this.nameLab.string = 'name:'+account.getUserName();
        this.roomLab.string = 'room:'+account.getUserChannel();
    },

    // called every frame
    update: function (dt) {
    },
    
    // arguments[0]为要替换的目标string
    // [1]时间、[2]from、[3]to、[4]content
    replaceString: function(){
        let wordArray = arguments[0].split('@');
        let word = '';
        for (let index = 0; index < wordArray.length-1; index++) {
            const element = wordArray[index];
            word = word + element + arguments[index+1];
        }
        return word;
    },

    createList: function() {
        for (let i = 1; i < 21; ++i) {
            let item = cc.instantiate(this.chatItem);
            let label = item.getComponent(cc.RichText);
            label.string = this.replaceString(label.string,'11--'+i,'A'+i,'B'+i);
            this.viewContent.node.addChild(item);
        }
    },

    //arguments[1]eventData
    clickShowBtn: function () {
        this.viewContent.node.removeAllChildren()
        this.viewContent.node.height = 0
    },

    clickEnterBtn: function () {
        if (this.enterText.string==undefined
            || this.enterText.string==''
            || this.enterText.string==null){
                console.log('plase enter word---')
            return
        }
        let item = cc.instantiate(this.chatItem);
        let label = item.getComponent(cc.RichText);
        let now = new Date();
        label.string = this.replaceString(label.string,now.Format('yyyy-MM-dd hh:mm:ss')+'\t','C','D',this.enterText.string);
        this.enterText.string = ''
        this.viewContent.node.addChild(item);
        let maskSizeH = this.scrollView.node.getChildByName('view').height;
        let curContentHeight = this.viewContent.node.height+item.height
        if(maskSizeH>=curContentHeight){
            return;
        }
        this.scrollView.stopAutoScroll()
        let bolBottomToTop = cc.Layout.VerticalDirection.BOTTOM_TO_TOP==this.viewContent.verticalDirection;
        if (!bolBottomToTop){
            if (this.viewContent.node.y>=(this.viewContent.node.height-2*maskSizeH)/2){
                this.scrollView.scrollToBottom()
            }else{
                this.viewContent.node.y -= item.height/2;
            }
        }else {
            if (this.viewContent.node.y<=-(this.viewContent.node.height-2*maskSizeH)/2){
                this.scrollView.scrollToTop()
            }else{
                this.viewContent.node.y += item.height/2;
            }
        }
    },

    clickReturnBtn: function () {
        cc.director.loadScene('load');
    },
});
