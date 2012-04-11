
jsCanvasPaint: draw full screen in HTML5 canvas
=========================================================

Simple interface for drawing online without extra clutter.  Select a tool.  Use it.   

- No undo.  (just erase)
- No layers.  (stay simple)
- No opacity control (just use more brush strokes).
- No brush size control (tools have set width)

Specs:

- it should have a background image on the body via css
- it should save background image into final saved image
- it should have a main canvas to receive paint brush and drawing
- it should have a foreground canvas 'staging' to animate brush transitions as you draw
- it should set canvases to full screen
- it should bind to touch events for touch capable devices
- it should bind to mouse events for desktop browsers
- it should allow color picking
- it should allow choosing of tools
- it should all submitting of artwork (save button)
- it should crop submitted artwork to max and min coordinates that tool was used
- it should support additional tools
- it should warn user when losing focus without saving



See example.html for integration.
