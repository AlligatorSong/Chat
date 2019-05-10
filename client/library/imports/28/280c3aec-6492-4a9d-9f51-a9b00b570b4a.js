"use strict";
cc._RF.push(module, '280c3rsZJJKnZ9RqbALVwtK', 'Load');
// Script/Load.js

'use strict';

// window.io = require('./lib/socket.io');
// require('./lib/pomeloclient');
var pomelo = window.pomelo;
require('Account');
var account = window.account;
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
        this.isEnter = false;
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
            host: '192.168.31.11',
            port: 15014,
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
        if (this.nameEditBox.string === null || this.channelEditBox.string === null || this.nameEditBox.string === '' || this.channelEditBox.string === '' || this.isEnter) {
            return;
        }
        this.isEnter = true;
        //query entry of connection
        var self = this;
        var uid = this.nameEditBox.string;
        var rid = this.channelEditBox.string;
        account.setUserName(uid);
        account.setUserChannel(rid);
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
                        cc.log("DUPLICATE_ERROR");
                        return;
                    }
                    var memGroup = {};
                    for (var i = 0; i < data.users.length; i++) {
                        var value = data.users[i];
                        if (value !== uid) {
                            memGroup[value] = value;
                        }
                    };
                    account.setMembers(memGroup);
                    cc.director.loadScene("chat");
                });
            });
        });
    },

    // called every frame
    update: function update(dt) {}
});

cc._RF.pop();