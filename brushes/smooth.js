/*
Draws smooth curve "between" points sampled with mouseMove event.  (curve doesn't go through all points... it's an approximation).
http://stackoverflow.com/questions/7054272/how-to-draw-smooth-curve-through-n-points-using-javascript-html5-canvas
*/
function Smooth(ctx){
  this.init( ctx );
}
Smooth.prototype = {
  points: [],
  ctx: null,
  init: function(ctx) {
    this.ctx = ctx;
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.lineCap = 'round';
  },
  strokeStart: function(point, sketchyPad) { 
      this.points.push(point);
  },
  stroke: function(point, sketchyPad) {
      this.points.push(point);
      if (this.points.length < 4) {
        return;
      }
      this.ctx.lineWidth = sketchyPad.opts.brushSize;
      this.ctx.strokeStyle = sketchyPad.getRGBA();
      this.ctx.beginPath();
      
      
// now move to the first point
   this.ctx.moveTo(this.points[0].x, this.points[0].y);
    // curve through the rest, stopping at each midpoint
     
    for (i = 1; i < this.points.length - 2; i ++)
    {
       // ctx.arc(points[i].x, points[i].y,2,0, 2*Math.PI, true);

    var xc = (this.points[i].x + this.points[i + 1].x) / 2;
    var yc = (this.points[i].y + this.points[i + 1].y) / 2;
    this.ctx.quadraticCurveTo(this.points[i].x, this.points[i].y, xc, yc);
    }
    // curve through the last two points
    this.ctx.quadraticCurveTo(this.points[i].x, this.points[i].y, this.points[i+1].x,this.points[i+1].y);

      this.ctx.stroke();

  },
  strokeEnd: function(points, sketchyPad) {
  }
};

