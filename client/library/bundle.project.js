require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"Account":[function(require,module,exports){
"use strict";
cc._RF.push(module, 'e66dbSUcnJFRJ+cx5ktvjF4', 'Account');
// Script/Account.js

'use strict';

/**
 * 玩家信息管理类
 * @class Account
 * @constructor
 * @param {number}  
 */
function Account() {
    this.name = null;
    this.channel = null;
}

/**
 * 存玩家的名字
 * @method setUserName
 * @param {String} name
 */
Account.prototype.setUserName = function (name) {
    if (!name) {
        return;
    }
    this.name = name;
    cc.sys.localStorage.setItem('name', name);
};

/**
 * 返回上次登录玩家的名字，若无则返回空字符
 * @method getUserName
 * @return {String}
 */
Account.prototype.getUserName = function () {
    if (this.name) {
        return this.name;
    }
    return cc.sys.localStorage.getItem('name');
};

/**
 * 存玩家的聊天房间名
 * @method setUserChannel
 * @param {String} channel
 */
Account.prototype.setUserChannel = function (channel) {
    if (!channel) {
        return;
    }
    this.channel = channel;
    cc.sys.localStorage.setItem('channel', channel);
};

/**
 * 返回上次登录玩家的房间名，若无则返回空字符
 * @method getUserChannel
 * @return {String}
 */
Account.prototype.getUserChannel = function () {
    if (this.channel) {
        return this.channel;
    }
    return cc.sys.localStorage.getItem('channel');
};

Account.prototype.getChatDataChannel = function () {
    return this.chatData || {};
};

Account.prototype.setChatDataChannel = function (data) {
    this.chatData = data;
};

module.exports = Account;

cc._RF.pop();
},{}],"Chat":[function(require,module,exports){
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
},{}],"Load":[function(require,module,exports){
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
},{"Account":"Account"}],"time":[function(require,module,exports){
"use strict";
cc._RF.push(module, 'a1583wtivFBkZeSwyehHDkY', 'time');
// Script/utils/time.js

"use strict";

//js格式化时间 "yyyy-MM-dd hh:mm:ss"  
Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份  
        "d+": this.getDate(), //日  
        "h+": this.getHours(), //小时  
        "m+": this.getMinutes(), //分  
        "s+": this.getSeconds(), //秒  
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度  
        "S": this.getMilliseconds() //毫秒  
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
    }return fmt;
};
Date.prototype.addDays = function (d) {
    this.setDate(this.getDate() + d);
};
Date.prototype.addWeeks = function (w) {
    this.addDays(w * 7);
};
Date.prototype.addMonths = function (m) {
    var d = this.getDate();
    this.setMonth(this.getMonth() + m);
    if (this.getDate() < d) this.setDate(0);
};
Date.prototype.addYears = function (y) {
    var m = this.getMonth();
    this.setFullYear(this.getFullYear() + y);
    if (m < this.getMonth()) {
        this.setDate(0);
    }
};

cc._RF.pop();
},{}]},{},["Account","Chat","Load","time"])

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9TY3JpcHQvQWNjb3VudC5qcyIsImFzc2V0cy9TY3JpcHQvQ2hhdC5qcyIsImFzc2V0cy9TY3JpcHQvTG9hZC5qcyIsImFzc2V0cy9TY3JpcHQvdXRpbHMvdGltZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7Ozs7OztBQU1BO0FBQ0k7QUFDQTtBQUNIOztBQUVEOzs7OztBQUtBO0FBQ0k7QUFDSTtBQUNIO0FBQ0Q7QUFDQTtBQUNIOztBQUVEOzs7OztBQUtBO0FBQ0k7QUFDSTtBQUNIO0FBQ0Q7QUFDSDs7QUFFRDs7Ozs7QUFLQTtBQUNJO0FBQ0k7QUFDSDtBQUNEO0FBQ0E7QUFDSDs7QUFFRDs7Ozs7QUFLQTtBQUNJO0FBQ0k7QUFDSDtBQUNEO0FBQ0g7O0FBRUQ7QUFDSTtBQUNIOztBQUVEO0FBQ0k7QUFDSDs7QUFFRDs7Ozs7Ozs7OztBQ3JFQTs7QUFFQTtBQUNJOztBQUVBO0FBQ0k7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBVFE7O0FBWVo7QUFDQTtBQUNJO0FBQ0E7QUFDQTtBQUNIOztBQUVEO0FBQ0E7O0FBR0E7QUFDQTtBQUNBO0FBQ0k7QUFDQTtBQUNBO0FBQ0k7QUFDQTtBQUNIO0FBQ0Q7QUFDSDs7QUFFRDtBQUNJO0FBQ0k7QUFDQTtBQUNBO0FBQ0E7QUFDSDtBQUNKOztBQUVEO0FBQ0E7QUFDSTtBQUNBO0FBQ0g7O0FBRUQ7QUFDSTtBQUdRO0FBQ0o7QUFDSDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNJO0FBQ0g7QUFDRDtBQUNBO0FBQ0E7QUFDSTtBQUNJO0FBQ0g7QUFDRztBQUNIO0FBQ0o7QUFDRztBQUNJO0FBQ0g7QUFDRztBQUNIO0FBQ0o7QUFDSjs7QUFFRDtBQUNJO0FBQ0g7QUExRkk7Ozs7Ozs7Ozs7QUNGVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNJOztBQUVBO0FBQ0k7QUFDSTtBQUNBO0FBRlM7QUFJYjtBQUNJO0FBQ0E7QUFGWTtBQUloQjtBQUNRO0FBQ0E7QUFGQztBQUlUO0FBQ1E7QUFDQTtBQUZBO0FBYkE7O0FBbUJaO0FBQ0E7QUFDSTtBQUNBO0FBQ0k7QUFDSDtBQUNEO0FBQ0E7QUFDSTtBQUNIO0FBQ0o7O0FBRUQ7QUFDSTtBQUNJO0FBQ0g7QUFDRztBQUNIO0FBQ0o7QUFDRDtBQUNBO0FBQ0k7QUFDQTtBQUNJO0FBQ0E7QUFDQTtBQUhRO0FBS1I7QUFDSTtBQURrQjtBQUdsQjtBQUNBO0FBQ0k7QUFDQTtBQUNIO0FBQ0Q7QUFDSDtBQUNKO0FBQ0o7OztBQUVEO0FBQ0k7QUFJSTtBQUNIOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ047QUFDQztBQUNDO0FBQ0E7QUFDQTtBQUhXO0FBS1g7QUFDQTtBQUNDO0FBQ0E7QUFGcUI7QUFJckI7QUFDQztBQUNBO0FBQ2U7QUFDZjtBQUNBO0FBQ0Q7QUFDRDtBQUNEO0FBQ0U7O0FBRUQ7QUFDQTtBQWpHSzs7Ozs7Ozs7OztBQ2hCVDtBQUNBO0FBQ0k7QUFDSTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVBJO0FBU1I7QUFFQTtBQUNJO0FBREo7QUFJSDtBQUNEO0FBQ0k7QUFDSDtBQUNEO0FBQ0k7QUFDSDtBQUNEO0FBQ0k7QUFDQTtBQUNBO0FBRUg7QUFDRDtBQUNJO0FBQ0E7QUFDQTtBQUNJO0FBQ0g7QUFDSiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICog546p5a625L+h5oGv566h55CG57G7XG4gKiBAY2xhc3MgQWNjb3VudFxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge251bWJlcn0gIFxuICovXG5mdW5jdGlvbiBBY2NvdW50ICgpIHtcbiAgICB0aGlzLm5hbWUgPSBudWxsXG4gICAgdGhpcy5jaGFubmVsID0gbnVsbFxufVxuXG4vKipcbiAqIOWtmOeOqeWutueahOWQjeWtl1xuICogQG1ldGhvZCBzZXRVc2VyTmFtZVxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqL1xuQWNjb3VudC5wcm90b3R5cGUuc2V0VXNlck5hbWUgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIGlmKCFuYW1lKXtcbiAgICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgY2Muc3lzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKCduYW1lJywgbmFtZSk7XG59O1xuXG4vKipcbiAqIOi/lOWbnuS4iuasoeeZu+W9leeOqeWutueahOWQjeWtl++8jOiLpeaXoOWImei/lOWbnuepuuWtl+esplxuICogQG1ldGhvZCBnZXRVc2VyTmFtZVxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5BY2NvdW50LnByb3RvdHlwZS5nZXRVc2VyTmFtZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5uYW1lKXtcbiAgICAgICAgcmV0dXJuIHRoaXMubmFtZVxuICAgIH1cbiAgICByZXR1cm4gY2Muc3lzLmxvY2FsU3RvcmFnZS5nZXRJdGVtKCduYW1lJyk7XG59O1xuXG4vKipcbiAqIOWtmOeOqeWutueahOiBiuWkqeaIv+mXtOWQjVxuICogQG1ldGhvZCBzZXRVc2VyQ2hhbm5lbFxuICogQHBhcmFtIHtTdHJpbmd9IGNoYW5uZWxcbiAqL1xuQWNjb3VudC5wcm90b3R5cGUuc2V0VXNlckNoYW5uZWwgPSBmdW5jdGlvbiAoY2hhbm5lbCkge1xuICAgIGlmKCFjaGFubmVsKXtcbiAgICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMuY2hhbm5lbCA9IGNoYW5uZWw7XG4gICAgY2Muc3lzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdjaGFubmVsJyxjaGFubmVsKTtcbn07XG5cbi8qKlxuICog6L+U5Zue5LiK5qyh55m75b2V546p5a6255qE5oi/6Ze05ZCN77yM6Iul5peg5YiZ6L+U5Zue56m65a2X56ymXG4gKiBAbWV0aG9kIGdldFVzZXJDaGFubmVsXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbkFjY291bnQucHJvdG90eXBlLmdldFVzZXJDaGFubmVsID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLmNoYW5uZWwpe1xuICAgICAgICByZXR1cm4gdGhpcy5jaGFubmVsXG4gICAgfVxuICAgIHJldHVybiBjYy5zeXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2NoYW5uZWwnKTtcbn07XG5cbkFjY291bnQucHJvdG90eXBlLmdldENoYXREYXRhQ2hhbm5lbCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5jaGF0RGF0YSB8fCB7fTtcbn07XG5cbkFjY291bnQucHJvdG90eXBlLnNldENoYXREYXRhQ2hhbm5lbCA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgdGhpcy5jaGF0RGF0YSA9IGRhdGE7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFjY291bnQ7IiwidmFyIGFjY291bnQgPSB3aW5kb3cuYWNjb3VudFxuXG5jYy5DbGFzcyh7XG4gICAgZXh0ZW5kczogY2MuQ29tcG9uZW50LFxuXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICBzY3JvbGxWaWV3OiBjYy5TY3JvbGxWaWV3LFxuICAgICAgICB2aWV3Q29udGVudDpjYy5MYXlvdXQsXG4gICAgICAgIGNoYXRJdGVtOiBjYy5QcmVmYWIsXG4gICAgICAgIHJldHVybkJ0bjogY2MuQnV0dG9uLFxuICAgICAgICBlbnRlckJ0bjogY2MuQnV0dG9uLFxuICAgICAgICBlbnRlclRleHQ6IGNjLkVkaXRCb3gsXG4gICAgICAgIHNob3dCdG46IGNjLkJ1dHRvbixcbiAgICAgICAgbmFtZUxhYjogY2MuTGFiZWwsXG4gICAgICAgIHJvb21MYWI6IGNjLkxhYmVsLFxuICAgIH0sXG5cbiAgICAvLyB1c2UgdGhpcyBmb3IgaW5pdGlhbGl6YXRpb25cbiAgICBvbkxvYWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gdGhpcy5jcmVhdGVMaXN0KClcbiAgICAgICAgdGhpcy5uYW1lTGFiLnN0cmluZyA9ICduYW1lOicrYWNjb3VudC5nZXRVc2VyTmFtZSgpO1xuICAgICAgICB0aGlzLnJvb21MYWIuc3RyaW5nID0gJ3Jvb206JythY2NvdW50LmdldFVzZXJDaGFubmVsKCk7XG4gICAgfSxcblxuICAgIC8vIGNhbGxlZCBldmVyeSBmcmFtZVxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKGR0KSB7XG4gICAgfSxcbiAgICBcbiAgICAvLyBhcmd1bWVudHNbMF3kuLropoHmm7/mjaLnmoTnm67moIdzdHJpbmdcbiAgICAvLyBbMV3ml7bpl7TjgIFbMl1mcm9t44CBWzNddG/jgIFbNF1jb250ZW50XG4gICAgcmVwbGFjZVN0cmluZzogZnVuY3Rpb24oKXtcbiAgICAgICAgbGV0IHdvcmRBcnJheSA9IGFyZ3VtZW50c1swXS5zcGxpdCgnQCcpO1xuICAgICAgICBsZXQgd29yZCA9ICcnO1xuICAgICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgd29yZEFycmF5Lmxlbmd0aC0xOyBpbmRleCsrKSB7XG4gICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gd29yZEFycmF5W2luZGV4XTtcbiAgICAgICAgICAgIHdvcmQgPSB3b3JkICsgZWxlbWVudCArIGFyZ3VtZW50c1tpbmRleCsxXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gd29yZDtcbiAgICB9LFxuXG4gICAgY3JlYXRlTGlzdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgMjE7ICsraSkge1xuICAgICAgICAgICAgbGV0IGl0ZW0gPSBjYy5pbnN0YW50aWF0ZSh0aGlzLmNoYXRJdGVtKTtcbiAgICAgICAgICAgIGxldCBsYWJlbCA9IGl0ZW0uZ2V0Q29tcG9uZW50KGNjLlJpY2hUZXh0KTtcbiAgICAgICAgICAgIGxhYmVsLnN0cmluZyA9IHRoaXMucmVwbGFjZVN0cmluZyhsYWJlbC5zdHJpbmcsJzExLS0nK2ksJ0EnK2ksJ0InK2kpO1xuICAgICAgICAgICAgdGhpcy52aWV3Q29udGVudC5ub2RlLmFkZENoaWxkKGl0ZW0pO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8vYXJndW1lbnRzWzFdZXZlbnREYXRhXG4gICAgY2xpY2tTaG93QnRuOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMudmlld0NvbnRlbnQubm9kZS5yZW1vdmVBbGxDaGlsZHJlbigpXG4gICAgICAgIHRoaXMudmlld0NvbnRlbnQubm9kZS5oZWlnaHQgPSAwXG4gICAgfSxcblxuICAgIGNsaWNrRW50ZXJCdG46IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMuZW50ZXJUZXh0LnN0cmluZz09dW5kZWZpbmVkXG4gICAgICAgICAgICB8fCB0aGlzLmVudGVyVGV4dC5zdHJpbmc9PScnXG4gICAgICAgICAgICB8fCB0aGlzLmVudGVyVGV4dC5zdHJpbmc9PW51bGwpe1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdwbGFzZSBlbnRlciB3b3JkLS0tJylcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIGxldCBpdGVtID0gY2MuaW5zdGFudGlhdGUodGhpcy5jaGF0SXRlbSk7XG4gICAgICAgIGxldCBsYWJlbCA9IGl0ZW0uZ2V0Q29tcG9uZW50KGNjLlJpY2hUZXh0KTtcbiAgICAgICAgbGV0IG5vdyA9IG5ldyBEYXRlKCk7XG4gICAgICAgIGxhYmVsLnN0cmluZyA9IHRoaXMucmVwbGFjZVN0cmluZyhsYWJlbC5zdHJpbmcsbm93LkZvcm1hdCgneXl5eS1NTS1kZCBoaDptbTpzcycpKydcXHQnLCdDJywnRCcsdGhpcy5lbnRlclRleHQuc3RyaW5nKTtcbiAgICAgICAgdGhpcy5lbnRlclRleHQuc3RyaW5nID0gJydcbiAgICAgICAgdGhpcy52aWV3Q29udGVudC5ub2RlLmFkZENoaWxkKGl0ZW0pO1xuICAgICAgICBsZXQgbWFza1NpemVIID0gdGhpcy5zY3JvbGxWaWV3Lm5vZGUuZ2V0Q2hpbGRCeU5hbWUoJ3ZpZXcnKS5oZWlnaHQ7XG4gICAgICAgIGxldCBjdXJDb250ZW50SGVpZ2h0ID0gdGhpcy52aWV3Q29udGVudC5ub2RlLmhlaWdodCtpdGVtLmhlaWdodFxuICAgICAgICBpZihtYXNrU2l6ZUg+PWN1ckNvbnRlbnRIZWlnaHQpe1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2Nyb2xsVmlldy5zdG9wQXV0b1Njcm9sbCgpXG4gICAgICAgIGxldCBib2xCb3R0b21Ub1RvcCA9IGNjLkxheW91dC5WZXJ0aWNhbERpcmVjdGlvbi5CT1RUT01fVE9fVE9QPT10aGlzLnZpZXdDb250ZW50LnZlcnRpY2FsRGlyZWN0aW9uO1xuICAgICAgICBpZiAoIWJvbEJvdHRvbVRvVG9wKXtcbiAgICAgICAgICAgIGlmICh0aGlzLnZpZXdDb250ZW50Lm5vZGUueT49KHRoaXMudmlld0NvbnRlbnQubm9kZS5oZWlnaHQtMiptYXNrU2l6ZUgpLzIpe1xuICAgICAgICAgICAgICAgIHRoaXMuc2Nyb2xsVmlldy5zY3JvbGxUb0JvdHRvbSgpXG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdDb250ZW50Lm5vZGUueSAtPSBpdGVtLmhlaWdodC8yO1xuICAgICAgICAgICAgfVxuICAgICAgICB9ZWxzZSB7XG4gICAgICAgICAgICBpZiAodGhpcy52aWV3Q29udGVudC5ub2RlLnk8PS0odGhpcy52aWV3Q29udGVudC5ub2RlLmhlaWdodC0yKm1hc2tTaXplSCkvMil7XG4gICAgICAgICAgICAgICAgdGhpcy5zY3JvbGxWaWV3LnNjcm9sbFRvVG9wKClcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIHRoaXMudmlld0NvbnRlbnQubm9kZS55ICs9IGl0ZW0uaGVpZ2h0LzI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgY2xpY2tSZXR1cm5CdG46IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY2MuZGlyZWN0b3IubG9hZFNjZW5lKCdsb2FkJyk7XG4gICAgfSxcbn0pO1xuIiwidmFyIHBvbWVsbyA9IHdpbmRvdy5wb21lbG87XG52YXIgdXNlcm5hbWU7XG52YXIgdXNlcnM7XG52YXIgcmlkO1xudmFyIGJhc2UgPSAxMDAwO1xudmFyIGluY3JlYXNlID0gMjU7XG52YXIgcmVnID0gL15bYS16QS1aMC05X1xcdTRlMDAtXFx1OWZhNV0rJC87XG52YXIgTE9HSU5fRVJST1IgPSBcIlRoZXJlIGlzIG5vIHNlcnZlciB0byBsb2cgaW4sIHBsZWFzZSB3YWl0LlwiO1xudmFyIExFTkdUSF9FUlJPUiA9IFwiTmFtZS9DaGFubmVsIGlzIHRvbyBsb25nIG9yIHRvbyBzaG9ydC4gMjAgY2hhcmFjdGVyIG1heC5cIjtcbnZhciBOQU1FX0VSUk9SID0gXCJCYWQgY2hhcmFjdGVyIGluIE5hbWUvQ2hhbm5lbC4gQ2FuIG9ubHkgaGF2ZSBsZXR0ZXJzLCBudW1iZXJzLCBDaGluZXNlIGNoYXJhY3RlcnMsIGFuZCAnXydcIjtcbnZhciBEVVBMSUNBVEVfRVJST1IgPSBcIlBsZWFzZSBjaGFuZ2UgeW91ciBuYW1lIHRvIGxvZ2luLlwiO1xuXG52YXIgQWNjb3VudCA9IHJlcXVpcmUoJ0FjY291bnQnKTtcbnZhciBhY2NvdW50ID0gbmV3IEFjY291bnQoKVxud2luZG93LmFjY291bnQgPSBhY2NvdW50XG5cbmNjLkNsYXNzKHtcbiAgICBleHRlbmRzOiBjYy5Db21wb25lbnQsXG5cbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIG5hbWVFZGl0Qm94OiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogY2MuRWRpdEJveFxuICAgICAgICB9LFxuICAgICAgICBjaGFubmVsRWRpdEJveDoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IGNjLkVkaXRCb3hcbiAgICAgICAgfSxcbiAgICAgICAgam9pbkJ0bjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICAgICAgdHlwZTogY2MuQnV0dG9uXG4gICAgICAgICAgICB9LFxuICAgICAgICBzZWVCdG46IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgICAgIHR5cGU6IGNjLkJ1dHRvblxuICAgICAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgLy8gdXNlIHRoaXMgZm9yIGluaXRpYWxpemF0aW9uXG4gICAgb25Mb2FkOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBsb2NhbE5hbWUgPSAgYWNjb3VudC5nZXRVc2VyTmFtZSgpO1xuICAgICAgICBpZiAobG9jYWxOYW1lKSB7XG4gICAgICAgICAgICB0aGlzLm5hbWVFZGl0Qm94LnN0cmluZyA9IGxvY2FsTmFtZTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbG9jYWxDaGFubmVsID0gIGFjY291bnQuZ2V0VXNlckNoYW5uZWwoKTtcbiAgICAgICAgaWYgKGxvY2FsQ2hhbm5lbCkge1xuICAgICAgICAgICAgdGhpcy5jaGFubmVsRWRpdEJveC5zdHJpbmcgPSBsb2NhbENoYW5uZWw7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgY2xpY2tTZWVCdG46IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMuY2hhbm5lbEVkaXRCb3guaW5wdXRGbGFnPT09Y2MuRWRpdEJveC5JbnB1dEZsYWcuUEFTU1dPUkQpe1xuICAgICAgICAgICAgdGhpcy5jaGFubmVsRWRpdEJveC5pbnB1dEZsYWcgPSBjYy5FZGl0Qm94LklucHV0RmxhZy5ERUZBVUxUXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgdGhpcy5jaGFubmVsRWRpdEJveC5pbnB1dEZsYWcgPSBjYy5FZGl0Qm94LklucHV0RmxhZy5QQVNTV09SRFxuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyBxdWVyeSBjb25uZWN0b3JcbiAgICBxdWVyeUVudHJ5KHVpZCwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHJvdXRlID0gJ2dhdGUuZ2F0ZUhhbmRsZXIucXVlcnlFbnRyeSc7XG4gICAgICAgIHBvbWVsby5pbml0KHtcbiAgICAgICAgICAgIGhvc3Q6IHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZSxcbiAgICAgICAgICAgIHBvcnQ6IDMwMTQsXG4gICAgICAgICAgICBsb2c6IHRydWVcbiAgICAgICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBwb21lbG8ucmVxdWVzdChyb3V0ZSwge1xuICAgICAgICAgICAgICAgIHVpZDogdWlkXG4gICAgICAgICAgICB9LCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgcG9tZWxvLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgICAgICAgICBpZihkYXRhLmNvZGUgPT09IDUwMCkge1xuICAgICAgICAgICAgICAgICAgICBjYy5sb2coTE9HSU5fRVJST1IpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGRhdGEuaG9zdCwgZGF0YS5wb3J0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY2xpY2tKb2luQnRuOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLm5hbWVFZGl0Qm94LnN0cmluZz09PW51bGxcbiAgICAgICAgICAgIHx8IHRoaXMuY2hhbm5lbEVkaXRCb3guc3RyaW5nPT09bnVsbFxuICAgICAgICAgICAgfHwgdGhpcy5uYW1lRWRpdEJveC5zdHJpbmc9PT0nJ1xuICAgICAgICAgICAgfHwgdGhpcy5jaGFubmVsRWRpdEJveC5zdHJpbmc9PT0nJykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvL3F1ZXJ5IGVudHJ5IG9mIGNvbm5lY3Rpb25cbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzXG4gICAgICAgIGxldCB1aWQgPSB0aGlzLm5hbWVFZGl0Qm94LnN0cmluZztcbiAgICAgICAgbGV0IHJpZCA9IHRoaXMuY2hhbm5lbEVkaXRCb3guc3RyaW5nO1xuXHRcdHNlbGYucXVlcnlFbnRyeSh1aWQsIGZ1bmN0aW9uKGhvc3QsIHBvcnQpIHtcblx0XHRcdHBvbWVsby5pbml0KHtcblx0XHRcdFx0aG9zdDogaG9zdCxcblx0XHRcdFx0cG9ydDogcG9ydCxcblx0XHRcdFx0bG9nOiB0cnVlXG5cdFx0XHR9LCBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHJvdXRlID0gXCJjb25uZWN0b3IuZW50cnlIYW5kbGVyLmVudGVyXCI7XG5cdFx0XHRcdHBvbWVsby5yZXF1ZXN0KHJvdXRlLCB7XG5cdFx0XHRcdFx0dXNlcm5hbWU6IHVpZCxcblx0XHRcdFx0XHRyaWQ6IHJpZFxuXHRcdFx0XHR9LCBmdW5jdGlvbihkYXRhKSB7XG5cdFx0XHRcdFx0aWYoZGF0YS5lcnJvcikge1xuXHRcdFx0XHRcdFx0Y2MubG9nKERVUExJQ0FURV9FUlJPUik7XG5cdFx0XHRcdFx0XHRyZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cblx0XHRcdFx0XHRcdGNjLmxvZygnLS0tLS0tLS0tMTExMTExMTExMTEnKTtcblx0XHRcdFx0XHRcdGNjLmxvZyhkYXRhKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblx0XHR9KTtcbiAgICB9LFxuXG4gICAgLy8gY2FsbGVkIGV2ZXJ5IGZyYW1lXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoZHQpIHtcbiAgICB9LFxufSk7XG4iLCIvL2pz5qC85byP5YyW5pe26Ze0IFwieXl5eS1NTS1kZCBoaDptbTpzc1wiICBcclxuRGF0ZS5wcm90b3R5cGUuRm9ybWF0ID0gZnVuY3Rpb24gKGZtdCkgeyAgXHJcbiAgICB2YXIgbyA9IHsgIFxyXG4gICAgICAgIFwiTStcIjogdGhpcy5nZXRNb250aCgpICsgMSwgLy/mnIjku70gIFxyXG4gICAgICAgIFwiZCtcIjogdGhpcy5nZXREYXRlKCksIC8v5pelICBcclxuICAgICAgICBcImgrXCI6IHRoaXMuZ2V0SG91cnMoKSwgLy/lsI/ml7YgIFxyXG4gICAgICAgIFwibStcIjogdGhpcy5nZXRNaW51dGVzKCksIC8v5YiGICBcclxuICAgICAgICBcInMrXCI6IHRoaXMuZ2V0U2Vjb25kcygpLCAvL+enkiAgXHJcbiAgICAgICAgXCJxK1wiOiBNYXRoLmZsb29yKCh0aGlzLmdldE1vbnRoKCkgKyAzKSAvIDMpLCAvL+Wto+W6piAgXHJcbiAgICAgICAgXCJTXCI6IHRoaXMuZ2V0TWlsbGlzZWNvbmRzKCkgLy/mr6vnp5IgIFxyXG4gICAgfTsgIFxyXG4gICAgaWYgKC8oeSspLy50ZXN0KGZtdCkpICBcclxuICAgICAgICBmbXQgPSBmbXQucmVwbGFjZShSZWdFeHAuJDEsICh0aGlzLmdldEZ1bGxZZWFyKCkgKyBcIlwiKS5zdWJzdHIoNCAtIFJlZ0V4cC4kMS5sZW5ndGgpKTsgIFxyXG4gICAgZm9yICh2YXIgayBpbiBvKSAgXHJcbiAgICAgICAgaWYgKG5ldyBSZWdFeHAoXCIoXCIgKyBrICsgXCIpXCIpLnRlc3QoZm10KSkgIFxyXG4gICAgICAgICAgICBmbXQgPSBmbXQucmVwbGFjZShSZWdFeHAuJDEsIChSZWdFeHAuJDEubGVuZ3RoID09IDEpID8gKG9ba10pIDogKChcIjAwXCIgKyBvW2tdKS5zdWJzdHIoKFwiXCIgKyBvW2tdKS5sZW5ndGgpKSk7ICBcclxuICAgIHJldHVybiBmbXQ7ICBcclxufSAgXHJcbkRhdGUucHJvdG90eXBlLmFkZERheXMgPSBmdW5jdGlvbiAoZCkgeyAgXHJcbiAgICB0aGlzLnNldERhdGUodGhpcy5nZXREYXRlKCkgKyBkKTsgIFxyXG59OyAgXHJcbkRhdGUucHJvdG90eXBlLmFkZFdlZWtzID0gZnVuY3Rpb24gKHcpIHsgIFxyXG4gICAgdGhpcy5hZGREYXlzKHcgKiA3KTsgIFxyXG59OyAgXHJcbkRhdGUucHJvdG90eXBlLmFkZE1vbnRocyA9IGZ1bmN0aW9uIChtKSB7ICBcclxuICAgIHZhciBkID0gdGhpcy5nZXREYXRlKCk7ICBcclxuICAgIHRoaXMuc2V0TW9udGgodGhpcy5nZXRNb250aCgpICsgbSk7ICBcclxuICAgIGlmICh0aGlzLmdldERhdGUoKSA8IGQpICBcclxuICAgICAgICB0aGlzLnNldERhdGUoMCk7ICBcclxufTsgIFxyXG5EYXRlLnByb3RvdHlwZS5hZGRZZWFycyA9IGZ1bmN0aW9uICh5KSB7ICBcclxuICAgIHZhciBtID0gdGhpcy5nZXRNb250aCgpOyAgXHJcbiAgICB0aGlzLnNldEZ1bGxZZWFyKHRoaXMuZ2V0RnVsbFllYXIoKSArIHkpOyAgXHJcbiAgICBpZiAobSA8IHRoaXMuZ2V0TW9udGgoKSkgeyAgXHJcbiAgICAgICAgdGhpcy5zZXREYXRlKDApOyAgXHJcbiAgICB9ICBcclxufTsgIFxyXG4iXSwic291cmNlUm9vdCI6IiJ9