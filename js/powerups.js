// Powerup array

/*
	"PacMan": 2,
	"Spawn": 4,
*/

//
// PowerUp Constructor
//
function PowerUp(displayText, mp3, timeLimit, functionName, newFunction, increment) {
	this.displayText = displayText;
	this.mp3 = mp3;
	this.timeLimit = timeLimit;
	this[functionName] = newFunction || function() { };
	if (typeof (functionName) == 'string')
		this.functionName = [ functionName ];
	else if (!functionName)
		this.functionName = [];
	else 
		this.functionName = functionName;
		
	//this.init = PowerUp.prototype.init;
	//this.deinit = PowerUp.prototype.deinit;
	this.increment = increment || function() { };
}
PowerUp.prototype = {
	init: function(fish) {
		if (this.functionName.length) {
			for (var i = 0; i < this.functionName.length; ++i) {
				fish['__old_' + this.functionName[i]] = fish[this.functionName[i]];
				fish[this.functionName[i]] = this[this.functionName[i]];
			}
		}
	},
	deinit: function(fish) {
		if (this.functionName.length) {
			for (var i = 0; i < this.functionName.length; ++i) {
				fish[this.functionName[i]] = fish['__old_' + this.functionName[i]];
				delete fish['__old_' + this.functionName[i]];
			}
		}
	},
	increment: function() { }
}

//
// Fly Powerup
//
function FlyPowerUp() {
	this.tick = 0;
	this.tickSpeed = 0.7;
	this.isInWater = function() { return true; };
}
FlyPowerUp.prototype = new PowerUp("\uf072 Fly", "fly.mp3", 600, ["isInWater", "drawTail"]);
FlyPowerUp.prototype.isInWater = function() { return true; };
FlyPowerUp.prototype.drawTail = function(ctx) {
	var a, b;
	var mod = Math.sin(this.powerup.tick);
	var x, c1, c2;
	c1 = this.y - this.size * mod / 2;
	c2 = this.y + this.size * mod / 2;
	if (this.facingRight)
		x = this.x - this.size;
	else
		x = this.x + this.size;
	a = game.transform(x, c1);
	b = game.transform(x, c2);
	ctx.lineTo(a.x, a.y);
	ctx.lineTo(b.x, b.y);
};
FlyPowerUp.prototype.increment = function(fish) {
	this.tick += this.tickSpeed;
}

//
// Heal Powerup
//
function HealPowerUp() {
	this.tick = 0;
	this.tickSpeed = .3;
	this.hsv = {};
	this.color = new Color()
}
HealPowerUp.prototype = new PowerUp("\uf0fe Heal", "heal.mp3", 50, 'getColor');
HealPowerUp.prototype.init = function(fish) {
	PowerUp.prototype.init.call(this, fish);
	
};
HealPowerUp.prototype.getColor = function() {
	var hsv = this.color.getHSV();
	hsv.s = Math.abs(Math.cos(this.powerup.tick));
	this.powerup.color.setHSV(hsv.h, hsv.s, hsv.v);
	return this.powerup.color.toString();
};
HealPowerUp.prototype.increment = function(fish) { 

	fish.health = Math.min(fish.health + 1, game.maxHealth);
	this.tick += this.tickSpeed;
};

//
// Fast Powerup
//
function FastPowerUp() {
	//TODO: Use Fish.tailDivideFactor to change tail size
	this.ratio = 1.5
}
FastPowerUp.prototype = new PowerUp("\uf050 Fast", "fast.mp3", 300, 
	['speed','tailDivideFactor', 'tailLengthenFactor']);
FastPowerUp.prototype.tailDivideFactor = .3;
FastPowerUp.prototype.tailLengthenFactor = 1.4;
FastPowerUp.prototype.init = function(fish) {
	PowerUp.prototype.init.call(this, fish);
	fish.speed = fish.__old_speed * this.ratio;
};

//
// Invincible Powerup
//
function InvinciblePowerUp() {
	this.distanceTo = function(f) {
		if (this.edible(f))
			return Fish.prototype.distanceTo.call(this, f);
		else return NaN;
	}
	this.onCollision = function() { }
}
InvinciblePowerUp.prototype = new PowerUp("\uf005 Invincible", "invincible.mp3", 500, ['getColor', 'distanceTo']);
InvinciblePowerUp.prototype.getColor = function() {
	return ('#0' + Math.round(0xffffff * Math.random())
		.toString(16)).replace(/^#0([0-9a-f]{6})$/i, '#$1');
};

//
// Song Powerup
//
function SongPowerUp() {
	this.controller = {
		speed: 1,
		upSpeed: 0.5,
		apply: function(fish) {
			fish.velX = fish.facingRight ? this.speed : -this.speed;
			fish.velY -= this.upSpeed;
		},
		init: function() {},
		deinit: function() {}
	};
}
SongPowerUp.prototype = new PowerUp("\uf001 Control Song", "song.mp3", 300);
SongPowerUp.prototype.init = function() {
	var self = this;
	//TODO: Update to new controller
	game.enemyFishController.__old_apply = game.enemyFishController.apply;
	game.enemyFishController.apply = this.applyController;
};
SongPowerUp.prototype.deinit = function() {
	var self = this;
	game.enemyFishController.apply = game.enemyFishController.__old_apply;
	delete game.enemyFishController.__old_apply;
};
SongPowerUp.prototype.applyController = function(fish) {
	fish.velY -= this.speedVert;
	fish.velX = fish.facingRight ? fish.speed : -fish.speed;
}

//
// PacMan Powerup
//
function PacManPowerUp() {
	this.tick = 0;
}
PacManPowerUp.prototype = new PowerUp("\uf118 PacMan", "pacman.mp3", 100, ["drawBody", "edible"]);
PacManPowerUp.prototype.increment = function() {
	++this.tick;
};
PacManPowerUp.prototype.init = function(fish) {
	PowerUp.prototype.init.call(this, fish);
	this.tick = 0;
};
PacManPowerUp.prototype.deinit = function(fish) {
	PowerUp.prototype.deinit.call(this, fish);
};
PacManPowerUp.prototype.edible = function() {
	return true;
}
PacManPowerUp.prototype.drawBody = function(ctx) {
	var p = game.transform(this.x, this.y, this.size / 2);
	var tick = Math.abs(Math.sin(this.powerup.tick / 5) / 2);
	p.s = game.scale * this.size / 2
	if (this.facingRight) {
		p.w = tick;
		p.h = Math.PI * 2 - tick;
		p.b = false;
		p.tailOffset = -this.size * game.scale;
	}
	else {
		p.w = Math.PI - tick;
		p.h = -Math.PI + tick;
		p.b = true;
		p.tailOffset = this.size * game.scale;
	}
	ctx.arc(p.x, p.y, p.s, p.w, p.h, p.b);
	ctx.lineTo(p.x, p.y);
	ctx.lineTo(p.x + Math.cos(p.w) * p.s, p.y + Math.sin(p.w) * p.s);
	ctx.moveTo(p.x + p.tailOffset / 2, p.y);
}

TimeStopPowerUp = function() {}
TimeStopPowerUp.prototype = new PowerUp("\uf017 Time Stop", "timestop.mp3", 300);
TimeStopPowerUp.prototype.init = function(fish) {
	EnemyFish.prototype.__old_increment = EnemyFish.prototype.increment;
	EnemyFish.prototype.increment = this.enemyIncrement;
	var hsv = game.water.color.getHSV();
	game.water.__old_color = {h:hsv.h, s:hsv.s, v:hsv.v};
	hsv.s /= 2;
	game.water.color.setHSV(hsv);
	this.tick = 0;
};
TimeStopPowerUp.prototype.deinit = function(fish) {
	EnemyFish.prototype.increment = EnemyFish.prototype.__old_increment;
	delete EnemyFish.prototype.__old_increment;
	game.water.color.setHSV(game.water.__old_color);
	delete game.water.__old_color;
};
TimeStopPowerUp.prototype.enemyIncrement = function() {
	
}

//
// Super Powerup
//
function SuperPowerUp() {
	this.tick = 0;
}
SuperPowerUp.prototype = new PowerUp("\uf0e7 Super", "super.mp3", 100, 
	["tailDivideFactor", "tailLengthenFactor", "drawBody", "isInWater", "getColor", "edible", "onCollision", "setPowerup"]);
SuperPowerUp.prototype.tailDivideFactor = FastPowerUp.prototype.tailDivideFactor;
SuperPowerUp.prototype.tailLengthenFactor = FastPowerUp.prototype.tailLengthenFactor;
SuperPowerUp.prototype.isInWater = FlyPowerUp.prototype.isInWater;
SuperPowerUp.prototype.drawBody = PacManPowerUp.prototype.drawBody;
SuperPowerUp.prototype.getColor = InvinciblePowerUp.prototype.getColor;
SuperPowerUp.prototype.applyController = SongPowerUp.prototype.applyController;
SuperPowerUp.prototype.edible = PacManPowerUp.prototype.edible;
SuperPowerUp.prototype.onCollision = function(otherFish) {
	var increase;
	if (otherFish.powerup == powerups["super"]) {
		increase = 100;
	} else if (otherFish.powerup == null) {
		increase = 5;
	} else {
		increase = 10;
	}
	increase *= otherFish.size / game.maxSize;
	this.powerupRemaining = Math.min(this.powerup.timeLimit, this.powerupRemaining + increase);
	this.__old_onCollision.call(this, otherFish);
};
SuperPowerUp.prototype.setPowerup = function(powerup) {
	if (powerup == null) {
		this.__old_setPowerup(powerup);
	}
};
SuperPowerUp.prototype.init = function(fish) {
	PowerUp.prototype.init.call(this, fish);
	SongPowerUp.prototype.init.call(this, fish);
};
SuperPowerUp.prototype.deinit = function(fish) {
	PowerUp.prototype.deinit.call(this, fish);
	SongPowerUp.prototype.deinit.call(this, fish);
};
SuperPowerUp.prototype.increment = function(fish) {
	var p = powerups.asArray();
	++this.tick;
	for (var i = 0; i < p.length; ++i) {
		if (p[i] != this)
			p[i].increment(fish);
	}
};

powerups = {
	fly: new FlyPowerUp(),
	heal: new HealPowerUp(),
	"super": new SuperPowerUp(),
	fast: new FastPowerUp(),
	invincible: new InvinciblePowerUp(),
	song: new SongPowerUp(),
	pacman: new PacManPowerUp(),
	timestop: new TimeStopPowerUp(),
	
	asArray: function() {
		var a = [];
		for (var p in this)
		{
			p = this[p];
			if (p instanceof PowerUp)
				a.push(p);
		}
		return a;
	},
	
	getRandomPowerup: function() {
		var array = this.asArray();
		var i = Math.floor(Math.random() * array.length);
		return array[i];
	}
};
