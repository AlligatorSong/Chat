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
/**
 * 
 * 
 * @returns 聊天的成员
 */
Account.prototype.getMembers = function () {
    return this.memGroup || {};
};
/**
 * 
 * 
 * @param {any} memGroup 
 */
Account.prototype.setMembers = function (memGroup) {
    this.memGroup = memGroup;
};

Account.prototype.addMember = function (mem) {
    var memGroup = this.getMembers();
    memGroup[mem] = mem;
};

Account.prototype.kickMember = function (mem) {
    var memGroup = this.getMembers();
    memGroup[mem] = null;
};

var account = new Account();
window.account = account;

module.exports = Account;

cc._RF.pop();