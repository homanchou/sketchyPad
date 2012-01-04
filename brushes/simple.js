/*
Draws straight lines between points sampled with mouseMove event
*/
function Simple(sketchyPad){
  this.init(sketchyPad);
}
Simple.prototype = {
  prevPoint: null,
  context: null,
  init: function(sketchyPad) {
   // this.context = sketchyPad.opts.topCanvas.get(0).getContext("2d");
    this.context = $('#layer1').get(0).getContext("2d");
    this.context.globalCompositeOperation = 'source-over';
    this.context.lineCap = 'round';
  },
  strokeStart: function(sketchyPad) { 
    this.prevPoint = sketchyPad.opts.currentPoint;
  },
  stroke: function(sketchyPad) {

    var point = sketchyPad.opts.currentPoint;
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

