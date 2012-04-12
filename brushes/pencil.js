function pencil() {
    this.init()
}
pencil.prototype = {
    init: function () {},
    ctxFront: undefined,
    ctxBack: undefined,
    strokeStart: function() {
        this.ctxFront = staging.getContext('2d');
        this.ctxBack = canvas.getContext('2d');
        this.ctxFront.lineWidth = 1;
        this.ctxFront.strokeStyle = "rgba(20,20,20,0.1)";
        this.ctxFront.globalCompositeOperation = "source-over";
        this.ctxBack.lineWidth = 10;
    },
    dataToContext: function(ctx, data) {
        ctx.beginPath();
        ctx.moveTo(data[0].x, data[0].y);
        for (var i = 1; i < data.length; i++) {
          ctx.lineTo(data[i].x, data[i].y);
        }
        ctx.stroke();
    },

    stroke: function () {
    
        this.ctxFront.clearRect ( 0 , 0 , SCREEN_WIDTH , SCREEN_HEIGHT );
        this.dataToContext(this.ctxFront, toolStrokeData);        
        
    },
    strokeEnd: function () {
    
            //transfer image from staging to canvas
      if ( toolStrokeData.length > 0) {
        toolTotalData.push(toolStrokeData);
        this.dataToContext(this.ctxBack, toolStrokeData);
        this.ctxFront.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
      }

    
    }
};

