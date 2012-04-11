function pencil() {
    this.init()
}
pencil.prototype = {
    init: function () {},
    strokeStart: function() {},
    dataToContext: function(context, data){
        context.lineWidth = 1;
        context.strokeStyle = "rgba(20,20,20,0.1)";
        context.globalCompositeOperation = "source-over"

        context.beginPath();
        context.moveTo(data[0].x, data[0].y);
        for (var i = 1; i < data.length; i++) {
          context.lineTo(data[i].x, data[i].y);
        }
        context.stroke();
    },  

    stroke: function () {
    
      var context = staging.getContext('2d');
      context.clearRect ( 0 , 0 , SCREEN_WIDTH , SCREEN_HEIGHT );
      this.dataToContext(context, toolStrokeData);
    
        
    },
    strokeEnd: function () {
    
            //transfer image from staging to canvas
      if ( toolStrokeData.length > 0) {
        toolTotalData.push(toolStrokeData);
        var context = canvas.getContext('2d');
        this.dataToContext(context, toolStrokeData);
        var context = staging.getContext('2d');
        context.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
      }

    
    }
};

