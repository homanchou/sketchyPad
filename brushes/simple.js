/*
Draws straight lines between points sampled with mouseMove event
*/
function Simple(context){
  this.init( context );
}
Simple.prototype = {
  prevPoint: null,
  context: null,
  init: function(context) {
    this.context = context;
    this.context.globalCompositeOperation = 'source-over';
   // this.context.lineCap = 'round';
  },
  strokeStart: function(point, sketchyPad) { 
      this.prevPoint = point;
  },
  stroke: function(point, sketchyPad) {
      this.context.lineWidth = sketchyPad.opts.brushSize;
      this.context.strokeStyle = sketchyPad.getRGBA();
      this.context.beginPath();
      this.context.moveTo(this.prevPoint.x, this.prevPoint.y);
      this.context.lineTo(point.x, point.y);
      this.context.stroke();
      this.prevPoint = point;
  },
  strokeEnd: function(points, sketchyPad) {
  }
};

