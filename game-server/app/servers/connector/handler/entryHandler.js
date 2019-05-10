module.exports = function (app) {
	return new Handler(app);
};

var Handler = function (app) {
	this.app = app;
};

var handler = Handler.prototype;

/**
 * New client entry chat server.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next stemp callback
 * @return {Void}
 */
handler.enter = function (msg, session, next) {
	var self = this;
	var rid = msg.rid;
	var uid = msg.username + '*' + rid
	var sessionService = self.app.get('sessionService');

	//duplicate log in
	if (!!sessionService.getByUid(uid)) {
		next(null, {
			code: 500,
			error: true
		});
		return;
	}

	session.bind(uid);
	session.set('rid', rid);
	session.push('rid', function (err) {
		if (err) {
			console.error('set rid for session service failed! error is : %j', err.stack);
		}
	});
	session.on('closed', onUserLeave.bind(null, self.app));

	// var sum = function (x, y) {
	// 	return x + y;
	// }
	// //创建一个类似于sum的新函数，但this的值绑定到null
	// //并且第一个参数绑定到1， 这个新函数的期望只传入一个实参
	// var succ = sum.bind(null, 1);

	// console.log(succ(2)); //输出 3； x 绑定到1，并传入2作为实参

	// //另外一个做累计计算的函数
	// var sum2 = function (y, z) {
	// 	return this.x + y + z;
	// }

	// //绑定this 和 y
	// var bindSum2 = sum2.bind({ x: 1 }, 2);
	// console.log(bindSum2(3)); //输出 6； this.x 绑定到1，y绑定到2， z 绑定到3.


	//put user into channel
	self.app.rpc.chat.chatRemote.add(session, uid, self.app.get('serverId'), rid, true, function (users) {
		next(null, {
			users: users
		});
	});
};

/**
 * User log out handler
 *
 * @param {Object} app current application
 * @param {Object} session current session object
 *
 */
var onUserLeave = function (app, session) {
	if (!session || !session.uid) {
		return;
	}
	app.rpc.chat.chatRemote.kick(session, session.uid, app.get('serverId'), session.get('rid'), null);
};