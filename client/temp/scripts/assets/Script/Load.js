"use strict";
cc._RF.push(module, '280c3rsZJJKnZ9RqbALVwtK', 'Load');
// Script/Load.js

"use strict";

var pomelo = window.pomelo;
var username;
var users;
var rid;
var base = 1000;
var increase = 25;
var reg = /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/;
var LOGIN_ERROR = "There is no server to log in, please wait.";
var LENGTH_ERROR = "Name/Channel is too long or too short. 20 character max.";
var NAME_ERROR = "Bad character in Name/Channel. Can only have letters, numbers, Chinese characters, and '_'";
var DUPLICATE_ERROR = "Please change your name to login.";

var Account = require('Account');
var account = new Account();
window.account = account;

cc.Class({
    extends: cc.Component,

    properties: {
        nameEditBox: {
            default: null,
            type: cc.EditBox
        },
        channelEditBox: {
            default: null,
            type: cc.EditBox
        },
        joinBtn: {
            default: null,
            type: cc.Button
        },
        seeBtn: {
            default: null,
            type: cc.Button
        }
    },

    // use this for initialization
    onLoad: function onLoad() {
        var localName = account.getUserName();
        if (localName) {
            this.nameEditBox.string = localName;
        }
        var localChannel = account.getUserChannel();
        if (localChannel) {
            this.channelEditBox.string = localChannel;
        }
    },

    clickSeeBtn: function clickSeeBtn() {
        if (this.channelEditBox.inputFlag === cc.EditBox.InputFlag.PASSWORD) {
            this.channelEditBox.inputFlag = cc.EditBox.InputFlag.DEFAULT;
        } else {
            this.channelEditBox.inputFlag = cc.EditBox.InputFlag.PASSWORD;
        }
    },
    // query connector
    queryEntry: function queryEntry(uid, callback) {
        var route = 'gate.gateHandler.queryEntry';
        pomelo.init({
            host: window.location.hostname,
            port: 3014,
            log: true
        }, function () {
            pomelo.request(route, {
                uid: uid
            }, function (data) {
                pomelo.disconnect();
                if (data.code === 500) {
                    cc.log(LOGIN_ERROR);
                    return;
                }
                callback(data.host, data.port);
            });
        });
    },


    clickJoinBtn: function clickJoinBtn() {
        if (this.nameEditBox.string === null || this.channelEditBox.string === null || this.nameEditBox.string === '' || this.channelEditBox.string === '') {
            return;
        }

        //query entry of connection
        var self = this;
        var uid = this.nameEditBox.string;
        var rid = this.channelEditBox.string;
        self.queryEntry(uid, function (host, port) {
            pomelo.init({
                host: host,
                port: port,
                log: true
            }, function () {
                var route = "connector.entryHandler.enter";
                pomelo.request(route, {
                    username: uid,
                    rid: rid
                }, function (data) {
                    if (data.error) {
                        cc.log(DUPLICATE_ERROR);
                        return;
                    }
                    cc.log('---------11111111111');
                    cc.log(data);
                });
            });
        });
    },

    // called every frame
    update: function update(dt) {}
});

cc._RF.pop();