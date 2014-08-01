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
	var mute = document.getElementById('mute-button');
    var canvas = document.getElementById('background');

    window.onresize = function() {
        game.width = (canvas.width = window.innerWidth) / game.scale;
		game.height = (canvas.height = window.innerHeight) / game.scale;
    };
	window.onresize();
	
	mute.onclick = function(e) {
		var classes = mute.children[0].classList;
		//TODO: Update Volume Setting when implemented
		if (classes.contains("fa-volume-up")) {
			classes.remove("fa-volume-up");
			classes.add("fa-volume-off");
		} else {
			classes.remove("fa-volume-off");
			classes.add("fa-volume-up");
		}
		e.preventDefault();
	}
}


setInterval(function() {
    var canvas = document.getElementById('background');
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    function inc(e) {
        e.increment();
        e.draw(ctx);
    }
    
    inc(game.sun);
    inc(game.water);
}, 33);