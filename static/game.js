var socket = io();
var radius = 80;
const urlParams = new URLSearchParams(window.location.search);
const OUN = urlParams.get('OUN');
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

const currentAcceptBox = {
  x: -1,
  y: -1,
  width: -1,
  height: -1
}

const closestPlayerInfo = {
  distance: Number.MAX_SAFE_INTEGER,
  id: -1,
}

socket.emit('new player', OUN);
setInterval(function() {
  socket.emit('movement', movement);
}, 1000 / 60);

var canvas = document.getElementById('canvas');

canvas.addEventListener('click', function(event) {
  /* if event is within closest dialogue box bounds, fire */
  //fix because margin jazz
  if ( Math.abs(event.clientX - currentAcceptBox.x) < currentAcceptBox.width &&
       Math.abs(event.clientY - currentAcceptBox.y) < currentAcceptBox.height) 
  {
    console.log('entered')
  }
});

var context = canvas.getContext('2d');
socket.on('state', function(players) {
  context.clearRect(0, 0, 800, 600);
  resetGlobals();
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
    context.fill();
    if (players.hasOwnProperty(socket.id)){
      determineCloseness(players, id);
    }
  }
  drawJoinBox(players, closestPlayerInfo.id, context);
});

function determineCloseness(players, otherPlayerId) {
  if (socket.id == otherPlayerId){
    return;
  }
  const distance = Math.sqrt(Math.pow(players[socket.id].x - players[otherPlayerId].x, 2) + 
  Math.pow(players[otherPlayerId].y - players[socket.id].y, 2));
  if ( distance < closestPlayerInfo.distance ) {
    closestPlayerInfo.distance = distance;
    closestPlayerInfo.id = otherPlayerId;
  }
}

function drawJoinBox(players, closestId, context) {
  if ( closestId === -1 ) {
    return;
  }
  drawBubble(context, players[closestId].x, players[closestId].y + 10, 100, 100, 25);
  drawJoinButton(context, players[closestId].x + 5, players[closestId].y + 100-20, 40, 20);
  currentAcceptBox.x = players[closestId].x + 5;
  currentAcceptBox.y = players[closestId].y + 100-20
  currentAcceptBox.width = 40;
  currentAcceptBox.height = 20;
}

function drawBubble(ctx, x, y, w, h, radius) {
  var r = x + w;
  var b = y + h;
  ctx.beginPath();
  ctx.strokeStyle="black";
  ctx.lineWidth="2";
  ctx.moveTo(x+radius, y);
  ctx.lineTo(x+radius/2, y-10);
  ctx.lineTo(x+radius * 2, y);
  ctx.lineTo(r-radius, y);
  ctx.quadraticCurveTo(r, y, r, y+radius);
  ctx.lineTo(r, y+h-radius);
  ctx.quadraticCurveTo(r, b, r-radius, b);
  ctx.lineTo(x+radius, b);
  ctx.quadraticCurveTo(x, b, x, b-radius);
  ctx.lineTo(x, y+radius);
  ctx.quadraticCurveTo(x, y, x+radius, y);
  ctx.stroke();
}

function drawJoinButton(ctx, x, y, w, h) {
  ctx.fillStyle = 'green';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = 'white'
  ctx.font = `${h*.90}px serif`
  ctx.fillText("JOIN", x, y + .75*h);
}

function resetGlobals() {
  closestPlayerInfo.distance = radius;
  closestPlayerInfo.id = -1;
  currentAcceptBox.width = -1;
  currentAcceptBox.height = -1;
} 
