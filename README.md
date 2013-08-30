
sketchyPad: javascript library for drawing with a pen stylus on HTML5 canvas
============================================================================

create a sketchyPad canvas of the dimensions that you want.

var opts = {width:500, height:600}  
// get the height of an image or of window if you want to fit canvas over something
var sketchyPad = SketchyPad.new(opts)

// append sketchyPad to the DOM
$('.some_div').append(sketchyPad);

// start drawing

// change pen color, default is 3
sketchyPad.pen_size = 1;

// change pen opacity, default is red
sketchyPad.pen_opacity = rgba(0,0,0,0.5);

