function PlayerFish()
{
	this.health = 50;
	this.size = 100;
	this.x = 75;
	this.y = 75;
	this.closestEnemy = null;
	
	//Score trackers
	this.fishEaten = 0;
	this.fishEatenSize = 0;
	this.powerupCount = 0;
}
PlayerFish.prototype = new Fish();;
PlayerFish.prototype.setPowerup = function(p) {
	if (this.powerup)
		this.powerup.deinit(this);
	this.powerup = p;
	if (p) {
		p.init(this);
		this.powerupRemaining = p.timeLimit;
		game.setMusic(p.mp3);
		var mp3Player = game._mp3s[p.mp3];
		if (mp3Player.readyState == 4)
			mp3Player.currentTime = 0;
		++this.powerupCount;
	} else {
		game.setMusic(game.backgroundMusic);
		this.powerupRemaining = 0;
	}
};

PlayerFish.prototype.getScore = function() {
	var score = {
		eating: this.fishEaten * 100,
		eatingSize: this.fishEatenSize,
		powerups: this.powerupCount * 200,
		health: this.health / game.maxHealth * 10000,
		size: this.size / game.maxSize * 10000
	};
	score.total = score.eating + score.eatingSize + score.powerups + score.health + score.size;
	return score;
}

PlayerFish.prototype.getEyeDirection = function() {
	if (this.closestEnemy)
		return Math.atan2(this.y - this.closestEnemy.y, this.x - this.closestEnemy.x);
	else
		return Fish.prototype.getEyeDirection();
};

PlayerFish.prototype.findClosestEnemy = function() {
	var closestDistance = Number.MAX_VALUE;
	var closestFish = null;
	var self = this;
	game.enemies.forEach(function(e) {
		var dist = self.distanceTo(e);
		if (closestDistance > dist) {
			closestFish = e;
			closestDistance = dist;
		}
	});
	this.closestEnemy = closestFish;
	this.closestEnemyDist = closestDistance;
}

PlayerFish.prototype.edible = function(fish) {
	return (this.size > fish.size);
};

PlayerFish.prototype.onCollision = function(f) {
	if (this.edible(f)) {
		//Eat the little fish
		this.size += f.size * game.growthRate;
		++this.fishEaten;
		this.fishEatenSize += f.size;
		this.health = Math.min(this.health + f.size / this.size * game.healthGain, game.maxHealth);
		if (false){//this.powerup == powerups.super) {
		} else {
			if (f.powerup) {
				this.setPowerup(f.powerup);
			}
		}
	} else {
		// You get hurt
		this.health -= f.size / this.size * game.healthLoss;
		if (this.health <= 0) {
			this.health = 0;
			this._destroy = true;
		}
			
	}
};

PlayerFish.prototype.preserveBounds = function() {
	var inWater = this.isInWater();
	if (this.x < 0) {
		this.velX = -this.velX / 5;
		this.x = 0;
	}
	if (this.x > game.width) {
		this.velX = -this.velX / 5;
		this.x = game.width;
	}
	if (inWater) {
		if (this.y < 0) {
			this.velY = -this.velY / 5;
			this.y = 0;
		}
		if (this.y > game.height) {
			this.velY = -this.velY / 5;
			this.y = game.height;
		}
	}
};

PlayerFish.prototype.increment = function() {
	this.applyPhysics();
	if (this.powerup != null && 'increment' in this.powerup) {
		this.powerup.increment(this);
		--this.powerupRemaining;
		if (this.powerupRemaining <= 0)
			this.setPowerup(null);
	}
	this.findClosestEnemy();
	this.preserveBounds();
};
