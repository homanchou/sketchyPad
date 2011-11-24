/*
Draws smooth curve "between" points sampled with mouseMove event.  (curve doesn't go through all points... it's an approximation).
http://stackoverflow.com/questions/7054272/how-to-draw-smooth-curve-through-n-points-using-javascript-html5-canvas
*/
function Smooth(sketchyPad){
  this.init(sketchyPad);
}
Smooth.prototype = {
  points: [],
  ctx: null,
  init: function(sketchyPad) {
    this.ctx = sketchyPad.opts.topCanvas.get(0).getContext("2d");
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.lineCap = 'round';
  },
  strokeStart: function(sketchyPad) { 
      this.points.push(sketchyPad.opts.currentPoint);
  },
  stroke: function(sketchyPad) {
      this.points.push(sketchyPad.opts.currentPoint);

      //we need at least 4 sample points for this function to work
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
  strokeEnd: function(sketchyPad) {
  }
};

