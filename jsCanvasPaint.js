const REV=1;
var SCREEN_WIDTH=window.innerWidth;
var container, canvas;
var SCREEN_HEIGHT=window.innerHeight;
var toolX, toolY, toolSpeed, prevtoolX, prevtoolY, time, prevTime;
var touchEnabled = ('ontouchstart' in window);
var toolTotalData = []; //save each stroke
var toolStrokeData, toolInUse;
var toolMaxX = 0;
var toolMaxY = 0;
var toolMinX = 2000;
var toolMinY = 2000;
var toolInUse = false;

function dataToContext(context, data){
  context.lineWidth = 1;
  context.strokeStyle = "rgba(20,20,20,0.1)";
  context.globalCompositeOperation = "source-over"

  context.beginPath();
  context.moveTo(data[0].x, data[0].y);
  for (var i = 1; i < data.length; i++) {
    context.lineTo(data[i].x, data[i].y);
  }
  context.stroke();
}

function playBack(SketchData) {
  for(var i=0; i < SketchData.length; i++) {
    dataToCanvas(SketchData[i]);
  }

}

function addFullScreenCanvas(id) {
  var canvas = document.createElement("canvas");
  canvas.width = SCREEN_WIDTH;
  canvas.height = SCREEN_HEIGHT;
  canvas.id = id;
  container.appendChild(canvas);
  return canvas
}

function init() {
  container = document.createElement("div");
  container.id = "background";
  document.body.appendChild(container);
  canvas = addFullScreenCanvas("canvas");
  staging = addFullScreenCanvas("staging");
}

function updateXY(e){
  if (touchEnabled) {
    toolX = e.touches[0].pageX;
    toolY = e.touches[0].pageY;
  } else {
    toolX = e.clientX;
    toolY = e.clientY;
  }
  
  time = (new Date()).getTime();
  toolMaxX = Math.max(toolMaxX, toolX);
  toolMaxY = Math.max(toolMaxY, toolY);
  toolMinX = Math.min(toolMinX, toolX);
  toolMinY = Math.min(toolMinY, toolY);
}

function onToolStart(e){
  toolStrokeData = [];
  toolInUse = true;
  updateXY(e);
//  $('canvas').css('background-color','red');
}

function onToolEnd(e){
  toolTotalData.push(toolStrokeData);
//  $('canvas').css('background-color','white');
  toolInUse = false;
  var context = canvas.getContext('2d');
  dataToContext(context, toolStrokeData);
  var context = staging.getContext('2d');
  context.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
}

function onToolMove(e) {
    e.preventDefault(); //prevent overscroll
    if (toolInUse == false) { return; }

    prevtoolX = toolX;
    prevtoolY = toolY;
    prevTime = time;

    updateXY(e);
        
    var deltaX = Math.abs(toolX - prevtoolX);
    var deltaY = Math.abs(toolY - prevtoolY);
    var deltaTime = time - prevTime;
    var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    if (distance >= 1) {
    toolSpeed = 1000 * distance / deltaTime;
//    console.log("x: " + toolX + ", y: " + toolY + " deltaX: " + deltaX + " deltaY: " + deltaY + " deltaTime: " + deltaTime +
//      " distance: " + distance + " speed: " + toolSpeed);
  
    toolStrokeData.push({x:toolX,y:toolY,speed:toolSpeed});
    
    stageToolUse(); 
    }
}

function stageToolUse(){
  var context = staging.getContext('2d');
  context.clearRect ( 0 , 0 , SCREEN_WIDTH , SCREEN_HEIGHT );
  dataToContext(context, toolStrokeData);
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

