/*
Draws straight lines between points sampled with mouseMove event
*/
function Simple(){
  this.init();
}
Simple.prototype = {
  prevPoint: null,
  context: null,
  init: function() {
  },
  setActiveLayer: function() {
    this.context = $.sketchyPad.getCurrentLayer().get(0).getContext("2d");
    this.context.globalCompositeOperation = 'source-over';
    this.context.lineCap = 'round';
  },
  strokeStart: function() { 
    this.setActiveLayer();
    this.prevPoint = $.sketchyPad.opts.currentPoint;
  },
  stroke: function(sketchyPad) {
    var point = $.sketchyPad.opts.currentPoint;
    this.context.lineWidth = $.sketchyPad.opts.brushSize;
    this.context.strokeStyle = $.sketchyPad.getRGBA();
    this.context.fillStyle = $.sketchyPad.getRGBA();
    this.context.beginPath();
    this.context.moveTo(this.prevPoint.x, this.prevPoint.y);
    this.context.lineTo(point.x, point.y);
    this.context.stroke();
    this.prevPoint = point;
  },
  strokeEnd: function(sketchyPad) {
    //put an extra one in case they are making dots without moving 
    var new_point = $.sketchyPad.opts.currentPoint;
    if (new_point) {
        this.context.lineWidth = $.sketchyPad.opts.brushSize;
        this.context.strokeStyle = $.sketchyPad.getRGBA();
        this.context.fillStyle = $.sketchyPad.getRGBA();
        this.context.beginPath();
        this.context.arc(new_point.x, new_point.y,parseInt(this.context.lineWidth)/2, 0, Math.PI * 2, true);
        this.context.closePath();
        this.context.fill();
    }
 
  }
};

