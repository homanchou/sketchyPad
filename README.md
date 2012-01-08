
sketchyPad: jQuery plug-in for drawing with a pen stylus
=========================================================

sketchyPad is a [jQuery](http://jquery.com/) plug-in that enables painting with a stylus into HTML5 canvas. 

Integration
-----------

1) include sketchyPad.js in your HTML:
      
      <script type="text/javascript" src="sketchyPad.js"></script>

2) include any brushes you want to use.  (A "smooth" brush and a "simple" brush are included)

      <script type="text/javascript" src="simple.js"></script>

3) Add a placeholder div give it an ID:

     <div id="drawing_container"></div>

4) Add the drawing canvas into the placeholder with the following syntax:

    <script type="text/javascript">
      $(document).ready(function() {
        $("#drawing_container").sketchyPad();
      });
    </script>

5) Add a color picker and opacity, brush-size sliders.

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

### Methods

    jQuery.sketchyPad.setBrushSize(5);
    jQuery.sketchyPad.setColor('#FFFF00');
    jQuery.sketchyPad.setBrush("Simple");
    jQuery.sketchyPad.setOpacity(0.9);

sketchyPad stores these brush settings in localStorage.  You can retrieve the values with getters to
initialize your custom sliders and color picker on page load.  See example/index.html

### switch out color picker

If you prefer another color picker, simply bind the onChange event to the setColor static function.

    jQuery.sketchyPad.setColor(...);

### brushes

Create custom brushes by adding a class that implements the 4 methods:

1. init
2. strokeStart
3. stroke
4. strokeEnd

include the brush file into the page, create a selector and bind it's onChange event to the `$.sketchyPad.setBrush()` method.


Tested with
-----------

* jQuery 1.6.1, 1.7.1 
* Chrome 13,16


TODO
-----

* Undo levels with layers
* add eye icon for layers, and a widget for that would be conveniently packaged


