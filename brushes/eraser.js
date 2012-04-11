function eraser() {
    this.init()
}
eraser.prototype = {
    init: function () {
    },
    context: undefined,
    strokeStart: function() {
        this.context = canvas.getContext('2d');
        this.context.lineWidth = 30;
        this.context.strokeStyle = "rgba(255,255,255,0.7)";
        this.context.globalCompositeOperation = "destination-out"
    },
  

    stroke: function () {
    
        this.context.beginPath();
        this.context.moveTo(toolPrevX, toolPrevY);
        this.context.lineTo(toolX, toolY);
        this.context.stroke();

        
    },
    strokeEnd: function () {
    
   
    
    }
};

