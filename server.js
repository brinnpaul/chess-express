var path = require('path');

var http = require('http');
var server = http.createServer();

var express = require('express');
var app = express();

var socketio = require('socket.io');

server.on('request', app);

var io = socketio(server);

// var savedStroke = [];
var drawHistory = [];

io.on('connection', function (socket) {
    var room

    console.log('A new client has connected!');
    console.log(socket.id);

    socket.on('disconnect', function() {
      console.log("Disconnected :()")
      socket.disconnect()
    })

    socket.on('moving', function(data) {
      // console.log(data)
      // socket.emit('update', data)
      socket.broadcast.emit('update', data)
    })

    // socket.on('wantToJoinRoom', function(roomName){
    //   room = roomName;
    //   socket.join(room)
    //   if (!drawHistory[room]) drawHistory[room] = [];
    //   socket.emit('drawHistory', drawHistory[room]);
    // });

    //  non room version of redraw
    // socket.on('redraw', function() {
    //   socket.emit('redrawClient', savedStroke)
    // })

    // socket.on('imDrawing', function(start, end, color){
    //   drawHistory[room].push({start: start, end: end, color: color})
    //   socket.broadcast.to(room).emit('otherDraw', start, end, color)
    // });
    // non room version of emitting to other clients
    // socket.on('draw', function(start, end, color) {
    //   console.log(start, end, color)
    //   socket.broadcast.emit('draw', start, end, color)
    //   savedStroke.push([start, end, color])
    // })
});

server.listen(3000, function () {
    console.log('The server is listening on port 3000!');
});

app.use(express.static(path.join(__dirname, 'browser')));

app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});
