var chatRemote = require('../remote/chatRemote');

module.exports = function (app) {
    return new Handler(app);
};

var Handler = function (app) {
    this.app = app;
};

var handler = Handler.prototype;

/**
 * Send messages to users
 *
 * @param {Object} msg message from client
 * @param {Object} session
 * @param  {Function} next next stemp callback
 *
 */
handler.send = function (msg, session, next) {
    var rid = session.get('rid');
    var username = session.uid.split('*')[0];
    var channelService = this.app.get('channelService');
    var route = 'onChat'
    var param = {
        msg: msg.content,
        from: username,
        target: msg.target
    };
    channel = channelService.getChannel(rid, false);

    //the target is all users
    if (msg.target == '*') {
        channel.pushMessage(route,param);
    }
    //the target is specific user
    else {
        var uidArray = new Array();
        var tuid = msg.target + '*' + rid;
        var tsid = channel.getMember(tuid)['sid'];
        var uidObject = {}
        uidObject.uid = tuid;
        uidObject.sid = tsid;
        uidArray.push(uidObject);
        var tuid = username + '*' + rid;
        var tsid = channel.getMember(tuid)['sid'];
        var uidObject = {}
        uidObject.uid = tuid;
        uidObject.sid = tsid;
        uidArray.push(uidObject);

        channelService.pushMessageByUids(route,param, uidArray);
    }
    next(null, {
        route: msg.route
    });
};