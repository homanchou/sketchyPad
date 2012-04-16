const REV=1;
var SCREEN_WIDTH=window.innerWidth;
var container, canvas;
var SCREEN_HEIGHT=window.innerHeight;
var toolX, toolY, toolSpeed, toolPrevX, toolPrevY, time, prevTime;
var touchEnabled = ('ontouchstart' in window);
var toolTotalData = []; //save each stroke
var toolStrokeData;
var toolMaxX = 0;
var toolMaxY = 0;
var toolMinX = 2000;
var toolMinY = 2000;
var toolInUse = false;
var menuUp = false;
var tools = {};
var currentTool;


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
  var m = document.createElement("div");
  m.id = "menu";
  document.body.appendChild(m);
   
 
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
  if (e.target.id == 'menu') {
    $('#tools').show();
    menuUp = true;
  } else if ( e.target.id == 'staging') {
    menuUp = false;
    $('#tools').hide();
  }
  if (menuUp == true) { return; }
  
  toolInUse = true;
  updateXY(e);
  toolStrokeData = [{x:toolX,y:toolY,speed:0}];
  
  currentTool.strokeStart();
}

function onToolEnd(e){
  if (toolInUse == false) { return; }

  console.log('toolend');
//  $('canvas').css('background-color','white');
  toolInUse = false;
  
  currentTool.strokeEnd();

}

//calculates tool speed

function onToolMove(e) {
    console.log('toolmove');
    e.preventDefault(); //prevent overscroll
    if (toolInUse == false) { return; }

    toolPrevX = toolX;
    toolPrevY = toolY;
    prevTime = time;

    updateXY(e);
        
    var deltaX = Math.abs(toolX - toolPrevX);
    var deltaY = Math.abs(toolY - toolPrevY);
    var deltaTime = time - prevTime;
    var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    toolSpeed = Math.ceil(1000 * distance / deltaTime);
//    console.log("x: " + toolX + ", y: " + toolY + " deltaX: " + deltaX + " deltaY: " + deltaY + " deltaTime: " + deltaTime +
//      " distance: " + distance + " speed: " + toolSpeed);
  
    toolStrokeData.push({x:toolX,y:toolY,speed:toolSpeed});
    currentTool.stroke();
}



function jsCanvasPaint(brush_names){

   var tool_list = $('<ul id="tool_list"></ul>');

   for(var i = 0; i < brush_names.length; i++){
     tools[brush_names[i]] = eval('new ' + brush_names[i] + '()');
     tool_list.append('<li>'+brush_names[i]+'</li>');
   }

  currentTool = tools[brush_names[0]];

  var t = $('<div id="tools"></div>');
  t.append(tool_list);
  t.append('<canvas id="color_palette"></canvas>');
  $('body').append(t);
  $('ul#tool_list li').click(function(e){ 
      currentTool = tools[$(this).text()]; 
      menuUp = false;
      $('#tools').hide();
  });

  init(); 

  if (touchEnabled) {
    document.addEventListener("touchstart", onToolStart, false);
    document.addEventListener("touchend", onToolEnd, false);
    document.addEventListener("touchmove", onToolMove, false);
  } else {
    document.addEventListener("mouseup", onToolEnd, false);
    document.addEventListener("mousedown", onToolStart, false);
    document.addEventListener("mousemove", onToolMove, false);
  }

}

