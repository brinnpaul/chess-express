var socket = io(window.location.origin);

socket.on('connect', function () {
    console.log('I have made a persistent two-way connection to the server!');
    socket.emit('wantToJoinRoom', window.location.pathname)
    socket.emit('redraw')
});
//
// socket.on('drawHistory', function(strokes) {
//   strokes.forEach(function(draw) {
//     whiteboard.draw(draw.start, draw.end, draw.color)
//   })
// })
// //// front end receiving from back end socket
// socket.on('otherDraw', function(start, end, color) {
//   whiteboard.draw(start, end, color, true)
// })
//
//
// //// front end emitting to back end socket
// whiteboard.on('draw', function(start, end, color) {
//   color = color || "black"
//   socket.emit('imDrawing', start, end, color)
//   console.log(start, end, color)
// })
