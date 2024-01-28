import { PlayerFish } from "./playerfish";
import { Color } from "./color";
import { DrawingContext } from "./game";
import { Fish, FishController } from "./fish";
import { EnemyFish } from "./enemyfish";

// Powerup array

/*
  "PacMan": 2,
  "Spawn": 4,
*/

//
// PowerUp Constructor
//
export class PowerUp {
  displayText: string;
  mp3: string;
  timeLimit: number;
  methods: string[] = [];

  tick = 0;
  tickSpeed = 0;

  init(fish: PlayerFish) {
    this.tick = 0;
    for (let method of this.methods) {
      fish["__old_" + method] = fish[method];
      //@ts-ignore
      fish[method] = this[method];
    }
  }
  deinit(fish: PlayerFish) {
    for (let method of this.methods) {
      //@ts-ignore
      fish[method] = fish["__old_" + method];
      delete fish["__old_" + method];
    }
  }
  increment(_: PlayerFish) {
    this.tick += this.tickSpeed;
  }
}

class FlyPowerUp extends PowerUp {
  tickSpeed = 0.7;
  displayText = "\uf072 Fly";
  mp3 = "fly.mp3";
  timeLimit = 600;
  methods = ["isInWater", "drawTail"];

  isInWater(this: PlayerFish) {
    return true;
  }

  drawTail(this: PlayerFish, ctx: DrawingContext) {
    var mod = Math.sin(this.powerup.tick);
    const c1 = this.y - (this.size * mod) / 2;
    const c2 = this.y + (this.size * mod) / 2;
    let x: number;
    if (this.facingRight) x = this.x - this.size;
    else x = this.x + this.size;
    const a = this.game.transform(x, c1);
    const b = this.game.transform(x, c2);
    ctx.lineTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
  }
}

class HealPowerUp extends PowerUp {
  tickSpeed = 0.3;
  hsv = {};
  color = new Color();
  displayText = "\uf0fe Heal";
  mp3 = "heal.mp3";
  timeLimit = 50;
  methods = ["getColor"];

  getColor(this: PlayerFish) {
    var hsv = this.color.getHSV();
    hsv.s = Math.abs(Math.cos(this.powerup.tick));
    this.powerup.color.setHSV(hsv);
    return this.powerup.color.toString();
  }

  increment(fish: PlayerFish) {
    fish.health = Math.min(fish.health + 1, fish.game.maxHealth);
    super.increment(fish);
  }
}

class FastPowerUp extends PowerUp {
  //TODO: Use Fish.tailDivideFactor to change tail size
  ratio = 1.5;
  displayText = "\uf050 Fast";
  mp3 = "fast.mp3";
  timeLimit = 300;
  methods = ["speed", "tailDivideFactor", "tailLengthenFactor"];
  tailDivideFactor = 0.3;
  tailLengthenFactor = 1.4;

  init(fish: PlayerFish) {
    super.init(fish);
    //@ts-ignore __old_speed will be set by the parent init
    fish.speed = fish.__old_speed * this.ratio;
  }
}

class InvinciblePowerUp extends PowerUp {
  displayText = "\uf005 Invincible";
  mp3 = "invincible.mp3";
  timeLimit = 500;
  methods = ["getColor", "distanceTo"];

  distanceTo(this: PlayerFish, f: Fish): number {
    if (this.edible(f)) return Fish.prototype.distanceTo.call(this, f);
    else return NaN;
  }
  onCollision(this: PlayerFish) { }
  getColor(this: PlayerFish) {
    return ("#0" + Math.round(0xffffff * Math.random()).toString(16)).replace(
      /^#0([0-9a-f]{6})$/i,
      "#$1",
    );
  }
}

class SongPowerUp extends PowerUp {
  displayText = "\uf001 Control Song";
  mp3 = "song.mp3";
  timeLimit = 300;

  controller = {
    speed: 1,
    upSpeed: 0.5,
    apply: function(fish: EnemyFish) {
      fish.velX = fish.facingRight ? this.speed : -this.speed;
      fish.velY -= this.upSpeed;
    },
    init: function() { },
    deinit: function() { },
  };

  __old_apply: any;

  init(fish: PlayerFish) {
    this.__old_apply = fish.game.enemyFishController.apply;
    fish.game.enemyFishController.apply = this.applyController;
  }
  deinit(fish: PlayerFish) {
    fish.game.enemyFishController.apply = this.__old_apply;
    this.__old_apply = undefined;
  }
  applyController(this: FishController, fish: EnemyFish) {
    fish.velY -= this.speedVert;
    fish.velX = fish.facingRight ? fish.speed : -fish.speed;
  }
}

//
// PacMan Powerup
//
class PacManPowerUp extends PowerUp {
  displayText = "\uf118 PacMan";
  mp3 = "pacman.mp3";
  timeLimit = 100;
  methods = ["drawBody", "edible"];
  tickSpeed = 1;

  edible(this: PlayerFish, fish: EnemyFish): boolean {
    return true;
  }
  drawBody(this: PlayerFish, ctx: DrawingContext) {
    const { game } = this;
    var p = game.transform(this.x, this.y, this.size / 2);
    var tick = Math.abs(Math.sin(this.powerup.tick / 5) / 2);
    const s = (game.scale * this.size) / 2;
    let tailOffset: number;
    if (this.facingRight) {
      p.w = tick;
      p.h = Math.PI * 2 - tick;
      tailOffset = -this.size * game.scale;
    } else {
      p.w = Math.PI - tick;
      p.h = -Math.PI + tick;
      tailOffset = this.size * game.scale;
    }
    ctx.arc(p.x, p.y, s, p.w, p.h, !this.facingRight);
    ctx.lineTo(p.x, p.y);
    ctx.lineTo(p.x + Math.cos(p.w) * s, p.y + Math.sin(p.w) * s);
    ctx.moveTo(p.x + tailOffset / 2, p.y);
  }
}

class TimeStopPowerUp extends PowerUp {
  displayText = "\uf017 Time Stop";
  mp3 = "timestop.mp3";
  timeLimit = 300;

  __old_increment: any;
  __old_color: any;

  init(fish: PlayerFish) {
    this.__old_increment = EnemyFish.prototype.increment;
    EnemyFish.prototype.increment = this.enemyIncrement;
    var hsv = fish.game.water.color.getHSV();
    this.__old_color = Object.assign({}, hsv);
    hsv.s /= 2;
    fish.game.water.color.setHSV(hsv);
    this.tick = 0;
  }

  deinit(fish) {
    EnemyFish.prototype.increment = this.__old_increment;
    this.__old_increment = undefined;

    fish.game.water.color.setHSV(this.__old_color);
    this.__old_color = undefined;
  }
  enemyIncrement = function() { };
}

class SuperPowerUp extends PowerUp {
  displayText = "\uf0e7 Super";
  mp3 = "super.mp3";
  timeLimit = 100;
  methods = [
    "tailDivideFactor",
    "tailLengthenFactor",
    "drawBody",
    "isInWater",
    "getColor",
    "edible",
    "onCollision",
    "setPowerup",
  ];
  tailDivideFactor = FastPowerUp.prototype.tailDivideFactor;
  tailLengthenFactor = FastPowerUp.prototype.tailLengthenFactor;
  isInWater = FlyPowerUp.prototype.isInWater;
  drawBody = PacManPowerUp.prototype.drawBody;
  getColor = InvinciblePowerUp.prototype.getColor;
  applyController = SongPowerUp.prototype.applyController;
  edible = PacManPowerUp.prototype.edible;

  onCollision(this: PlayerFish, otherFish: Fish) {
    var increase;
    if (otherFish.powerup == powerups["super"]) {
      increase = 100;
    } else if (otherFish.powerup == null) {
      increase = 5;
    } else {
      increase = 10;
    }
    increase *= otherFish.size / otherFish.game.maxSize;
    this.powerupRemaining = Math.min(
      this.powerup.timeLimit,
      this.powerupRemaining + increase,
    );
    this.__old_onCollision.call(this, otherFish);
  }
  setPowerup(this: PlayerFish, powerup: PowerUp | null) {
    if (powerup == null) {
      this.__old_setPowerup(powerup);
    }
  }
  init(fish) {
    PowerUp.prototype.init.call(this, fish);
    SongPowerUp.prototype.init.call(this, fish);
  }
  deinit(fish) {
    PowerUp.prototype.deinit.call(this, fish);
    SongPowerUp.prototype.deinit.call(this, fish);
  }
  increment(fish) {
    var p = powerups.asArray();
    ++this.tick;
    for (var i = 0; i < p.length; ++i) {
      if (p[i] != this) p[i].increment(fish);
    }
  }
}

export const powerups = {
  fly: new FlyPowerUp(),
  heal: new HealPowerUp(),
  super: new SuperPowerUp(),
  fast: new FastPowerUp(),
  invincible: new InvinciblePowerUp(),
  song: new SongPowerUp(),
  pacman: new PacManPowerUp(),
  timestop: new TimeStopPowerUp(),

  asArray: function() {
    var a: PowerUp[] = [];
    for (var name in this) {
      let p = this[name];
      if (p instanceof PowerUp) a.push(p);
    }
    return a;
  },

  getRandomPowerup: function() {
    var array = this.asArray();
    var i = Math.floor(Math.random() * array.length);
    return array[i];
  },
};
