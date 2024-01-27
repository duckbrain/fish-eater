function EnemyFishController() {
  this.iq = 1;
  this.speedVert = 0.2;
}
EnemyFishController.prototype = {
  apply: function (fish) {
    if (this.iq > 1) {
      var closest = game.players[0];
      var closestDist = closest.distanceTo(fish);
      for (var i = 0; i < game.players.length; ++i) {
        var p = game.players[i];
        var dist = p.distanceTo(fish);
        if (dist < closestDist) {
          closest = p;
          closestDist = dist;
        }
      }
      fish.closestPlayer = closest;
      var run = closest.edible(fish);
      this.up = run ^ (closest.y < fish.y);
      this.down = run ^ (closest.y > fish.y);
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
  init: function () {},
  deinit: function () {},
};

function EnemyFish() {
  if (Math.floor(Math.random() * 5) == 0) {
    this.powerup = powerups.getRandomPowerup();
  }
  this.setController(game.enemyFishController);
}
EnemyFish.prototype = new Fish();
EnemyFish.prototype.getColor = function () {
  return !game.smallestPlayer.edible(this)
    ? "red"
    : this.powerup
      ? "purple"
      : "green";
};
EnemyFish.prototype.onCollision = function (f) {
  if (f.edible(this)) {
    this._destroy = true;
  }
};
EnemyFish.prototype.getEyeDirection = function () {
  if (this.closestPlayer)
    return Math.atan2(
      this.y - this.closestPlayer.y,
      this.x - this.closestPlayer.x,
    );
  else return Fish.prototype.getEyeDirection.call(this);
};

function EnemyFish2() {
  this.closestPlayer = null;
  this.setController(game.enemyFishController2);
}
EnemyFish2.prototype = EnemyFish.prototype;
