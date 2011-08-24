//
//create closure
//
(function($){
  
    var offset;
    var currentPoint;
    var top_canvas;
    var element;
    var brush;

    $.fn.sketchyPad = function(options){
      
       //options override defaults
       $.sketchyPad.opts = $.extend({}, $.sketchyPad.defaults, options);       
                   
       //this jQuery object
       element = this;
       
       //inject css styling for the canvas to position layers absolutely and to set default cursor
       $.sketchyPad.injectCSS();

       //create drawing area
       $.sketchyPad.createCanvas();

       //initialize default brushType
       $.sketchyPad.setBrush($.sketchyPad.opts.defaultBrushType);

       //set all event handling
       $.sketchyPad.registerEvents();
             
       return element;

    }; //end fn.sketchyPad function


    //overridable static functions 
  $.sketchyPad = {
    
    //default settings
    defaults : {
         width: 600,
         height: 600,
         styleSheetPath: 'sketchyPad.css',
         brushSize: 1,
         opacity: 0.9,
         color: [0,0,0],
         defaultBrushType: "simple"
    },

    //options
    opts: {},

    injectCSS: function() {
        $('head').append('<link rel="stylesheet" href="' + $.sketchyPad.opts.styleSheetPath + '" type="text/css" />');
    },
    
    createCanvas: function() {
       element.append("<canvas id='top' class='sketch_layer' width='"+$.sketchyPad.opts.width+"px' height='"+$.sketchyPad.opts.height+"'></canvas>")
       top_canvas = $('#top');
       //get the offset in case the window is resized, coordinates are always relative to canvas 
       offset = top_canvas.offset();
    },
    
    setBrush: function(brushType) {
        var context = top_canvas.get(0).getContext("2d");
        brush = eval("new " + brushType + "(context)");    
    },

    setColor: function(stringOrArray) {
        
    },

    setBrushSize: function(brushSize) {
      console.log(this);
    },

    setOpacity: function(opacity) {
    },

    registerEvents: function() {


         $(window).resize(function() { offset = top_canvas.offset();  });
         
         //track mouse movements
         $(window).bind('mousemove', $.sketchyPad.onWindowMouseMove);
         //canvas detect mouse down -- register more events
         top_canvas.bind('mousedown', $.sketchyPad.onCanvasMouseDown);
    },
    
    onWindowMouseMove: function(event) {
         lastPoint = currentPoint;
         currentPoint = $.sketchyPad.getBrushPoint(event);
        
    },
    
    getBrushPoint: function(event) {
       return {x:event.clientX - offset.left + window.pageXOffset, y:event.clientY - offset.top + window.pageYOffset}
    },

    onCanvasMouseDown: function(event) {
      
      //additional handlers bound at window level, that way if pen exits canvas border, we can still receive events
      $(window).bind('mouseup', $.sketchyPad.onWindowMouseUp);
      $(window).bind('mousemove', $.sketchyPad.onCanvasMouseMove);
    
      brush.strokeStart(currentPoint);
    },

    onWindowMouseUp: function(event) {
      brush.strokeEnd();
      $(window).unbind('mouseup', $.sketchyPad.onWindowMouseUp);
      $(window).unbind('mousemove', $.sketchyPad.onCanvasMouseMove);
    },
    
    onCanvasMouseMove: function(event) {
      brush.stroke(currentPoint);
    }
      
    }; //end overridable functions
   
// end of closure

})(jQuery);

