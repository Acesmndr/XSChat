var express = require('express')
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var activeUsers = [],activeTypers = [];
io.on('connection',function(client){
	console.log('Client connected...');
	setInterval(function(){
		activeTypers = [];
	},1500);
	client.on('login',function(data){
		activeUsers.push(data.usr);
		client.broadcast.emit('message',{msg:`${data.usr} has just logged in`,type:'info'});
		if(activeUsers.length == 1){
			client.emit('message',{msg:`Welcome ${data.usr}! Nobody seems to be online right now :(`,type:'info'});
		}else{
			client.emit('message',{msg:`Welcome ${data.usr} say hi to ${activeUsers.filter((user)=>user !== data.usr).toString()}`,type:'info'});
		}
	});
	client.on('isTyping',function(data){
		if(activeTypers.indexOf(data.usr)<0){
			activeTypers.push(data.usr);
		}
		client.broadcast.emit('friendTyping',{usrList:activeTypers});
	}); 
	client.on('usermessage',function(data){
		client.broadcast.emit('message',{msg:data.msg,type:'msg',usr:data.usr});
		client.emit('message',{msg:data.msg,type:'msg',usr:data.usr});
	});
	client.on('logout', function(data){
		activeUsers.splice(activeUsers.indexOf(data.usr));
    client.broadcast.emit('message',{msg:`${data.usr} has left the conversation`,type:'info'});
  });
});
app.get('/',function(req,res){
	res.sendFile(__dirname+'/index.html');
});
server.listen(8000,function(){
	console.log('listening');
});
