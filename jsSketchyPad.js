//
//create closure
//
(function($){
  
    var offset;
    var currentPoint;
    var top_canvas;
    var opacity;
    var color;
    var brushSize = 1;
    var brush;


    $.fn.sketchyPad = function(options){
      
       //options override defaults
       var opts = $.extend({}, $.fn.sketchyPad.defaults, options);       
                   
       //this jQuery object
       var element = this;
       
       //inject css styling for the canvas to position layers absolutely and to set default cursor
       $.sketchyPad.injectCSS(opts);

       //create drawing area
       $.sketchyPad.createCanvas(element, opts);

       //set all event handling
       $.sketchyPad.registerEvents();
             
       return element;

    }; //end fn.sketchyPad function

 //default settings
    $.fn.sketchyPad.defaults = {
           width: 600,
           height: 600,
           styleSheetPath: 'sketchyPad.css'
    };

    //static functions
    $.sketchyPad = {};
    $.sketchyPad.injectCSS = function(opts) {
          $('head').append('<link rel="stylesheet" href="' + opts.styleSheetPath + '" type="text/css" />');
    };
    $.sketchyPad.createCanvas = function(element, opts) {
        element.append("<canvas id='top' class='sketch_layer' width='"+opts.width+"px' height='"+opts.height+"'></canvas>")
    };
    $.sketchyPad.registerEvents = function() {
         //get the offset in case the window is resized, coordinates are always relative to canvas 
         top_canvas = $('#top');
         offset = top_canvas.offset();

         jQuery(window).resize(function() { offset = top_canvas.offset();  });
         
         //set brush (TODO, expansion to other brushes)
         brush = new simple(top_canvas.get(0).getContext("2d"));

         //track mouse movements
         $(window).bind('mousemove', $.sketchyPad.onWindowMouseMove);
         //canvas detect mouse down -- register more events
         top_canvas.bind('mousedown', $.sketchyPad.onCanvasMouseDown);
    };
    $.sketchyPad.onWindowMouseMove = function(event) {
         lastPoint = currentPoint;
         currentPoint = $.sketchyPad.getBrushPoint(event);
        
    };
    $.sketchyPad.getBrushPoint = function(event) {
       return {x:event.clientX - offset.left + window.pageXOffset, y:event.clientY - offset.top + window.pageYOffset}
    };

    $.sketchyPad.onCanvasMouseDown = function(event) {
      
      //additional handlers bound at window level, that way if pen exits canvas border, we can still receive events
      $(window).bind('mouseup', $.sketchyPad.onWindowMouseUp);
      $(window).bind('mousemove', $.sketchyPad.onCanvasMouseMove);
    
      brush.strokeStart(currentPoint);
    };
    $.sketchyPad.onWindowMouseUp = function(event) {
      brush.strokeEnd();
      $(window).unbind('mouseup', $.sketchyPad.onWindowMouseUp);
      $(window).unbind('mousemove', $.sketchyPad.onCanvasMouseMove);
    };
    $.sketchyPad.onCanvasMouseMove = function(event) {
      brush.stroke(currentPoint);
    };
      

   
// end of closure

})(jQuery);

function simple(context){
  this.init( context );
}
simple.prototype = {
  prevPoint: null,
  context: null,
  init: function(context) {
    this.context = context;
    this.context.globalCompositeOperation = 'source-over';
  },
  strokeStart: function(point) { 
      this.prevPoint = point;
  },
  stroke: function(point) {
      this.context.lineWidth = 2;
      this.context.strokeStyle = "rgba(20, 5, 99, 0.9)";
      this.context.beginPath();
      this.context.moveTo(this.prevPoint.x, this.prevPoint.y);
      this.context.lineTo(point.x, point.y);
      this.context.stroke();
      this.prevPoint = point;
  },
  strokeEnd: function() {
  }
};

