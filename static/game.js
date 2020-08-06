var socket = io();
var radius = 80;
var movement = {
  up: false,
  down: false,
  left: false,
  right: false
}
document.addEventListener('keydown', function(event) {
  switch (event.keyCode) {
    case 65: // A
      movement.left = true;
      break;
    case 87: // W
      movement.up = true;
      break;
    case 68: // D
      movement.right = true;
      break;
    case 83: // S
      movement.down = true;
      break;
  }
});
document.addEventListener('keyup', function(event) {
  switch (event.keyCode) {
    case 65: // A
      movement.left = false;
      break;
    case 87: // W
      movement.up = false;
      break;
    case 68: // D
      movement.right = false;
      break;
    case 83: // S
      movement.down = false;
      break;
  }
});

socket.emit('new player');
setInterval(function() {
  socket.emit('movement', movement);
}, 1000 / 60);

var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
socket.on('state', function(players) {
  context.clearRect(0, 0, 800, 600);
  context.fillStyle = 'blue';
  for (var id in players) {
    var player = players[id];
    context.beginPath();

    if ( socket.id == id ) {
      context.fillStyle = 'green';
    } else {
      context.fillStyle = 'blue';
    }

    context.arc(player.x, player.y, 10, 0, 2 * Math.PI);
    if (players.hasOwnProperty(socket.id)){
      drawJoinBox(players, id);
    }
    context.fill();
  }
});

function drawJoinBox(players, otherPlayerId){
  if (socket.id == otherPlayerId){
    return;
  }
  if (Math.sqrt(Math.pow(players[socket.id].x - players[otherPlayerId].x, 2) + 
    Math.pow(players[otherPlayerId].y - players[socket.id].y, 2)) < radius){
      console.log('player within range!')
  }
}
