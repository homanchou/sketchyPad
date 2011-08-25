
sketchyPad: jQuery drawing pad plug-in
=======================================

sketchyPad is a [jQuery](http://jquery.com/) plug-in that enables drawing/painting lines
right in your web browser. 

Basic Usage
-----------

1) a. include sketchyPad.js in your HTML:
      
      <script type="text/javascript" src="sketchyPad.js"></script>

   b. include any brushes you want to use.

      <script type="text/javascript" src="simple.js"></script>

2) Add a placeholder div give it an ID:

     <div id="drawing_container"></div>

3) Add a `ready()` handler to the document which and append the drawing canvas
    into the placeholder with the following syntax:

    <script type="text/javascript">
      $(document).ready(function() {
        $("#drawing_container").sketchyPad();
      });
    </script>

 
See `example/index.html` for an example.


Advanced Usage
--------------

### Override defaults by passing options:

    jQuery("#drawing_container").sketchyPad({
    //options
      width:600,
      height:600
    });

Or reset plugin options by redefining defaults:

    jQuery.sketchyPad.defaults = {
      width: 800,
      height: 400
      /* ... */
    }

jQuery('#my_drawing_pad').sketchyPad(); //will use the new defaults

After invoking sketchyPad you can continue to set color, opacity, brushSize using setters like this:

### methods

    jQuery.sketchyPad.setBrushSize(5);
    jQuery.sketchyPad.setColor([0,0,0]);
    jQuery.sketchyPad.setBrush("simple");
    jQuery.sketchyPad.setOpacity(0.9);

### switch out color picker

If you prefer another color picker, simply bind the onChange event to the setColor static function.

jQuery.sketchyPad.setColor(...);

### brushes

Create custom brushes by adding your own brush file in brushes folder (see brush samples).

Tested with
-----------

jQuery 1.6.1 & Chrome 13





