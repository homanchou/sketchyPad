(function($){
  
   $.fn.jsCanvasPaint = function(options){
       var element = this;
       $.jsCanvasPaint.opts = $.extend({}, $.jsCanvasPaint.defaults, options);       
       $.jsCanvasPaint.init(element);
       return element;

  }; //end fn.jsCanvasPaint function

 //http://ross.posterous.com/2008/08/19/iphone-touch-events-in-javascript/
function touchHandler(event)
{
    var touches = event.changedTouches,
        first = touches[0],
        type = "";
         switch(event.type)
    {
        case "touchstart": type ="mousedown"; break;
        case "touchmove":  type="mousemove"; break;        
        case "touchend":   type="mouseup"; break;
        default: return;
    }

             //initMouseEvent(type, canBubble, cancelable, view, clickCount, 
    //           screenX, screenY, clientX, clientY, ctrlKey, 
    //           altKey, shiftKey, metaKey, button, relatedTarget);
    
    var simulatedEvent = document.createEvent("MouseEvents");
        simulatedEvent.initMouseEvent(type, true, true, window, 1, 
                              first.screenX, first.screenY, 
                              first.clientX, first.clientY, false, 
                              false, false, false, 0/*left*/, null);

    first.target.dispatchEvent(simulatedEvent);

    event.preventDefault();
}

  var canvas = undefined; 

  function myPrint(text) {
    $('#drawing_area').append(text);
  }

  function toolStart(e){
    myPrint("start: " + e.offsetX + ", " + e.offsetY);
    canvas[0].addEventListener('mousemove', toolMove, false);
    document.addEventListener('mouseup', toolEnd, false);
  }
  function toolMove(e){
    myPrint("move: " + e.offsetX + ", " + e.offsetY);

  }
  function toolEnd(e){
     myPrint("move listener remove");
    canvas[0].removeEventListener('mousemove', toolMove, false);
  }

  
  $.jsCanvasPaint = {
    
    //default settings
    defaults : {
    },
    
    //options merged with defaults will be set here
    opts: {},


    init: function(element){
      canvas = $('<canvas></canvas>');
      element.append(canvas);
      this.registerEvents();
    },



    registerEvents: function() {

if ('ontouchstart' in window) {

    document.addEventListener("touchstart", touchHandler, true);
    document.addEventListener("touchmove", touchHandler, true);
    document.addEventListener("touchend", touchHandler, true);
    document.addEventListener("touchcancel", touchHandler, true);    

} 
  canvas[0].addEventListener('mousedown', toolStart, false);


/*
$('#myCanvas').bind('mouseup', brushEnd);
$('#myCanvas').bind('mousemove', brushMove);
$('#myCanvas')[0].addEventListener('touchstart',brushStart,false);
$('#myCanvas')[0].addEventListener('touchend',brushEnd,false);
$('#myCanvas')[0].addEventListener('touchmove',brushMove,false);
*/
        
    },
    setTool: function(){
    }
  }

})(jQuery);

