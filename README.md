
jsCanvasPaint: draw full screen in HTML5 canvas
=========================================================

Simpler interface for drawing online.   

- No undo.  (just erase)
- No layers.  (stay simple)
- No opacity control (just use more brush strokes).
- No brush size control (tools have set width)

Features:

- Creates canvas element(s) at full screen coodinates 
- Full screen makes it easier to map to canvas coordinates when canvas lines up with full screen
- Autocrop: Submitted artwork will crop to the maximum coordinates you drew to
  so in a screen that is wide you can still get portrait proportions.
- Record drawing animation - the point of drawing online vs uploading through photoshop.  
  Recording makes it possible to test brushes just with data and without interaction
- Binds mouse and touch events for recording x,y and speed (pixels per second).
- Tools dropdown menu.
- Color Picker
- Extensible tools.  Just create object that responds to toolStart, toolStroke, toolEnd
- warns user when losing focus without saving

See example.html for integration.
