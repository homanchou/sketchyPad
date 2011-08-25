
Farbtastic: jQuery color picker plug-in
=======================================

Farbtastic is a [jQuery](http://jquery.com/) plug-in that can add one or more
color picker widgets into a page. Each widget is then linked to an existing
element (e.g. a text field) and will update the element's value when a color is
selected.

Farbtastic 1 uses *layered transparent PNGs* to render a saturation/luminance
gradient inside of a hue circle. No Flash or pixel-sized divs are used.

Farbtastic 2 uses *the html5 canvas element* to render a saturation/luminance
gradient inside of a hue circle. In order to work with Internet Explorer, which
does not currently support the canvas element, [Explorer Canvas](http://code.google.com/p/explorercanvas)
is needed to translate the canvas usage into features native to Internet Explorer.

**Notice:** *The 2.x branch is under development and considered not production
ready. If you are interested in a production tested version see the 1.x branch.*

Farbtastic was originally written by [Steven Wittens](http://acko.net/) and is
licensed under the GPL.

Basic Usage
-----------

1) a. Farbtastic 2: include farbtastic.js in your HTML:
   
      <script type="text/javascript" src="farbtastic.js"></script>

   b. Farbtastic 1: include farbtastic.js and farbtastic.css in your HTML:
   
      <link rel="stylesheet" type="text/css" href="farbtastic.css"/>
      <script type="text/javascript" src="farbtastic.js"></script>

2) Add a placeholder div and a text field to your HTML, and give each an ID:

    <form><input type="text" id="color" name="colorValue" value="#123456" /></form>
    <div id="colorpicker"></div>

3) Add a `ready()` handler to the document which initializes the color picker
   and link it to the text field with the following syntax:

    <script type="text/javascript">
      $(document).ready(function() {
        $("#colorpicker").farbtastic({callback: "#color");
      });
    </script>

   or you can use second method:

    <script type="text/javascript">
      $(document).ready(function() {
        $.farbtastic.init($("#colorpicker"), {callback: "#color");
      });
    </script>

See `demo/[version]/demo.html` for an example.

Advanced Usage
--------------

### jQuery Method

	$(placeholder).farbtastic()
	$(placeholder).farbtastic(callback)

This creates color pickers in the selected objects. `callback` is optional and
can be a:

* DOM Node, jQuery object or jQuery selector: the color picker will be linked to
  the selected element(s) by syncing the value (for form elements) and color
  (all elements).
* Function: this function will be called whenever the user chooses a different
  color.

### Object

	$.farbtastic.init($(placeholder))
	$.farbtastic.init($(placeholder), callback)

Invoking `$.farbtastic.init($(placeholder))` is the same as using `$(placeholder).farbtastic()`.
After initialization Farbtastic object available through $(placeholder).data("farbtastic").
This allows you to use the Farbtastic methods and properties below.

**Note** that there is only one Farbtastic object per placeholder. If you call
`$.farbtastic.init($(placeholder))` twice with the same placeholder, you will get the
same object back each time.

The optional callback argument behaves exactly as for the jQuery method.

### Methods

`.linkTo(callback)` - Allows you to set a new callback. Any existing callbacks
  are removed. See above for the meaning of callback.

`.setColor(string)` - Sets the picker color to the given color in hex representation.

`.setColor([h, s, l])` - Sets the picker color to the given color in normalized
  HSL (0..1 scale).

### Properties

`.linked` - The elements (jQuery object) or callback function this picker is
  linked to.

`.color` - Current color in hex representation.

`.hsl` - Current color in normalized HSL.

### Options

	$(placeholder).farbtastic(options)

	or

	$.farbtastic.init($(placeholder), options)

Farbtastic provides the ability to pass in other options beyond a callback.
The possible options are:

* callback: the callback as described previously
* color: set color at begining
* height: the height of the widget
* width: the width of the widget

An example usage would be `$(placeholder).farbtastic({ callback: "#color2", width: 150 })`.

Farbtastic 1: Styling
---------------------

The color picker is a block-level element and is 195x195 pixels large. You can
control the position by styling your placeholder (e.g. floating it).

**Note** that the black/white gradients inside wheel.png and mask.png were generated
programmatically and cannot be recreated easily in an image editing program.

Tested with
-----------

jQuery 1.5.1 & Chrome 10, Firefox 4, Opera 11
