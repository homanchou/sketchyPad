function shaded() {
    this.init()
}
shaded.prototype = {
    init: function () {},
    ctx: undefined,
    strokeStart: function() {
        this.ctx = canvas.getContext('2d');
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = "rgba(20,20,20,0.1)";
        this.ctx.globalCompositeOperation = "source-over";
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
        this.ctx.strokeStyle = "rgba(20,20,20,0.05)";
        var prevSlope = 0;
        var final_angle = Math.atan2(toolPrevX - toolX, toolPrevY - toolY);
   //     console.log("master point ("+toolX+","+toolY+") " + "final angle:" + final_angle);
        var lookBack = Math.ceil(20 * toolSpeed/1000);
        console.log(lookBack);
        for (var i = Math.max(0,toolStrokeData.length - lookBack); i < toolStrokeData.length - 1; i++) {

            var deltaX = toolStrokeData[i].x - toolX;
            var deltaY = toolStrokeData[i].y - toolY;
            var sudoDistance = deltaX * deltaX + deltaY * deltaY;
            var angle = Math.atan2(deltaX, deltaY);
  //          console.log("sub point ("+ toolStrokeData[i].x+","+ toolStrokeData[i].y+") angle: " + angle);
           // var slope = deltaY / deltaX;
   //         console.log("x: " + deltaX + " y: " + deltaY );
            angle_diff = Math.abs(final_angle - angle);
        //    console.log(angle_diff);
        //make more connections when drawing fast, make less connects when drawing slow
            if (sudoDistance < 1000 && angle_diff < 0.4 ) {
                this.ctx.beginPath();
                var noise = 5 ;
                if (deltaX == 0) {deltaX = noise};
                if (deltaY == 0) {deltaY = noise};
                this.ctx.moveTo(toolX + (deltaX * 0.3), toolY + (deltaY * 0.3));
             //   this.ctx.moveTo(toolX , toolY);
                this.ctx.lineTo(toolStrokeData[i].x - (deltaX * 0.3), toolStrokeData[i].y - (deltaY * 0.3));
            //    this.ctx.lineTo(toolStrokeData[i].x , toolStrokeData[i].y );
              
                this.ctx.stroke()
            }
        }
        this.ctx.strokeStyle = "rgba(20,20,20,0.1)";


    
    },
    stroke: function () {
    
        //this.ctxFront.clearRect ( 0 , 0 , SCREEN_WIDTH , SCREEN_HEIGHT );
        this.ctx.beginPath();
        this.ctx.moveTo(toolPrevX, toolPrevY);
        this.ctx.lineTo(toolX, toolY);
        this.ctx.stroke();
        console.log('single stroke start');
        this.drawAdditional();
        console.log('single stroke end');

   //     this.dataToContext(this.ctxFront, toolStrokeData);        
        
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

