// Class that determines how the fish will move
function PlayerController() {
	this.up = false;
	this.down = false;
	this.left = false;
	this.right = false;
	this.depower = false;
	this.speed = 2;
}
PlayerController.prototype = {
	apply: function(fish) {
		function applyValue(val, vel, dir) {
			if (typeof(val) === 'number') {
				fish[vel] += fish.speed * val * dir; 
			} else {
				if (val) { 
					fish[vel] += fish.speed * dir; 
				}
			}
		}
		
		//if (typeof())
		
		applyValue(this.up, 'velY', -1);
		applyValue(this.down, 'velY', 1);
		applyValue(this.left, 'velX', -1);
		applyValue(this.right, 'velX', 1);
		if ((this.left > 0) ^ (this.right > 0)) {
			fish.facingRight = this.right;
		}
		if (this.depower) {
			fish.setPowerup(null);
		}
	},
	init: function() {},
	deinit: function() {}
}


function GroupController() {
	this.controllers = [];
	for (var i in arguments)
		this.controllers.push(arguments[i]);
	this._ = new PlayerController();
	
	this.apply = function(fish) {
		var self = this._;
		this._.right = this._.left = this._.down = this._.up = 0;
		this.controllers.forEach(function(c) {
			function applyValue(name) {
				if (typeof(c[name]) !== 'number') {
					c[name] = c[name] ? 1 : 0;
				}
				if (c[name]) {
					self[name] = Math.min(self[name] + c[name], 1);
				}
			}
			
			applyValue('up');
			applyValue('down');
			applyValue('left');
			applyValue('right');
			if (c.depower)
				fish.setPowerup(null);
		});
		this._.apply(fish);
	};
	this.init = function() {
		this.controllers.forEach(function(c) { c.init(); });
	};
	this.deinit = function() {
		this.controllers.forEach(function(c) { c.deinit(); });
	};
}
