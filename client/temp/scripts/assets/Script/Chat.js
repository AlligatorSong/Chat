"use strict";
cc._RF.push(module, '95302iCkodNVKcAFxha9StJ', 'Chat');
// Script/Chat.js

'use strict';

var account = window.account;

cc.Class({
    extends: cc.Component,

    properties: {
        scrollView: cc.ScrollView,
        viewContent: cc.Layout,
        chatItem: cc.Prefab,
        returnBtn: cc.Button,
        enterBtn: cc.Button,
        enterText: cc.EditBox,
        showBtn: cc.Button,
        nameLab: cc.Label,
        roomLab: cc.Label
    },

    // use this for initialization
    onLoad: function onLoad() {
        // this.createList()
        this.nameLab.string = 'name:' + account.getUserName();
        this.roomLab.string = 'room:' + account.getUserChannel();
    },

    // called every frame
    update: function update(dt) {},

    // arguments[0]为要替换的目标string
    // [1]时间、[2]from、[3]to、[4]content
    replaceString: function replaceString() {
        var wordArray = arguments[0].split('@');
        var word = '';
        for (var index = 0; index < wordArray.length - 1; index++) {
            var element = wordArray[index];
            word = word + element + arguments[index + 1];
        }
        return word;
    },

    createList: function createList() {
        for (var i = 1; i < 21; ++i) {
            var item = cc.instantiate(this.chatItem);
            var label = item.getComponent(cc.RichText);
            label.string = this.replaceString(label.string, '11--' + i, 'A' + i, 'B' + i);
            this.viewContent.node.addChild(item);
        }
    },

    //arguments[1]eventData
    clickShowBtn: function clickShowBtn() {
        this.viewContent.node.removeAllChildren();
        this.viewContent.node.height = 0;
    },

    clickEnterBtn: function clickEnterBtn() {
        if (this.enterText.string == undefined || this.enterText.string == '' || this.enterText.string == null) {
            console.log('plase enter word---');
            return;
        }
        var item = cc.instantiate(this.chatItem);
        var label = item.getComponent(cc.RichText);
        var now = new Date();
        label.string = this.replaceString(label.string, now.Format('yyyy-MM-dd hh:mm:ss') + '\t', 'C', 'D', this.enterText.string);
        this.enterText.string = '';
        this.viewContent.node.addChild(item);
        var maskSizeH = this.scrollView.node.getChildByName('view').height;
        var curContentHeight = this.viewContent.node.height + item.height;
        if (maskSizeH >= curContentHeight) {
            return;
        }
        this.scrollView.stopAutoScroll();
        var bolBottomToTop = cc.Layout.VerticalDirection.BOTTOM_TO_TOP == this.viewContent.verticalDirection;
        if (!bolBottomToTop) {
            if (this.viewContent.node.y >= (this.viewContent.node.height - 2 * maskSizeH) / 2) {
                this.scrollView.scrollToBottom();
            } else {
                this.viewContent.node.y -= item.height / 2;
            }
        } else {
            if (this.viewContent.node.y <= -(this.viewContent.node.height - 2 * maskSizeH) / 2) {
                this.scrollView.scrollToTop();
            } else {
                this.viewContent.node.y += item.height / 2;
            }
        }
    },

    clickReturnBtn: function clickReturnBtn() {
        cc.director.loadScene('load');
    }
});

cc._RF.pop();