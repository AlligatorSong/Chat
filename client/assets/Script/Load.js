// window.io = require('./lib/socket.io');
// require('./lib/pomeloclient');
var pomelo = window.pomelo;
require('Account');
var account = window.account
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
        },
    },

    // use this for initialization
    onLoad: function () {
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

    clickSeeBtn: function () {
        if (this.channelEditBox.inputFlag === cc.EditBox.InputFlag.PASSWORD) {
            this.channelEditBox.inputFlag = cc.EditBox.InputFlag.DEFAULT;
        } else {
            this.channelEditBox.inputFlag = cc.EditBox.InputFlag.PASSWORD;
        }
    },
    // query connector
    queryEntry(uid, callback) {
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

    clickJoinBtn: function () {
        if (this.nameEditBox.string===null
            || this.channelEditBox.string===null
            || this.nameEditBox.string===''
            || this.channelEditBox.string===''
            || this.isEnter ) {
            return;
        }
        this.isEnter = true;
        //query entry of connection
        let self = this
        let uid = this.nameEditBox.string;
        let rid = this.channelEditBox.string;
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
                    let memGroup = {};
                    for (var i = 0; i < data.users.length; i++) {
                        let value = data.users[i];
                        if (value!==uid){
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
    update: function (dt) {
    },
});
