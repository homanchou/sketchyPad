const REV=1;
var SCREEN_WIDTH=window.innerWidth;
var SCREEN_HEIGHT=window.innerHeight;
var RGB=[20,20,20];
var container, canvas, staging, color_palette, color_palette_canvas, color_palette_ctx;
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
var colorPicking = false;



function addFullScreenCanvas(id) {
  var c = document.createElement("canvas");
  c.width = SCREEN_WIDTH;
  c.height = SCREEN_HEIGHT;
  c.id = id;
  container.appendChild(c);
  return c
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
function relativeCoordinate(e) {
  
    if (e.offsetX) {
        // Works in Chrome / Safari (except on iPad/iPhone)
        return { x: e.offsetX, y: e.offsetY };
    }
    else if (e.layerX) {
        // Works in Firefox
        return { x: e.layerX, y: e.layerY };
    }
    else {
        // Works in Safari on iPad/iPhone
        var cp = document.getElementById("color_palette");
        return { x: e.pageX - cp.offsetLeft, y: e.pageY - cp.offsetTop };
    }


}

function processColorPicker(e) {
   var point;
   if (touchEnabled) {
     point = relativeCoordinate(e.touches[0]);
   } else {
     point = relativeCoordinate(e);
   }
   var img_data = color_palette_ctx.getImageData(point.x, point.y, 1, 1).data;
   RGB = [img_data[0],img_data[1],img_data[2]];
   var color = 'rgb('+RGB.join(',')+')';
   $('#color_picked').css('background-color',color);
 
}

function onTouchStart(e){
    registerEventToTarget(container, {move:onTouchMove});

    menuClose();

  epochOffset = (new Date()).getTime();

  updateXY(e);
  time = 0;
  
  currentTool.strokeStart();

    /*
  if (e.target.id == 'menu') {
    $('#tools').show();
    menuUp = true;
  } else if ( e.target.id == 'staging') {
    menuUp = false;
    $('#tools').hide();
  } else if (e.target.id == 'color_palette') {
    processColorPicker(e);
    return;
  }
  if (menuUp == true) { return; }
  
  toolInUse = true;
  epochOffset = (new Date()).getTime();

  updateXY(e);
  time = 0;
  
  currentTool.strokeStart();*/
}

function onTouchEnd(e){
   currentTool.strokeEnd();
   deregisterEventToTarget(container, {move:onTouchMove});
 /*
  if (toolInUse == false) { return; }

  console.log('toolend');
//  $('canvas').css('background-color','white');
  toolInUse = false;
  
  currentTool.strokeEnd();*/

}


function onTouchMove(e) {
    e.preventDefault(); //prevent overscroll
    toolPrevX = toolX;
    toolPrevY = toolY;
    updateXY(e);

    prevTime = time;
    time = (new Date()).getTime() - epochOffset;
  
    currentTool.stroke();
    /*
    console.log('toolmove');
    e.preventDefault(); //prevent overscroll
    console.log(e);
    if (e.target.id == "color_palette") {
      processColorPicker(e);
      return;
    }
    

    if (toolInUse == false) { return; }

    toolPrevX = toolX;
    toolPrevY = toolY;
    updateXY(e);

    prevTime = time;
    time = (new Date()).getTime() - epochOffset;
  
    currentTool.stroke();*/
}

function loadColorPaletteData() {
//load image into color picker based on the css
  color_palette = document.getElementById('color_palette');
  var img = new Image();
  
  var url = $('#color_palette').css('background-image');
  img.src = url.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');

// Copy image (img) to canvas
  img.onload = function() {
    color_palette_canvas = document.createElement('canvas');
    color_palette_ctx = color_palette_canvas.getContext('2d');
    color_palette_canvas.width  = img.width;
    color_palette_canvas.height = img.height;
    color_palette_ctx.drawImage(img,0,0);
  }
  $('#color_picked').css('background-color','rgb('+RGB.join(',')+')');

}

function initTools(tool_names) {
   
   var menu_icon = $('<div id="menu_icon"></div>');

   var menu_expanded = $('<div id="menu_expanded"></div>');
   var tool_list = $('<select id="tool_list"></select>');

   for(var i = 0; i < tool_names.length; i++){
     tools[tool_names[i]] = eval('new ' + tool_names[i] + '()');
     tool_list.append('<option>'+tool_names[i]+'</option>');
   }

  currentTool = tools[tool_names[0]];
  menu_expanded.append(tool_list);
  menu_expanded.append($('<div id="color_palette"></div>'));
  menu_expanded.append($('<div id="color_picked"></div>'));

  $('body').append(menu_expanded);
  $('body').append(menu_icon);

//bind tool selection

  $('#tool_list').change(function(e){ 
      var tool_name = $("select option:selected").text();
      currentTool = tools[tool_name]; 
  });


  loadColorPaletteData();  


}

function initCanvas(){
  container = document.createElement("div");
  container.id = "container";
  document.body.appendChild(container);
  canvas = addFullScreenCanvas("canvas");
  staging = addFullScreenCanvas("staging");
  
}

function menuOpen() {
  $('#menu_expanded').show();
}
function menuClose(){
  $('#menu_expanded').hide();
}



function jsCanvasPaint(tool_names){

  initTools(tool_names);
  initCanvas();
  
  registerEventToTarget(color_palette, {start:colorPickStart,end:colorPickEnd});
  registerEventToTarget(container, {start:onTouchStart,end:onTouchEnd});
  registerEventToTarget(document.getElementById('menu_icon'), {start:menuOpen});

 
}
function registerEventToTarget(target_el,functions) {
    if (!target_el) {
      console.log("target_element not defined?" + target_el);
    }
    if (touchEnabled){
        if (functions.start) {
          target_el.addEventListener('touchstart', functions.start, false);
        }
        if (functions.move) {
          target_el.addEventListener('touchmove', functions.move, false);
        }
        if (functions.end) {
          target_el.addEventListener('touchend', functions.end, false);
        }
    } else {
        if (functions.start) {
          target_el.addEventListener('mousedown', functions.start, false);
        }
        if (functions.move) {
          target_el.addEventListener('mousemove', functions.move, false);
        }
        if (functions.end) {
          target_el.addEventListener('mouseup', functions.end, false);
        }
    }

}
function deregisterEventToTarget(target_el,functions) {
    if (touchEnabled){
        if (functions.start) {
          target_el.removeEventListener('touchstart', functions.start, false);
        }
        if (functions.move) {
          target_el.removeEventListener('touchmove', functions.move, false);
        }
        if (functions.end) {
          target_el.removeEventListener('touchend', functions.end, false);
        }
    } else {
        if (functions.start) {
          target_el.removeEventListener('mousedown', functions.start, false);
        }
        if (functions.move) {
          target_el.removeEventListener('mousemove', functions.move, false);
        }
        if (functions.end) {
          target_el.removeEventListener('mouseup', functions.end, false);
        }
    }

}


function colorPickStart(e){
   registerEventToTarget(color_palette, {move:colorPickMove});
   processColorPicker(e);
}

function colorPickMove(e) {
    processColorPicker(e);
}

function colorPickEnd(e) {
   deregisterEventToTarget(color_palette, {move:colorPickMove});  
}

