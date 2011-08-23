(function($){

    $.fn.sketchyPad = function(options){

       var settings = {
           width: 600,
           height: 600

       }

       if ( options ) { 
         $.extend( settings, options );
       }
       

        var element = this;

        console.log(settings);
        return this;
       
    }; //end fn.sketchyPad function

})(jQuery);

