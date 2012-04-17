const REV=1;
var SCREEN_WIDTH=window.innerWidth;
var container, canvas;
var SCREEN_HEIGHT=window.innerHeight;
var toolX, toolY, toolPrevX, toolPrevY, time, prevTime, epochOffset;
var touchEnabled = ('ontouchstart' in window);
var toolMaxX = 0;
var toolMaxY = 0;
var toolMinX = 2000;
var toolMinY = 2000;
var toolInUse = false;
var menuUp = false;
var tools = {};
var currentTool;



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
  epochOffset = (new Date()).getTime();

  updateXY(e);
  time = 0;
  
  currentTool.strokeStart();
}

function onToolEnd(e){
  if (toolInUse == false) { return; }

  console.log('toolend');
//  $('canvas').css('background-color','white');
  toolInUse = false;
  
  currentTool.strokeEnd();

}


function onToolMove(e) {
    console.log('toolmove');
    e.preventDefault(); //prevent overscroll
    if (toolInUse == false) { return; }

    toolPrevX = toolX;
    toolPrevY = toolY;
    updateXY(e);

    prevTime = time;
    time = (new Date()).getTime() - epochOffset;
  
    currentTool.stroke();
}



function jsCanvasPaint(tool_names){

   var tool_list = $('<select id="tool_list"></select>');

   for(var i = 0; i < tool_names.length; i++){
     tools[tool_names[i]] = eval('new ' + tool_names[i] + '()');
     tool_list.append('<option>'+tool_names[i]+'</option>');
   }

  currentTool = tools[tool_names[0]];

  var t = $('<div id="tools"></div>');
  t.append(tool_list);
  t.append('<canvas id="color_palette"></canvas>');
  $('body').append(t);
  $('#tool_list').change(function(e){ 
      var tool_name = $("select option:selected").text();

      currentTool = tools[tool_name]; 
      //menuUp = false;
      //$('#tools').hide();
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

