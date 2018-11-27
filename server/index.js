var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(80);
console.log('Listening on port 9000');
// WARNING: app.listen(80) will NOT work here!

app.get('/', function (req, res) {
  res.send('Server ;)');
});

io.on('connection', function (socket) {
  console.log('User connected');
  socket.emit('kekistan', { hello: 'world' });

  setTimeout(function() {
    socket.emit('kekistan', { hello: 'LOOOL' });
  }, 3000);
});