
function simple(context){
  this.init( context );
}
simple.prototype = {
  prevPoint: null,
  context: null,
  init: function(context) {
    this.context = context;
    this.context.globalCompositeOperation = 'source-over';
  },
  strokeStart: function(point) { 
      this.prevPoint = point;
  },
  stroke: function(point) {
      this.context.lineWidth = 2;
      this.context.strokeStyle = "rgba(20, 5, 99, 0.9)";
      this.context.beginPath();
      this.context.moveTo(this.prevPoint.x, this.prevPoint.y);
      this.context.lineTo(point.x, point.y);
      this.context.stroke();
      this.prevPoint = point;
  },
  strokeEnd: function() {
  }
};

