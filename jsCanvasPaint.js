const REV=1;
var SCREEN_WIDTH=window.innerWidth;
var container, canvas;
var SCREEN_HEIGHT=window.innerHeight;
var toolX, toolY, toolSpeed, prevtoolX, prevtoolY, time, prevTime;
var touchEnabled = ('ontouchstart' in window);
var toolInUse = false;
var toolUseData = []; //save each stroke
var toolCurrent;

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
  toolX = e.clientX;
  toolY = e.clientY;
  time = (new Date()).getTime();
  toolInUse = true;
  $('canvas').css('background-color','red');
}

function onToolEnd(e){
  toolInUse = false;
  $('canvas').css('background-color','white');

}

function onToolMove(e) {
    e.preventDefault();
    if (toolInUse == false) { return; }

    prevtoolX = toolX;
    prevtoolY = toolY;
    prevTime = time;

    toolX = e.clientX;
    toolY = e.clientY;
    time = (new Date()).getTime();
    
    var deltaX = Math.abs(toolX - prevtoolX);
    var deltaY = Math.abs(toolY - prevtoolY);
    var deltaTime = time - prevTime;
    var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    toolSpeed = 1000 * distance / deltaTime;
    console.log("x: " + toolX + ", y: " + toolY + " deltaX: " + deltaX + " deltaY: " + deltaY + " deltaTime: " + deltaTime +
      " distance: " + distance + " speed: " + toolSpeed);
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

