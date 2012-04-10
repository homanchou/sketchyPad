const REV=1;
var SCREEN_WIDTH=window.innerWidth;
var container, canvas;
var SCREEN_HEIGHT=window.innerHeight;
var toolX, toolY, toolSpeed, prevtoolX, prevtoolY, time, prevTime;
var touchEnabled = ('ontouchstart' in window);
var toolTotalData = []; //save each stroke
var toolStrokeData, toolInUse;

function dataToCanvas(data){
  var context = canvas.getContext('2d');
  context.beginPath();
  context.moveTo(data[0].x, data[0].y);

  for (var i = 1; i < data.length; i++) {
    context.lineTo(data[i].x, data[i].y);
  }
  context.stroke();
}

function init() {
  container = document.createElement("div");
  document.body.appendChild(container);
  canvas = document.createElement("canvas");
  canvas.width = SCREEN_WIDTH;
  canvas.height = SCREEN_HEIGHT;
  canvas.style.cursor = "crosshair";
  container.appendChild(canvas);
}

function onToolStart(e){
  if (touchEnabled) {
    toolX = e.touches[0].pageX;
    toolY = e.touches[0].pageY;
  } else {
    toolX = e.clientX;
    toolY = e.clientY;
  }
  time = (new Date()).getTime();
  toolStrokeData = [];
  toolInUse = true;
//  $('canvas').css('background-color','red');
}

function onToolEnd(e){
  toolTotalData.push(toolStrokeData);
//  $('canvas').css('background-color','white');
  dataToCanvas(toolStrokeData);
  toolInUse = false;
}

function onToolMove(e) {
    e.preventDefault(); //prevent overscroll
    if (toolInUse == false) { return; }

    prevtoolX = toolX;
    prevtoolY = toolY;
    prevTime = time;

    if (touchEnabled) { 
      toolX = e.touches[0].pageX
      toolY = e.touches[0].pageY
    } else {
      toolX = e.clientX;
      toolY = e.clientY;
    } 

    time = (new Date()).getTime();
    
    var deltaX = Math.abs(toolX - prevtoolX);
    var deltaY = Math.abs(toolY - prevtoolY);
    var deltaTime = time - prevTime;
    var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    toolSpeed = 1000 * distance / deltaTime;
    console.log("x: " + toolX + ", y: " + toolY + " deltaX: " + deltaX + " deltaY: " + deltaY + " deltaTime: " + deltaTime +
      " distance: " + distance + " speed: " + toolSpeed);
    toolStrokeData.push({x:toolX,y:toolY,speed:toolSpeed});
}


function jsCanvasPaint(){
  init();
  if (touchEnabled) {
    window.addEventListener("touchstart", onToolStart, false);
    window.addEventListener("touchend", onToolEnd, false);
    window.addEventListener("touchmove", onToolMove, false);
  } else {
    window.addEventListener("mouseup", onToolEnd, false);
    window.addEventListener("mousedown", onToolStart, false);
    window.addEventListener("mousemove", onToolMove, false);
  }
}

