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
       element.append("<canvas id='layer1' class='sketch_layer' width='"+$.sketchyPad.opts.width+"' height='"+$.sketchyPad.opts.height+"'>Your browser does not support canvas</canvas>")


       element.append("<canvas id='top' class='sketch_layer' width='"+$.sketchyPad.opts.width+"' height='"+$.sketchyPad.opts.height+"'>Your browser does not support canvas</canvas>")
       top_canvas = $('#top');
       //get the offset in case the window is resized, coordinates are always relative to canvas 
       offset = element.offset();
      
    
    },
    
    setBrush: function(brushType) {
        var context = top_canvas.get(0).getContext("2d");
        brush = eval("new " + brushType + "(context)");    
    },

    setColor: function(stringOrArray) {
        if (typeof(stringOrArray)=='string') {
          //TODO support comma delimited string or hexidecial with # or without #
          var string = stringOrArray;
          if (string.charAt(0) == "#") {
            string = string.substring(1,7);
          }
          var r = parseInt(string.substring(0,2),16);
          var g = parseInt(string.substring(2,4),16);
          var b = parseInt(string.substring(4,6),16);

          $.sketchyPad.opts.color = [r,g,b];

        } else {
          $.sketchyPad.opts.color = stringOrArray;
        }
    },

    getColor: function() {
       var color = $.sketchyPad.opts.color;
       return '#'+$.sketchyPad.toHex(color[0])+$.sketchyPad.toHex(color[1])+$.sketchyPad.toHex(color[2]);
    },

    toHex: function(n) {
       n = parseInt(n,10);
       if (isNaN(n)) return "00";
       n = Math.max(0,Math.min(n,255));
       return "0123456789ABCDEF".charAt((n-n%16)/16) + "0123456789ABCDEF".charAt(n%16);
    },   
    setBrushSize: function(brushSize) {
      $.sketchyPad.opts.brushSize = brushSize;
    },

    setOpacity: function(opacity) {
        $.sketchyPad.opts.opacity = opacity;
    },

    registerEvents: function() {


         $(window).resize(function() { offset = top_canvas.offset();  });
         
         //track mouse movements
         $(window).bind('mousemove', $.sketchyPad.onWindowMouseMove);
         //canvas detect mouse down -- register more events
         top_canvas.bind('mousedown', $.sketchyPad.onCanvasMouseDown);
    },
    
    onWindowMouseMove: function(event) {
 
         currentPoint = $.sketchyPad.getBrushPoint(event);
        
    },
    
    getBrushPoint: function(event) {
       return {x:event.clientX - offset.left + window.pageXOffset, y:event.clientY - offset.top + window.pageYOffset}
    },

    onCanvasMouseDown: function(event) {
      
      //additional handlers bound at window level, that way if pen exits canvas border, we can still receive events
      $(window).bind('mouseup', $.sketchyPad.onWindowMouseUp);
      $(window).bind('mousemove', $.sketchyPad.onCanvasMouseMove);
    
      brush.strokeStart(currentPoint, $.sketchyPad.opts);
    },

    onWindowMouseUp: function(event) {
      brush.strokeEnd(currentPoint, $.sketchyPad.opts);
      $(window).unbind('mouseup', $.sketchyPad.onWindowMouseUp);
      $(window).unbind('mousemove', $.sketchyPad.onCanvasMouseMove);
    },
    
    onCanvasMouseMove: function(event) {
      brush.stroke(currentPoint, $.sketchyPad.opts);
    }
      
 }; //end overridable functions
   
// end of closure

})(jQuery);

