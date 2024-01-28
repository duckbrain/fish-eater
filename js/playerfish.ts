import { Fish } from "./fish";
import { PowerUp } from "./powerups";

export class PlayerFish extends Fish {
  health = 50;
  size = 100;
  x = 75;
  y = 75;
  closestEnemy: Fish | null = null;
  hurt = false;

  //Score trackers
  fishEaten = 0;
  fishEatenSize = 0;
  powerupCount = 0;

  setPowerup(p: PowerUp | null) {
    const { game } = this;

    if (this.powerup) this.powerup.deinit(this);
    this.powerup = p;
    if (p) {
      p.init(this);
      this.powerupRemaining = p.timeLimit;
      game.setMusic(p.mp3, true);
      ++this.powerupCount;
    } else {
      game.setMusic(game.backgroundMusic);
      this.powerupRemaining = 0;
    }
  }

  getScore() {
    const { game } = this;

    var score = {
      total: 0,
      eating: this.fishEaten * 100,
      eatingSize: this.fishEatenSize,
      powerups: this.powerupCount * 200,
      health: (this.health / game.maxHealth) * 10000,
      size: (this.size / game.maxSize) * 10000,
    };
    score.total =
      score.eating +
      score.eatingSize +
      score.powerups +
      score.health +
      score.size;
    return score;
  }

  getEyeDirection() {
    if (this.closestEnemy)
      return Math.atan2(
        this.y - this.closestEnemy.y,
        this.x - this.closestEnemy.x,
      );
    else return Fish.prototype.getEyeDirection();
  }

  findClosestEnemy() {
    var closestDistance = Number.MAX_VALUE;
    var closestFish: Fish | null = null;
    this.game.enemies.forEach((e) => {
      var dist = this.distanceTo(e);
      if (closestDistance > dist) {
        closestFish = e;
        closestDistance = dist;
      }
    });
    this.closestEnemy = closestFish;
  }

  edible(fish: Fish) {
    return this.size > fish.size;
  }

  onCollision(f: Fish) {
    const { game } = this;

    if (this.edible(f)) {
      //Eat the little fish
      this.size += f.size * game.growthRate;
      ++this.fishEaten;
      this.fishEatenSize += f.size;
      this.health = Math.min(
        this.health + (f.size / this.size) * game.healthGain,
        game.maxHealth,
      );
      if (false) {
        //this.powerup == powerups.super) {
      } else {
        if (f.powerup) {
          this.setPowerup(f.powerup);
        }
      }
    } else {
      // You get hurt
      this.health -= (f.size / this.size) * game.healthLoss;
      this.hurt = true;
      if (this.health <= 0) {
        this.health = 0;
        this._destroy = true;
      }
    }
  }

  preserveBounds() {
    const { game } = this;

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
  }

  increment() {
    this.hurt = false;
    this.applyPhysics();
    if (this.powerup != null && "increment" in this.powerup) {
      this.powerup.increment(this);
      --this.powerupRemaining;
      if (this.powerupRemaining <= 0) this.setPowerup(null);
    }
    this.findClosestEnemy();
    this.preserveBounds();
  }
}
