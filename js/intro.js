game = {
    transform: function(x, y, w, h) {
        return {
			x: x ? x * this.scale + this.xPan : this.xPan,
			y: y ? y * this.scale + this.yPan : this.yPan,
			w: w ? w * this.scale : 0,
			h: h ? h * this.scale : 0
		}
    },
    scale: 3,
    waterLevel: 24,
    targetWaterLevel: 24,
    height: 300,
    width: 500,
    xPan: 0,
    yPan: 0,
    sun: new Sun(),
    water: new WaterLevel()
}

window.onload = function() {
    game.canvas = document.getElementById('background');

    window.onresize = function() {
        game.width = (game.canvas.width = window.innerWidth) / game.scale;
		game.height = (game.canvas.height = window.innerHeight) / game.scale;
    };
	window.onresize();
}




setInterval(function() {
    game.canvas = document.getElementById('background');
    var ctx = game.canvas.getContext('2d');
    ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);
    
    function inc(e) {
        e.increment();
        e.draw(ctx);
    }
    
    inc(game.sun);
    inc(game.water);
}, 33);