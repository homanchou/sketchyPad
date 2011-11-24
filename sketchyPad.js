//
//create closure
//
(function($){
  
  var element; //container element (jQuery object), used to append canvas element(s)
  var top_canvas; //the topmost drawing canvas 
  var offset; //set with top_canvas.offset() each time window is resized
  var currentPoint;
  var brush;

  $.fn.sketchyPad = function(options){
      
       //options override defaults
       $.sketchyPad.opts = $.extend({}, $.sketchyPad.defaults, options);       
       
       $.sketchyPad.initLocalStorage();
       
       element = this;
       
       $.sketchyPad.injectCSS();

       $.sketchyPad.createCanvas();

       top_canvas = $('#top');
       
       offset = element.offset();
  
       $.sketchyPad.setBrush($.sketchyPad.opts.brushType);

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
       color: '#FF00FF',
       brushType: "Simple"
    },
    
    //options
    opts: {},

    injectCSS: function() {
        $('head').append('<link rel="stylesheet" href="' + $.sketchyPad.opts.styleSheetPath + '" type="text/css" />');
    },
    
    createCanvas: function() {

       
       element.append("<canvas id='layer5' class='sketch_layer' width='"+$.sketchyPad.opts.width+"' height='"+$.sketchyPad.opts.height+"'>Your browser does not support canvas</canvas>")
       element.append("<canvas id='layer4' class='sketch_layer' width='"+$.sketchyPad.opts.width+"' height='"+$.sketchyPad.opts.height+"'>Your browser does not support canvas</canvas>")
       element.append("<canvas id='layer3' class='sketch_layer' width='"+$.sketchyPad.opts.width+"' height='"+$.sketchyPad.opts.height+"'>Your browser does not support canvas</canvas>")
       element.append("<canvas id='layer2' class='sketch_layer' width='"+$.sketchyPad.opts.width+"' height='"+$.sketchyPad.opts.height+"'>Your browser does not support canvas</canvas>")
       element.append("<canvas id='layer1' class='sketch_layer' width='"+$.sketchyPad.opts.width+"' height='"+$.sketchyPad.opts.height+"'>Your browser does not support canvas</canvas>")


       element.append("<canvas id='top' class='sketch_layer' width='"+$.sketchyPad.opts.width+"' height='"+$.sketchyPad.opts.height+"'>Your browser does not support canvas</canvas>")
     
    
    },
    getRGBA: function() {
        var color = $.sketchyPad.opts.color;
        var opacity = $.sketchyPad.opts.opacity;
        if (color.charAt(0) == '#') {
          color = color.substring(1,7);
        }
        return "rgba("+parseInt(color.substring(0,2),16)+","+parseInt(color.substring(2,4),16)+","+parseInt(color.substring(4,6),16)+","+opacity+")";
    },
    
    setBrush: function(brushType) {
        localStorage.brush_type = brushType;
        var context = top_canvas.get(0).getContext("2d");
        brush = eval("new " + brushType + "(context)");    
    },

    getBrushType: function() {
      return localStorage.brush_type;
    },
    setColor: function(color) {
      localStorage.color = color;
      $.sketchyPad.opts.color = color;
    },

    getColor: function() {
       
       var color = $.sketchyPad.opts.color;
       if (color.length == 6) {
           return "#" + color;
        }
        return color;
       //return '#'+$.sketchyPad.toHex(color[0])+$.sketchyPad.toHex(color[1])+$.sketchyPad.toHex(color[2]);
    },

    toHex: function(n) {
       n = parseInt(n,10);
       if (isNaN(n)) return "00";
       n = Math.max(0,Math.min(n,255));
       return "0123456789ABCDEF".charAt((n-n%16)/16) + "0123456789ABCDEF".charAt(n%16);
    },   
    setBrushSize: function(brushSize) {
      localStorage.brush_size = brushSize;
      $.sketchyPad.opts.brushSize = brushSize;
    },

    getBrushSize: function() {
      return localStorage.brush_size;
    },

    setOpacity: function(opacity) {
        localStorage.opacity = opacity;
        $.sketchyPad.opts.opacity = opacity;
    },

    getOpacity: function() {
      return localStorage.opacity;
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
    
      brush.strokeStart(currentPoint, $.sketchyPad);
    },

    onWindowMouseUp: function(event) {
      brush.strokeEnd(currentPoint, $.sketchyPad);
      $(window).unbind('mouseup', $.sketchyPad.onWindowMouseUp);
      $(window).unbind('mousemove', $.sketchyPad.onCanvasMouseMove);
    },
    
    onCanvasMouseMove: function(event) {
      brush.stroke(currentPoint, $.sketchyPad);
    },

    initLocalStorage: function() {
       //if localStorage is empty
       if (localStorage.color == undefined) {
           //copy brush opts into localStorage
           localStorage.brush_size = $.sketchyPad.opts.brushSize;
           localStorage.opacity = $.sketchyPad.opts.opacity;
           localStorage.color = $.sketchyPad.opts.color;
           localStorage.brush_type = $.sketchyPad.opts.brushType;
       } else {
           //else override brush opts from localStorage
           $.sketchyPad.opts.brushSize = localStorage.brush_size;
           $.sketchyPad.opts.opacity = localStorage.opacity;
           $.sketchyPad.opts.color = localStorage.color;
           $.sketchyPad.opts.brushType = localStorage.brush_type;
       }

    }
      
 }; //end overridable functions
   
// end of closure

})(jQuery);

