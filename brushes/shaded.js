function shaded() {
    this.init();
}
shaded.prototype = {
    init: function () {},
    ctx: undefined,
    points: undefined,
    strokeStart: function() {
        this.ctx = canvas.getContext('2d');
        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = "rgba("+RGB.join(',')+",0.2)";
        this.ctx.globalCompositeOperation = "source-over";
        this.points = [{x:toolX,y:toolY}];
    },
    /*
    dataToContext: function(ctx, data) {
        ctx.beginPath();
        ctx.moveTo(data[0].x, data[0].y);
        for (var i = 1; i < data.length; i++) {
          ctx.lineTo(data[i].x, data[i].y);
        }
        ctx.stroke();
    },*/
    drawAdditional: function() {
        var prevOpacity = this.ctx.strokeStyle;
        this.ctx.strokeStyle = "rgba(20,20,20,0.05)";
        this.ctx.lineWidth = 1;

        var prevPoint = this.points[0];
        this.ctx.beginPath();
        for (var i = 1; i< this.points.length; i++) {
          this.ctx.moveTo(prevPoint.x, prevPoint.y);
          var thisPoint = {x:this.points[i].x + Math.floor(Math.random()*3) - Math.floor(Math.random()*3), y:this.points[i].y+Math.floor(Math.random()*3)-Math.floor(Math.random()*3)};
          this.ctx.lineTo(thisPoint.x, thisPoint.y);
          prevPoint = thisPoint;
        }

        this.ctx.stroke();
        this.ctx.strokeStyle = prevOpacity;
        this.ctx.lineWidth = 3;



    
    },
    drawDot: function(){
      for(var i=0;i<this.points.length;i++){
       // this.ctx.fillStyle   = '#00f';
        this.ctx.fillRect(this.points[i].x, this.points[i].y, 2, 2);
      }

    },
    stroke: function () {
    
        //this.ctxFront.clearRect ( 0 , 0 , SCREEN_WIDTH , SCREEN_HEIGHT );
        this.ctx.beginPath();
        this.ctx.moveTo(toolPrevX, toolPrevY);
        this.ctx.lineTo(toolX, toolY);
        this.ctx.stroke();
/*
        this.ctx.beginPath();
        this.ctx.moveTo(toolPrevX + Math.random()*5, toolPrevY + Math.random()*5);
        this.ctx.lineTo(toolX + Math.random()*5, toolY + Math.random()*5);
        this.ctx.stroke();
*/
        this.points.push({x:toolX,y:toolY});
        if (this.points.length > 6) {
          this.points.shift(); //keep array small, need only consider last couple of points
        }
     //   this.drawDot();
        this.drawAdditional();
        this.drawAdditional();
        
    },
    strokeEnd: function () {
    
            //transfer image from staging to canvas
   /*   if ( toolStrokeData.length > 0) {
        toolTotalData.push(toolStrokeData);
        this.dataToContext(this.ctxBack, toolStrokeData);
        this.ctxFront.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
      }*/
    
    }
};
/*
    context: null,
    prevMouseX: null,
    prevMouseY: null,
    points: null,
    count: null,
    init: function (a) {
        this.context = a;
        this.context.globalCompositeOperation = "source-over";
        this.points = new Array();
        this.count = 0
    },
    destroy: function () {},
    strokeStart: function (b, a) {
        this.prevMouseX = b;
        this.prevMouseY = a
    },
    stroke: function (f, c) {
        var e, b, a, g;
        this.points.push([f, c]);
        this.context.lineWidth = BRUSH_SIZE;
        this.context.strokeStyle = "rgba(" + COLOR[0] + ", " + COLOR[1] + ", " + COLOR[2] + ", " + 0.05 * BRUSH_PRESSURE + ")";
        this.context.beginPath();
        this.context.moveTo(this.prevMouseX, this.prevMouseY);
        this.context.lineTo(f, c);
        this.context.stroke();
        for (e = 0; e < this.points.length; e++) {
            b = this.points[e][0] - this.points[this.count][0];
            a = this.points[e][1] - this.points[this.count][1];
            g = b * b + a * a;
            if (g < 4000 && Math.random() > (g / 2000)) {
                this.context.beginPath();
                this.context.moveTo(this.points[this.count][0] + (b * 0.3), this.points[this.count][1] + (a * 0.3));
                this.context.lineTo(this.points[e][0] - (b * 0.3), this.points[e][1] - (a * 0.3));
                this.context.stroke()
            }
        }
        this.prevMouseX = f;
        this.prevMouseY = c;
        this.count++
    },
*/

