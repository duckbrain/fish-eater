import { Fish, FishController } from "./fish";
import { Game } from "./game";
import { PlayerFish } from "./playerfish";
import { powerups } from "./powerups";

export class EnemyFishController extends FishController {
  iq = 1;
  speedVert = 0.2;

  constructor(iq = 1) {
    super();
    this.iq = iq;
  }

  apply(fish: EnemyFish) {
    const { game } = fish;
    let up = false,
      down = false;
    var closestDist: number | undefined;
    if (this.iq > 1) {
      var closest = game.players[0];
      closestDist = closest.distanceTo(fish);
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
      up = run !== closest.y < fish.y;
      down = run !== closest.y > fish.y;
    }
    if (up) fish.velY -= this.speedVert;
    if (down) fish.velY += this.speedVert;
    fish.velX = fish.facingRight ? fish.speed : -fish.speed;
  }
  init() {}
  deinit() {}
}

export class EnemyFish extends Fish {
  closestPlayer: PlayerFish | null;

  constructor(game: Game) {
    super(game);
    if (Math.floor(Math.random() * 5) == 0) {
      this.powerup = powerups.getRandomPowerup();
    }
    this.setController(game.enemyFishController);
  }

  getColor() {
    return !this.game.smallestPlayer?.edible(this)
      ? "red"
      : this.powerup
        ? "purple"
        : "green";
  }

  onCollision(f: PlayerFish) {
    if (f.edible(this)) {
      this._destroy = true;
    }
  }

  getEyeDirection() {
    if (this.closestPlayer)
      return Math.atan2(
        this.y - this.closestPlayer.y,
        this.x - this.closestPlayer.x,
      );
    else {
      return super.getEyeDirection();
    }
  }
}

export class EnemyFish2 extends EnemyFish {
  constructor(game: Game) {
    super(game);
    this.closestPlayer = null;
    this.setController(game.enemyFishController2);
  }
}
