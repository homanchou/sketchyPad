/*
Draws smooth curve "between" points sampled with mouseMove event.  (curve doesn't go through all points... it's an approximation).
http://stackoverflow.com/questions/7054272/how-to-draw-smooth-curve-through-n-points-using-javascript-html5-canvas
*/
function smooth(context){
  this.init( context );
}
simple.prototype = {
  points: [],
  context: null,
  init: function(context) {
    this.context = context;
    this.context.globalCompositeOperation = 'source-over';
  },
  strokeStart: function(point, opts) { 
      this.points.push(point);
  },
  stroke: function(point, opts) {
      this.context.lineWidth = opts.brushSize;
      this.context.strokeStyle = "rgba("+opts.color[0]+", "+opts.color[1]+", "+opts.color[2]+", "+opts.opacity+")";
      this.context.beginPath();
      this.context.moveTo(this.prevPoint.x, this.prevPoint.y);
      this.context.lineTo(point.x, point.y);
      this.context.stroke();
      this.prevPoint = point;
  },
  strokeEnd: function(points, opts) {
  }
};
