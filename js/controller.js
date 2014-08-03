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
		
		function applyValue() {
			
		}
		
		//if (typeof())
		
		if (this.up) fish.velY -= fish.speed;
		if (this.down) fish.velY += fish.speed;
		if (this.left) fish.velX -= fish.speed;
		if (this.right) fish.velX += fish.speed;
		if (this.left != this.right)
			fish.facingRight = this.right;
		if (this.depower)
			fish.setPowerup(null);
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
		this._.right = this._.left = this._.down = this._.up = false;
		this.controllers.forEach(function(c) { 
			if (c.up) self.up = true;
			if (c.down) self.down = true;
			if (c.left) self.left = true;
			if (c.right) self.right = true;
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
