//
//create closure
//
(function($){
  
    var mouseX, mouseY;
    var offset;
    var current_point;
    var points = [];
    var top_canvas;
    var brush;


    $.fn.sketchyPad = function(options){
      
       //options override defaults
       var opts = $.extend({}, $.fn.sketchyPad.defaults, options);       
                   
       //this jQuery object
       var element = this;
       
       //inject css styling for the canvas to position layers absolutely and to set default cursor
       $.fn.sketchyPad.methods.injectCSS(opts);

       //create drawing area
       $.fn.sketchyPad.methods.createCanvas(element, opts);

       //set all event handling
       $.fn.sketchyPad.methods.registerEvents();
             
       return element;

    }; //end fn.sketchyPad function

 //default settings
    $.fn.sketchyPad.defaults = {
           width: 600,
           height: 600,
           styleSheetPath: 'sketchyPad.css'
    };

    //overridable methods
    $.fn.sketchyPad.methods = {
      injectCSS: function(opts) {
          $('head').append('<link rel="stylesheet" href="' + opts.styleSheetPath + '" type="text/css" />');
      },
      createCanvas: function(element, opts) {
        element.append("<canvas id='top' class='sketch_layer' width='"+opts.width+"px' height='"+opts.height+"'></canvas>")
      },
      registerEvents: function() {
         //get the offset in case the window is resized, coordinates are always relative to canvas 
         top_canvas = $('#top');
         offset = top_canvas.offset();

         jQuery(window).resize(function() { offset = top_canvas.offset();  });
         
         //set brush (TODO, expansion to other brushes)
         brush = new simple();

         //track mouse movements
         $(window).bind('mousemove', $.fn.sketchyPad.methods.onWindowMouseMove);
         //canvas detect mouse down -- register more events
         top_canvas.bind('mousedown', $.fn.sketchyPad.methods.onCanvasMouseDown);
      },
      onWindowMouseMove: function(event) {
         current_point = $.fn.sketchyPad.methods.getBrushPoint(event);
         console.log('window mouse move');
         
      },
      getBrushPoint: function(event) {
         return {x:event.clientX - offset.left + window.pageXOffset, y:event.clientY - offset.top + window.pageYOffset}
      },
      onCanvasMouseDown: function(event) {
        console.log('mouse down');
        //additional handlers bound at window level, that way if pen exits canvas border, we can still receive events
        $(window).bind('mouseup', $.fn.sketchyPad.methods.onWindowMouseUp);
        $(window).bind('mousemove', $.fn.sketchyPad.methods.onCanvasMouseMove);
      },
      onWindowMouseUp: function(event) {
        console.log('mouse up');
      },
      onCanvasMouseMove: function(event) {
        console.log('canvas mouse move');
      }
      
    };


   
// end of closure

})(jQuery);



