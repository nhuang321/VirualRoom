// Dependencies.
var express = require('express');
var bodyParser = require('body-parser');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');

const mongoose = require('mongoose'); 
mongoose.connect('mongodb://localhost:27017/virtualRoom', { 
  useNewUrlParser: true,
  useUnifiedTopology: true 
}); 

var db = mongoose.connection; 
db.on('error', console.log.bind(console, "connection error")); 
db.once('open', function(callback){ 
    console.log("connection succeeded"); 
}) 


var app = express();
var server = http.Server(app);
var io = socketIO(server);

app.set('port', 5000);

app.use('/static', express.static(__dirname + '/../static'));

app.use(bodyParser.urlencoded({ 
  extended: true,
})); 


// Routing

app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, '/../static/index.html'));
});

app.post('/login', async function(req,res) { 
  var OUN = req.body.OUN; 

  var data = { 
      OUN: OUN, 
      socket_id: -1,
  }
  
  try {
    var found = await db.collection('users').findOne({ "OUN": OUN });
    if (!found) {
      db.collection('users').insertOne(data, function(err, collection) { 
        if (err) throw err; 
        console.log("Record inserted Successfully");        
      }); 
    } 
    return res.redirect('game/?OUN=' + encodeURIComponent(OUN));

  } catch (e) {
    console.log('error', e);
    return res.send('Something went wrong :(')
  }

}) 

app.get('/game', function(request, response) {
  response.sendFile(path.join(__dirname, '/../game.html'));
});

server.listen(5000, function() {
  console.log('Starting server on port 5000');
});


app.get('/oun', async function(req, res) {
  try {
    var socketId = req.query.socketId
    var found = await db.collection('users').findOne({ "socket_id": socketId})
    if (found) {
      res.send({'OUN': found.OUN})
    } else {
      res.send({'OUN': 'NOT FOUND'})
    }
  } catch (e) {
    res.send('error: ', e)
  }
})




// Fancy socket stuff

var players = {};
io.on('connection', function(socket) {

  socket.on('new player', async function(OUN) {
    try {
      var ret = await db.collection('users').updateOne({ 'OUN': OUN }, { $set: { 'socket_id': socket.id }});

      players[socket.id] = {
        x: 300,
        y: 300,
        OUN: OUN,
      };
    } catch (e) {
      console.log('error in new player creation', e)
    }
  });
    

  socket.on('movement', function(data) {
    var player = players[socket.id] || {};
    if (data.left && player.x - 5 > 0) {
      player.x -= 5;
    }
    if (data.up && player.y - 5 > 0) {
      player.y -= 5;
    }
    if (data.right && player.x + 5 < 800) {
      player.x += 5;
    }
    if (data.down && player.y + 5 < 600) {
      player.y += 5;
    }
  });

  socket.on('disconnect', () => {
    delete players[socket.id]
  });

});

setInterval(function() {
  io.sockets.emit('state', players);
}, 1000 / 60);