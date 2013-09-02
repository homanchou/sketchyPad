
sketchyPad
============================================================================

sketchyPad is jQuery plugin for drawing with a wacam pen in your web browser.

To make any div with a width and height a sketchable area just do:

Usage: $('#mydiv').sketchyPad()

See example: index.html.

The source code is written in coffeescript, see sketchypad.coffee

I've tried to keep the code clean and written in a model, view, controller
separation of concerns, so it should be a good starting point to customize the code
if you want to add or remove features.

The view is a wrapper around a canvas and contains all the logic for drawing lines
on canvas context.  Stokes that are drawn with more pen pressure are drawn slightly
thicker than strokes that are drawn lightly.

The data structure is a list of points and pressures (using the wacom pen driver),
and timestamps incase we need to animate the strokes back (play back animation)

The router adds event bindings to the canvas to listen for mouse/pen movements
and triggers call backs.

Finally the controller ties everything together.  It creates and hooks up the other pieces,
listens for events, populates data structures and informs the canvas to render the 
new data.

TODO:

add datastructure methods for getting back data as a image/png
add view playback animation


