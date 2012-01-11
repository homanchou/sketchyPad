//
//create closure
//
(function($){
  
  var element; //container element (jQuery object), used to append canvas element(s)
  var offset; //set with top_canvas.offset() each time window is resized
  var brush;

  $.fn.sketchyPad = function(options){
      
       //options override defaults
       $.sketchyPad.opts = $.extend({}, $.sketchyPad.defaults, options);       
              
       element = this; 
       //add some stylings required by sketchyPad
       $.sketchyPad.injectCSS();
       //inject canvas elements into the page with stylings to line them up
       $.sketchyPad.createLayers();
       
       offset = element.offset();
       
       //instantiate the brush classes
       $.sketchyPad.initializeBrushes();

       //restore or set color, brushsize, brushtype, opacity from localStorage
       $.sketchyPad.initLocalStorage();
       //event listeners
       $.sketchyPad.registerEvents();
       return element;

  }; //end fn.sketchyPad function


    //overridable static functions 
  $.sketchyPad = {
    
    //default settings as well as any variables that need to be accessible to public
    defaults : {
       width: 600,
       height: 600,
       styleSheetPath: 'sketchyPad.css',
       brushSize: 2,
       opacity: 0.7,
       color: '#454545',
       currentPoint: undefined,
       interactiveLayer: undefined,
       brushTypes:[],
       brushes:{},
       redoBuffer:[],
       undoBuffer:[],
       currentBuffer:{},
       numOfLayers:3,
       layerIdPrefix: 'sketchypad_layer_',
       currentLayerId: undefined,
       interactiveLayerId: 'sketchypad_interactive_layer',
       canvasClassName: 'sketchypad_sketch_layer',
       maxNumOfUndos: 50,
    },
    
    //options merged with defaults will be set here
    opts: {},

    injectCSS: function() {
        $('head').append('<link rel="stylesheet" href="' + $.sketchyPad.opts.styleSheetPath + '" type="text/css" />');
    },
    
    createLayers: function() {

       var zIndex = $.sketchyPad.opts.numOfLayers * 10;
       element.append("<canvas id='"+$.sketchyPad.opts.interactiveLayerId+"' class='"+$.sketchyPad.opts.canvasClassName+"' style='z-index:"+(zIndex+10)+"' width='"+$.sketchyPad.opts.width+"' height='"+$.sketchyPad.opts.height+"'>Your browser does not support canvas</canvas>")
 
       for (var i = 0; i < $.sketchyPad.opts.numOfLayers; i++) {
          var layer_id = "sketchypad_layer_" + i;
          element.append("<canvas id='"+layer_id+"' class='"+$.sketchyPad.opts.canvasClassName+"' style='z-index:"+zIndex+"' width='"+$.sketchyPad.opts.width+"' height='"+$.sketchyPad.opts.height+"'>Your browser does not support canvas</canvas>")
          zIndex -= 10; 
       }
       $.sketchyPad.opts.currentLayerId = $.sketchyPad.opts.layerIdPrefix + '0';

    
    },
    getCurrentLayer: function() {
      return $("#"+$.sketchyPad.opts.currentLayerId);
    },
    setCurrentLayer: function(id) {
      var layer = $("#"+id);
      if (layer.length == 0) {
        alert("Invalid layer id");
      }
      $.sketchyPad.opts.currentLayerId = layer.attr('id');
    },
    getRGBA: function() {
        var color = $.sketchyPad.opts.color;
        var opacity = $.sketchyPad.opts.opacity;
        if (color.charAt(0) == '#') {
          color = color.substring(1,7);
        }
        return "rgba("+parseInt(color.substring(0,2),16)+","+parseInt(color.substring(2,4),16)+","+parseInt(color.substring(4,6),16)+","+opacity+")";
    },
    registerBrushType: function(brushType){
       try {
         var b = eval("new " + brushType + "()");   
         $.sketchyPad.opts.brushes[brushType] = b;
         brush = b;
       } catch(e) {
         alert("Error evaluating brush:" + brushType + " " + e);
       }
    },
    initializeBrushes: function() {
      for(var i=0; i < $.sketchyPad.opts.brushTypes.length; i++) {
        $.sketchyPad.registerBrushType($.sketchyPad.opts.brushTypes[i]);
      }
    },
    setBrushType: function(brushType) {
       //find the brush
       var b = $.sketchyPad.opts.brushes[brushType];
       if (b) {
         localStorage.sketchypad_brush_type = brushType;
         brush = b;
       } else {
         alert('Invalid BrushType');
       }
    },

    getBrushType: function() {
      return localStorage.sketchypad_brush_type;
    },
    setColor: function(color) {
      localStorage.sketchypad_color = color;
      $.sketchyPad.opts.color = color;
    },

    getColor: function() {
       
       var color = $.sketchyPad.opts.color;
       if (color.length == 6) {
           return "#" + color;
        }
        return color;
    },
    undo: function() {
      var canvas = $.sketchyPad.opts.undoBuffer.pop();
      if (canvas) {
        //push current state into redo Buffer for the canvas-layer we are undo'ing
        $.sketchyPad.opts.redoBuffer.push($.sketchyPad.opts.currentBuffer[canvas.getAttribute('data-layer-id')]);
        //set new current state into the canvas we just poppped
        $.sketchyPad.opts.currentBuffer[canvas.getAttribute('data-layer-id')] = canvas;
        $.sketchyPad.applyCanvasFromBuffer(canvas);
        return $.sketchyPad.opts.undoBuffer.length;
      } else {
        return false;
      }
    },
    applyCanvasFromBuffer: function(canvas) {
      var layer = $("#"+canvas.getAttribute('data-layer-id'));
      var ctx = layer.get(0).getContext("2d");
      ctx.clearRect ( 0 , 0 , $.sketchyPad.opts.width, $.sketchyPad.opts.height );
      ctx.drawImage(canvas, 0, 0);
    },
    redo: function() {
      var canvas = $.sketchyPad.opts.redoBuffer.pop();
      if (canvas) {
        $.sketchyPad.opts.undoBuffer.push($.sketchyPad.opts.currentBuffer[canvas.getAttribute('data-layer-id')]);
        $.sketchyPad.opts.currentBuffer[canvas.getAttribute('data-layer-id')] = canvas;

        $.sketchyPad.applyCanvasFromBuffer(canvas);
        return $.sketchyPad.opts.redoBuffer.length;
      } else {
        return false;
      }
    },
    captureCurrentCanvas: function() {
      var c = document.createElement('canvas');
      c.width  = $.sketchyPad.opts.width;
      c.height = $.sketchyPad.opts.height;
      c.setAttribute('data-layer-id', $.sketchyPad.opts.currentLayerId);
      c.getContext('2d').drawImage($.sketchyPad.getCurrentLayer().get(0).getContext("2d").canvas,0,0);
      return c;
    },
    saveCanvasForRedo: function() {
      $.sketchyPad.opts.currentBuffer[$.sketchyPad.opts.currentLayerId] = $.sketchyPad.captureCurrentCanvas();
     
    },
    saveCanvasForUndo: function() {
      var c = $.sketchyPad.captureCurrentCanvas();
      if ($.sketchyPad.opts.undoBuffer.length == $.sketchyPad.opts.maxNumOfUndos) {
        $.sketchyPad.opts.undoBuffer.shift();
      }
      $.sketchyPad.opts.undoBuffer.push(c);
      $.sketchyPad.opts.redoBuffer = [];
    },
   
    currentLayerToString: function() {
      
      var canvas = $.sketchyPad.getCurrentLayer().get(0);
      var type = "image/png";
      return canvas.toDataURL(type);
          
    },
    toString: function() {
      //merge all the layers
      var m = document.createElement('canvas');
      m.width  = $.sketchyPad.opts.width;
      m.height = $.sketchyPad.opts.height;
      var mc = m.getContext('2d');
      
      //collect all the canvas
      $("canvas."+$.sketchyPad.opts.canvasClassName).sort(function(a,b){return (a.style.zIndex - b.style.zIndex)}).each(function(){
          var c = $(this);
          mc.drawImage(c.get(0).getContext("2d").canvas, 0, 0);
      });

      return m.toDataURL("image/png").replace('data:image/png;base64,', '');

      //take a peek
      //var img = document.createElement('img');
      //img.setAttribute('src', mc.canvas.toDataURL());
      //console.log(img);


     // return $.sketchyPad.currentLayerToString().replace('data:image/png;base64,', '');

    }
    ,
    toHex: function(n) {
       n = parseInt(n,10);
       if (isNaN(n)) return "00";
       n = Math.max(0,Math.min(n,255));
       return "0123456789ABCDEF".charAt((n-n%16)/16) + "0123456789ABCDEF".charAt(n%16);
    },   
    setBrushSize: function(brushSize) {
      localStorage.sketchypad_brush_size = brushSize;
      $.sketchyPad.opts.brushSize = brushSize;
    },

    getBrushSize: function() {
      return localStorage.sketchypad_brush_size;
    },

    setOpacity: function(opacity) {
        localStorage.sketchypad_opacity = opacity;
        $.sketchyPad.opts.opacity = opacity;
    },

    getOpacity: function() {
      return localStorage.sketchypad_opacity;
    },

    registerEvents: function() {


         $(window).resize(function() { offset = $.sketchyPad.getInteractiveLayer().offset();  });
         
         //track mouse movements
         $(window).bind('mousemove', $.sketchyPad.onWindowMouseMove);
         //canvas detect mouse down -- register more events
         $.sketchyPad.getInteractiveLayer().bind('mousedown', $.sketchyPad.onCanvasMouseDown);
         $.sketchyPad.getInteractiveLayer().bind('mousemove', $.sketchyPad.drawCursor);
         $.sketchyPad.getInteractiveLayer().bind('mouseout', $.sketchyPad.clearAndReturnInteractiveLayerContext);

    },
    
    onWindowMouseMove: function(event) {
      //um.... why do we need currentPoint for?  when we have getBrushPoint?
      //because the function cannot be called within brush, it has no event context
         $.sketchyPad.opts.currentPoint = $.sketchyPad.getBrushPoint(event);
        
    },
    getInteractiveLayer: function() {
      return $("#"+$.sketchyPad.opts.interactiveLayerId);
    },
    getInteractiveLayerContext: function() {
      
      return $.sketchyPad.getInteractiveLayer().get(0).getContext('2d');
    },
    clearAndReturnInteractiveLayerContext: function() {
      var interActiveLayerContext = $.sketchyPad.getInteractiveLayerContext();
      interActiveLayerContext.clearRect(0, 0, $.sketchyPad.opts.width, $.sketchyPad.opts.height);
      return interActiveLayerContext;
    },
    drawCursor: function() {
    
      var upper = $.sketchyPad.clearAndReturnInteractiveLayerContext();
      var new_point = $.sketchyPad.opts.currentPoint;
      if (new_point) {
          
        upper.strokeStyle=$.sketchyPad.getColor();
        upper.lineCap = "round";
        upper.lineWidth = 1;

        upper.fillStyle=$.sketchyPad.getRGBA();
        upper.beginPath();
        upper.arc(new_point.x, new_point.y,parseInt($.sketchyPad.getBrushSize())/2, 0, Math.PI * 2, true);
        upper.stroke(); 
        upper.closePath();
        upper.fill();
     
      }
    },
    
    getBrushPoint: function(event) {
       return {x:event.clientX - offset.left + window.pageXOffset, y:event.clientY - offset.top + window.pageYOffset}
    },

    onCanvasMouseDown: function(event) {
      $.sketchyPad.getInteractiveLayer().unbind('mousemove', $.sketchyPad.drawCursor);
      $.sketchyPad.clearAndReturnInteractiveLayerContext();
      //additional handlers bound at window level, that way if pen exits canvas border, we can still receive events
      $(window).bind('mouseup', $.sketchyPad.onWindowMouseUp);
      $(window).bind('mousemove', $.sketchyPad.onCanvasMouseMove);

      $.sketchyPad.saveCanvasForUndo();
      brush.strokeStart();
    },

    onWindowMouseUp: function(event) {
      brush.strokeEnd();
      $.sketchyPad.saveCanvasForRedo();

      $(window).unbind('mouseup', $.sketchyPad.onWindowMouseUp);
      $(window).unbind('mousemove', $.sketchyPad.onCanvasMouseMove);
      $.sketchyPad.getInteractiveLayer().bind('mousemove', $.sketchyPad.drawCursor);      
    },
    
    onCanvasMouseMove: function(event) {
      brush.stroke();
    },

    initLocalStorage: function() {
       $.sketchyPad.setColor(localStorage.sketchypad_color || $.sketchyPad.opts.color);
       $.sketchyPad.setBrushType(localStorage.sketchypad_brush_type || $.sketchyPad.opts.brushType);
       $.sketchyPad.setBrushSize(localStorage.sketchypad_brush_size || $.sketchyPad.opts.brushSize);
       $.sketchyPad.setOpacity(localStorage.sketchypad_opacity || $.sketchyPad.opts.opacity);
    }
      
 }; //end overridable functions
   
// end of closure

})(jQuery);

