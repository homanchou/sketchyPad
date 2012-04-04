(function($){
  
   $.fn.jsCanvasPaint = function(options){
       var element = this;
       $.jsCanvasPaint.opts = $.extend({}, $.jsCanvasPaint.defaults, options);       
       $.jsCanvasPaint.init(element);
       return element;

  }; //end fn.jsCanvasPaint function


  
  $.jsCanvasPaint = {
    
    //default settings
    defaults : {
       width: 600,
       height: 600,
    },
    
    //options merged with defaults will be set here
    opts: {},
    init: function(element){
      element.append('<canvas></canvas>');
    }
  }

})(jQuery);

