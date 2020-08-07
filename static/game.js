var socket = io();
var radius = 80;
const urlParams = new URLSearchParams(window.location.search);
const OUN = urlParams.get('OUN');
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


socket.emit('new player', OUN);
setInterval(function() {
  socket.emit('movement', movement);
}, 1000 / 60);

var canvas = document.getElementById('canvas');

canvas.addEventListener('click', function(event) {
  /* if event is within closest dialogue box bounds, fire */
  //fix because margin jazz
  const x = event.clientX - canvas.getBoundingClientRect().left - 5;
  const y = event.clientY - canvas.getBoundingClientRect().top - 5
  if ( 0 < x - currentAcceptBox.x &&  x - currentAcceptBox.x < currentAcceptBox.width &&
       0 < y - currentAcceptBox.y && y- currentAcceptBox.y < currentAcceptBox.height) 
  {
    socket.emit('getOUN', closestPlayerInfo.id);
    socket.on('foundOUN', function(OUN) {
      window.open("https://llnl.webex.com/join/" + OUN, '_blank');
    })
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
      context.fillStyle = "rgb(44, 121, 230)";
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
  context.beginPath();
  context.fillStyle = `rgb(0, 0, 180)`
  context.arc(players[closestId].x, players[closestId].y, 10, 0, 2 * Math.PI);
  context.fill();
  drawBubble(context, players[closestId].x, players[closestId].y + 10, 100, 60, 25);
  drawJoinButton(context, OUN, players[closestId].x + 13, players[closestId].y + 100-77, 70, 35);
  currentAcceptBox.x = players[closestId].x + 13 + 11;
  currentAcceptBox.y = players[closestId].y + 100-77 + 10 + 3;
  currentAcceptBox.width = 70;
  currentAcceptBox.height = 35;
}

function drawBubble(ctx, x, y, w, h, radius) {
  var r = x + w;
  var b = y + h;
  ctx.beginPath();
  ctx.strokeStyle="black";
  ctx.fillStyle = "white";
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
  ctx.fill();
  ctx.stroke();
}

function drawRoundRect(ctx, x, y, width, height, rounded) {
  const radiansInCircle = 2 * Math.PI
  const halfRadians = (2 * Math.PI)/2
  const quarterRadians = (2 * Math.PI)/4  
  
  ctx.beginPath();
  ctx.strokeStyle = 'green'
  ctx.arc(rounded + x, rounded + y, rounded, -quarterRadians, halfRadians, true)
  ctx.lineTo(x, y + height - rounded)
  ctx.arc(rounded + x, height - rounded + y, rounded, halfRadians, quarterRadians, true)  
  ctx.lineTo(x + width - rounded, y + height)
  ctx.arc(x + width - rounded, y + height - rounded, rounded, quarterRadians, 0, true)  
  ctx.lineTo(x + width, y + rounded)  
  ctx.arc(x + width - rounded, y + rounded, rounded, 0, -quarterRadians, true)  
  ctx.lineTo(x + rounded, y)
  ctx.fill();
  ctx.stroke(); 
}

function drawJoinButton(ctx, OUN, x, y, w, h) {
  ctx.fillStyle = 'green';
  drawRoundRect(ctx, x, y, w, h, 5);
  ctx.fillStyle = 'black'
  ctx.font = `${h*.5}px serif`
  ctx.fillText("JOIN " + OUN, x + 2, y + .75*h);
}

function resetGlobals() {
  closestPlayerInfo.distance = radius;
  closestPlayerInfo.id = -1;
  currentAcceptBox.width = -1;
  currentAcceptBox.height = -1;
} 
