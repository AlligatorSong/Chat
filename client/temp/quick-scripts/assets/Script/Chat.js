(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/Script/Chat.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '95302iCkodNVKcAFxha9StJ', 'Chat', __filename);
// Script/Chat.js

'use strict';

var account = window.account;

cc.Class({
    extends: cc.Component,

    properties: {
        scrollView: cc.ScrollView,
        viewContent: cc.Layout,
        chatItem: cc.Prefab,
        listItem: cc.Prefab,
        returnBtn: cc.Button,
        enterBtn: cc.Button,
        enterText: cc.EditBox,
        showBtn: cc.Button,
        nameLab: cc.Label,
        roomLab: cc.Label,
        tipLayer: cc.Node,
        listLayer: cc.Node,
        listContent: cc.Layout,
        tipLab: cc.Label,
        toLab: cc.Label
    },

    showTip: function showTip(word) {
        this.tipLayer.stopAllActions();
        this.tipLayer.y = this.tipPosY;
        var height = this.tipLayer.height;
        this.tipLab.string = 'tip:\n\t ' + word;
        var seq = cc.sequence(cc.moveBy(0.6, cc.p(0, height)), cc.delayTime(1), cc.moveBy(0.6, cc.p(0, -height)));
        this.tipLayer.runAction(seq);
    },

    moveList: function moveList(isLeft) {
        isLeft = isLeft || this.isLeftList;
        this.listLayer.stopAllActions();
        var width = this.listLayer.width;
        if (isLeft) {
            width = -width;
        } else {
            this.listLayer.x = this.listPosX;
        };
        this.listLayer.runAction(cc.moveBy(0.6, cc.p(width, 0)));
        this.isLeftList = !isLeft;
    },

    initList: function initList() {
        var memGroup = account.getMembers();
        this.listContent.node.removeAllChildren();
        this.addOneForList('All');
        for (var key in memGroup) {
            if (memGroup[key]) {
                var element = memGroup[key];
                this.addOneForList(element);
            }
        };
    },

    createOneForList: function createOneForList(name) {
        var item = cc.instantiate(this.listItem);
        var label = item.getComponent(cc.Label);
        label.string = name;
        var self = this;
        item.on('touchend', function (event) {
            self.toLab.string = name;
            self.moveList(true);
        }, self);
        return item;
    },

    addOneForList: function addOneForList(name) {
        var item = this.createOneForList(name);
        this.listContent.node.addChild(item);
    },

    removeOneForList: function removeOneForList(name) {
        var items = this.listContent.node.children;
        var isRemove = false;
        var newToName = void 0;
        for (var key in items) {
            if (items.hasOwnProperty(key)) {
                var item = items[key];
                var string = item.getComponent(cc.Label).string;
                if (string === name) {
                    item.removeFromParent();
                    break;
                } else if (!newToName) {
                    newToName = name;
                }
            };
        };
        if (name === this.toLab.string) {
            this.toLab.string = newToName || 'All';
        };
    },

    // use this for initialization
    onLoad: function onLoad() {
        this.isLeftList = false;
        // this.createList()
        this.nameLab.string = 'name:' + account.getUserName();
        this.roomLab.string = 'room:' + account.getUserChannel();
        //
        this.tipPosY = this.tipLayer.y;
        this.listPosX = this.listLayer.x;

        var self = this;
        pomelo.on('onAdd', function (data) {
            var user = data.user;
            var wordAdd = 'wellcome ' + user + ' join room';
            self.showTip(wordAdd);
            account.addMember(user);
            self.addOneForList(user);
        });
        pomelo.on('onLeave', function (data) {
            var user = data.user;
            var wordAdd = user + ' leave room';
            self.showTip(wordAdd);
            account.kickMember(user);
            self.removeOneForList(user);
        });
        // 监听"onChat", 接收消息
        pomelo.on('onChat', function (data) {
            self.addChatItem(data);
        });

        //当从聊天断开时
        pomelo.on('disconnect', function (reason) {
            pomelo.removeAllListeners();
            self.tipLayer.stopAllActions();
            cc.director.loadScene('load');
        });

        this.initList();
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

    addChatItem: function addChatItem(data) {
        var item = cc.instantiate(this.chatItem);
        var label = item.getComponent(cc.RichText);
        var now = new Date();
        var word = '<color=#00ff00>@</c><color=#0fffff><br/>@</c><color=#00ff00> says to</c><color=#0fffff> @ :<br/>@';
        var to = data.target === '*' ? 'All' : data.target;
        word = this.replaceString(word, now.Format('yyyy-MM-dd hh:mm:ss'), data.from, to, data.msg);
        label.string = word;
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

    //arguments[1]eventData
    clickShowBtn: function clickShowBtn() {
        this.moveList();
    },

    clickEnterBtn: function clickEnterBtn() {
        if (this.enterText.string == undefined || this.enterText.string == '' || this.enterText.string == null) {
            return;
        }
        var route = "chat.chatHandler.send",
            target = this.toLab.string === 'All' ? '*' : this.toLab.string,
            msg = this.enterText.string;
        var self = this;
        pomelo.request(route, {
            rid: self.roomLab.string,
            content: msg,
            from: self.nameLab.string,
            target: target
        }, function (data) {
            self.enterText.string = '';
        });
    },

    clickReturnBtn: function clickReturnBtn() {
        pomelo.disconnect();
    }
});

cc._RF.pop();
        }
        if (CC_EDITOR) {
            __define(__module.exports, __require, __module);
        }
        else {
            cc.registerModuleFunc(__filename, function () {
                __define(__module.exports, __require, __module);
            });
        }
        })();
        //# sourceMappingURL=Chat.js.map
        