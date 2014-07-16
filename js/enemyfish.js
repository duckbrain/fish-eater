function EnemyFishController() {
	this.iq = 1;
	this.speedVert = .2;
}
EnemyFishController.prototype = {
	apply: function(fish) {
		if (this.iq > 1) {
			var closest = game.players[0];
			var closestDist = closest.distanceTo(fish);
			game.players.forEach(function(p){
				var dist = p.distanceTo(fish);
				if (dist < closestDist) {
					closest = p;
					closestDist = dist;
				}
			});
			fish.closestPlayer = closest;
			this.up = closest.y < fish.y;
			this.down = closest.y > fish.y;
		}
		if (this.iq == 3) {
			if (this.up) fish.velY -= this.speedVert / closestDist;
			if (this.down) fish.velY += this.speedVert / closestDist;
		} else {
			if (this.up) fish.velY -= this.speedVert;
			if (this.down) fish.velY += this.speedVert;
		}
		fish.velX = fish.facingRight ? fish.speed : -fish.speed;
	},
	init: function() {},
	deinit: function() {}
}

function EnemyFish() {
	if (Math.floor(Math.random() * 5))
		this.powerup = powerups.getRandomPowerup();
	this.setController(game.enemyFishController);
}
EnemyFish.prototype = new Fish();
EnemyFish.prototype.getColor = function() {
	return !game.smallestPlayer.edible(this) ? "red" : 
		(this.powerup ? "purple" : "green");
}
EnemyFish.prototype.onCollision = function(f) {
	if (f.edible(this)) {
		this._destroy = true;
	}
}
EnemyFish.prototype.getEyeDirection = function() {
	if (this.closestPlayer)
		return Math.atan2(this.y - this.closestPlayer.y, this.x - this.closestPlayer.x);
	else
		return Fish.prototype.getEyeDirection.call(this);
}

function EnemyFish2() {
	this.closestPlayer = null;
	this.setController(game.enemyFishController2);
}
EnemyFish2.prototype = EnemyFish.prototype;
