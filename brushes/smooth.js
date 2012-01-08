/*
Draws smooth curve "between" points sampled with mouseMove event.  (curve doesn't go through all points... it's an approximation).
http://stackoverflow.com/questions/7054272/how-to-draw-smooth-curve-through-n-points-using-javascript-html5-canvas
*/
function Smooth(sketchyPad){
  this.init(sketchyPad);
}
Smooth.prototype = {
  points: [],
  upper: undefined,
  lower: undefined,
  tempLayer: undefined,
  init: function(sketchyPad) {
       //lower
    this.lower = sketchyPad.getCurrentLayer().get(0).getContext("2d");
    this.lower.globalCompositeOperation = 'source-over';
    this.lower.lineCap = 'round';
 //upper
/*    this.upper = sketchyPad.opts.interactiveLayer.get(0).getContext("2d");
    this.upper.globalCompositeOperation = 'source-over';
    this.upper.lineCap = 'round';
*/
    var c = $(document.createElement('canvas'));
    c.addClass("sketchypad_sketch_layer");
    c.attr('width',$.sketchyPad.opts.width);
    c.attr('height',$.sketchyPad.opts.height);
    c.insertAfter($.sketchyPad.getCurrentLayer());
    this.tempLayer = c;
    this.upper = c.get(0).getContext("2d");
    this.upper.globalCompositeOperation = 'source-over';
    this.upper.lineCap = 'round';

    


  },
  strokeStart: function(sketchyPad) { 
    this.init(sketchyPad);
    console.log(sketchyPad.getCurrentLayer());
    this.points.push(sketchyPad.opts.currentPoint);
  },
  drawCurveStroke: function(context) {
      
     //we need at least 4 sample points for this function to work
     if (this.points.length > 0 && this.points.length < 4) {
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
  stroke: function(sketchyPad) {
      this.points.push(sketchyPad.opts.currentPoint);
      this.upper.lineWidth = sketchyPad.opts.brushSize;
      this.upper.strokeStyle = sketchyPad.getRGBA();
      this.upper.fillStyle = sketchyPad.getRGBA();
      this.upper.clearRect(0, 0, this.upper.canvas.width, this.upper.canvas.height);
      this.drawCurveStroke(this.upper);

  },
  strokeEnd: function(sketchyPad) {
    this.upper.clearRect(0, 0, this.upper.canvas.width, this.upper.canvas.height);
    this.lower.lineWidth = sketchyPad.opts.brushSize;
    this.lower.strokeStyle = sketchyPad.getRGBA();
    this.lower.fillStyle = sketchyPad.getRGBA();
    this.drawCurveStroke(this.lower);
    this.points = [];
    //store to undo buffer
    sketchyPad.undoBufferPush();
    this.tempLayer.remove();
  }
};

