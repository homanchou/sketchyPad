/*
Draws smooth curve "between" points sampled with mouseMove event.  (curve doesn't go through all points... it's an approximation).
http://stackoverflow.com/questions/7054272/how-to-draw-smooth-curve-through-n-points-using-javascript-html5-canvas
*/
function Smooth(){
  this.init();
}
Smooth.prototype = {
  points: [],
  upper: undefined,
  lower: undefined,
  tempLayer: undefined,
  init: function() {
    //lower-context
   // this.lower = $.sketchyPad.getCurrentLayer().get(0).getContext("2d");
   // this.lower.globalCompositeOperation = 'source-over';
   // this.lower.lineCap = 'round';

    //upper-context: needed because if you only draw on one canvas only the joins between points overlap
    //so we use upper to re-draw all points continuously as we drag the mouse

    var c = $(document.createElement('canvas'));
    c.addClass($.sketchyPad.opts.canvasClassName);
    c.attr('width',$.sketchyPad.opts.width);
    c.attr('height',$.sketchyPad.opts.height);
   // c.css('z-index',parseInt($.sketchyPad.getCurrentLayer().css('z-index'))+1);
    c.insertAfter($.sketchyPad.getCurrentLayer());
    
    this.tempLayer = c;
    
    this.upper = c.get(0).getContext("2d");
    this.upper.globalCompositeOperation = 'source-over';
    this.upper.lineCap = 'round';

  },
  setActiveLayer: function() {
    this.lower = $.sketchyPad.getCurrentLayer().get(0).getContext("2d");
    this.lower.globalCompositeOperation = 'source-over';
    this.lower.lineCap = 'round';
    this.tempLayer.css('z-index',parseInt($.sketchyPad.getCurrentLayer().css('z-index'))+1);
  },
  strokeStart: function() { 
    this.setActiveLayer();
    this.points.push($.sketchyPad.opts.currentPoint);
  },
  drawCurveStroke: function(context) {
    
     if (this.points.length < 1) {
       return;
     }

     if (this.points.length < 6) {
        var point = this.points[0];
        context.beginPath();
        context.arc(point.x, point.y,parseInt(context.lineWidth)/2, 0, Math.PI * 2, true);
        context.closePath();
        context.fill();

        return;
     }

    context.beginPath();
   // move to the first point
    context.moveTo(this.points[0].x, this.points[0].y);
    
    // curve through the rest, stopping at each midpoint
    for (i = 1; i < this.points.length - 2; i ++)
    {
       // ctx.arc(points[i].x, points[i].y,2,0, 2*Math.PI, true);

       var xc = (this.points[i].x + this.points[i + 1].x) / 2;
       var yc = (this.points[i].y + this.points[i + 1].y) / 2;
       context.quadraticCurveTo(this.points[i].x, this.points[i].y, xc, yc);
    }
    // curve through the last two points
    context.quadraticCurveTo(this.points[i].x, this.points[i].y, this.points[i+1].x,this.points[i+1].y);

    context.stroke();

 
  },
  stroke: function() {
      this.points.push($.sketchyPad.opts.currentPoint);
      this.upper.lineWidth = $.sketchyPad.opts.brushSize;
      this.upper.strokeStyle = $.sketchyPad.getRGBA();
      this.upper.fillStyle = $.sketchyPad.getRGBA();
      this.upper.clearRect(0, 0, this.upper.canvas.width, this.upper.canvas.height);
      this.drawCurveStroke(this.upper);

  },
  strokeEnd: function() {
    this.upper.clearRect(0, 0, this.upper.canvas.width, this.upper.canvas.height);
    this.lower.lineWidth = $.sketchyPad.opts.brushSize;
    this.lower.strokeStyle = $.sketchyPad.getRGBA();
    this.lower.fillStyle = $.sketchyPad.getRGBA();
    this.drawCurveStroke(this.lower);
    this.points = [];

  }
};

