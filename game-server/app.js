var fs = require('fs');
var pomelo = require('pomelo');
var routeUtil = require('./util/routeUtil');

/**
 * Init app for client.
 */
var app = pomelo.createApp();
app.set('name', 'game-server');

// app configuration
app.configure('production|development', function(){
  app.route('chat', routeUtil.chat);
  app.set('connectorConfig',
    {
      key: fs.readFileSync('./shared/server.key'),
  		cert: fs.readFileSync('./shared/server.crt'),
      transports: ['websocket', 'polling'],
      heartbeats: true,
      closeTimeout: 60 * 1000,
      heartbeatTimeout: 60 * 1000,
      heartbeatInterval: 25 * 1000
    });
  // filter configures
  app.filter(pomelo.timeout());
});

// 支持 socket.io
app.configure('production|development', 'sio-connector', function(){
	app.set('connectorConfig',
		{
			connector : pomelo.connectors.sioconnector
		});
});

//支持 websocket 和 socket
app.configure('production|development', 'hybrid-connector', function(){
    app.set('connectorConfig',
        {
            connector : pomelo.connectors.hybridconnector,
            useDict: true,
            // useProtobuf: true
        });
});

// start app
app.start();

process.on('uncaughtException', function (err) {
  console.error(' Caught exception: ' + err.stack);
});