import { PlayerController } from "./controller";
import { EnemyFish, EnemyFish2, EnemyFishController } from "./enemyfish";
import { Sun, WaterLevel } from "./extras";
import { NoOpFishController } from "./fish";
import { PlayerFish } from "./playerfish";
import { Status } from "./status";

export type DrawingContext = CanvasRenderingContext2D;

interface Interface {
  ctx: DrawingContext;
  toggleBackButton(show: boolean): void;
  playerControls(game: Game, numPlayers: number): PlayerController;
  bind(game: Game): void;
  setMusic(filename: string, restart: boolean): void;
  play(): void;
  pause(): void;
}

interface Drawable {
  draw(ctx: DrawingContext): void;
}

export class Game {
  interface: Interface;

  // Game constants
  gravity = 1;
  time = 1; //TODO: Allow to be modified for powerups or refresh rate
  friction = 15;
  width = 1000;
  height = 600;

  waterLevel = 0;

  paused = true;
  enemies: EnemyFish[] = [];
  players: PlayerFish[] = [];
  smallestPlayer: PlayerFish | null;
  growthRate = 1 / 15;
  maxHealth = 100;
  healthGain = 1;
  healthLoss = 1;
  maxSize = 200;
  gameOver = false;

  enemyFishController = new EnemyFishController(1);
  enemyFishController2 = new EnemyFishController(2);

  backgroundMusic = "background.mp3";
  sun: Sun;
  water: WaterLevel;
  showOutline = true;
  showEyes = true;

  backgroundColor = "lightblue";
  ctx: DrawingContext;
  canvas: Readonly<{ width: number; height: number }>;

  //Drawing Transforms
  scale = 1;
  xPan = 0;
  yPan = 0;

  _interval: number | undefined;
  pausedMessage = "Paused";

  drawablesTop: Drawable[];
  drawablesBottom: Drawable[];

  constructor(iface: Interface) {
    this.interface = iface;
    this.ctx = iface.ctx;
    //@ts-ignore TODO pass this through
    this.canvas = iface.canvas;

    this.sun = new Sun(this);
    this.water = new WaterLevel(this);

    this.drawablesTop = [this.water];
    this.drawablesBottom = [this.sun];
    iface.bind(this);
  }

  getPaused() {
    return !this._interval;
  }

  setPaused(val: boolean | string) {
    console.log("setting paused", val);
    if (val === this.getPaused()) {
      return;
    }
    if (typeof val == "string") {
      this.pausedMessage = val;
    } else {
      this.pausedMessage = "Paused";
    }
    if (!val) {
      if (this.gameOver) {
        this.reset();
        return;
      }
      this.interface.play();
      this._interval = setInterval(() => {
        this.loop();
      }, 30);
    } else {
      clearInterval(this._interval);
      this.interface.pause();
      this._interval = undefined;
    }
    this.interface.toggleBackButton(!!val);
    this.loop();
  }

  togglePaused() {
    this.setPaused(!this.getPaused());
  }

  win() {
    this.gameOver = true;
    this.setPaused("You Win!");
    this.setMusic("win.mp3");
  }

  lose() {
    this.gameOver = true;
    this.setPaused("You Lose");
    this.setMusic("lose.mp3");
  }

  setMusic(val, restart: boolean = false) {
    this.interface.setMusic(val, restart);
  }

  transform(x?: number, y?: number, w?: number, h?: number) {
    return {
      x: x ? x * this.scale + this.xPan : this.xPan,
      y: y ? y * this.scale + this.yPan : this.yPan,
      w: w ? w * this.scale : 0,
      h: h ? h * this.scale : 0,
    };
  }

  checkGameOver() {
    for (let i = 0; i < this.players.length; ++i) {
      if (this.players[i]._destroy) {
        this.lose();
      }
      if (this.players[i].size > this.maxSize) {
        this.win();
      }
    }
  }

  /** reset starts a new game. */
  reset() {
    for (var i = 0; i < this.players.length; ++i) {
      var p = this.players[i];
      p.setController(NoOpFishController);
      p.setPowerup(null);
    }
    this.gameOver = false;
    this.players = [];
    this.enemies = [];
    this.drawablesTop = [this.water];
    this.drawablesBottom = [this.sun];
    let f = new PlayerFish(this);
    f.size = 30;
    f.setController(this.interface.playerControls(this, 1));
    this.players.push(f);
    this.drawablesTop.push(new Status(f));

    this.setPaused(false);
    this.setMusic(this.backgroundMusic);
  }

  redraw() {
    // TODO Only draw, no frame step
    this.loop();
  }

  loop() {
    this.smallestPlayer = this.players[0];
    var paused = this.getPaused();

    for (let i = 1; i < this.players.length; ++i)
      if (this.players[i].size < this.smallestPlayer.size)
        this.smallestPlayer = this.players[i];

    if (!this.smallestPlayer) return;

    //Determine if a new fish needs to be added
    if (this.enemies.length < 500 / this.smallestPlayer.size) {
      this.newFish();
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = this.backgroundColor;
    this.ctx.fillRect(
      this.xPan,
      this.yPan,
      this.width * this.scale,
      this.height * this.scale,
    );

    const loopArray = (array: (Drawable & { increment?(): void })[]) => {
      for (let i = 0; i < array.length; ++i) {
        var f = array[i];
        if (!paused && f.increment) {
          f.increment();
        }
        f.draw(this.ctx);
      }
    };

    // Loop Elements
    loopArray(this.drawablesBottom);

    for (let i = 0; i < this.players.length; ++i) {
      if (!paused) {
        this.players[i].increment();
      }
    }

    for (let i = 0; i < this.enemies.length; ++i) {
      var f = this.enemies[i];
      if (!paused) f.increment();
      for (let j = 0; j < this.players.length; ++j) {
        const player = this.players[j];
        if (player.distanceTo(f) <= (player.size + f.size) / 2) {
          f.onCollision(player);
          player.onCollision(f);
        }
        if (f._destroy) {
          this.enemies.splice(i--, 1);
          break;
        }
      }

      if (f.x < -f.size * 1.5 || f.x > this.width + f.size * 1.5)
        this.enemies.splice(i--, 1);
      else f.draw(this.ctx);
    }

    for (let i = 0; i < this.players.length; ++i) {
      this.players[i].draw(this.ctx);
    }

    // Cover edges
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, 0, this.xPan, this.canvas.height);
    this.ctx.fillRect(
      this.canvas.width - this.xPan,
      0,
      this.xPan,
      this.canvas.height,
    );
    this.ctx.fillRect(
      0,
      this.yPan + this.height * this.scale,
      this.width * this.scale,
      this.canvas.height,
    );

    loopArray(this.drawablesTop);

    if (!this.getPaused()) this.checkGameOver();
    else {
      this.ctx.fillStyle = "black";
      this.ctx.font = 50 * this.scale + "pt Arial";
      var v = this.ctx.measureText(this.pausedMessage);
      this.ctx.fillText(
        this.pausedMessage,
        this.canvas.width / 2 - v.width / 2,
        (this.height * this.scale) / 2,
      );
    }
  }

  newFish() {
    if (!this.smallestPlayer) {
      throw new Error(
        `cannot determine size of new fish without smallest player size`,
      );
    }
    var f: EnemyFish;
    if (Math.floor(Math.random() * 100) <= 10) {
      f = new EnemyFish2(this);
    } else {
      f = new EnemyFish(this);
    }
    f.y = Math.random() * this.height;
    var avgSize = this.smallestPlayer.size;
    f.size = Math.max(
      Math.min((Math.random() * avgSize * 3) / 2 + avgSize / 2, 200),
      20,
    );
    f.velX = (Math.random() * f.size) / 7 - f.size / 14;
    if (Math.abs(f.velX) < 1)
      if (f.velX > 0) f.velX += 1;
      else f.velX -= 1;
    if (f.velX < 0) {
      f.x = this.width + f.size;
      f.facingRight = false;
    } else {
      f.x = -f.size;
      f.facingRight = true;
    }
    f.speed = Math.abs(f.velX);
    this.enemies.push(f);
  }
}
