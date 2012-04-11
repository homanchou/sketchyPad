


function pencil(context) {
    this.init(context)
}
pencil.prototype = {
    context: null,
    init: function (context) {
        this.context = context;
        this.context.globalCompositeOperation = "source-over";
    },
    destroy: function () {},
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
    strokeEnd: function () {}
};

