var restify = require('restify');
// var config = require('./config');


var server = restify.createServer({name:'api'});

server.use(restify.fullResponse());
server.use(restify.bodyParser({ mapParams: true }));
server.use(restify.queryParser());

server.get('/hello',send);

function send(req,res,next){
	res.send('hello');
	next();
}

server.get(/.*/, restify.serveStatic({
	'directory': '..',
	'default': 'work3.html'
}));

server.listen(8000,function(){
	console.log('server listening on port number',server.url);
});




var routes = require('./routes')(server);