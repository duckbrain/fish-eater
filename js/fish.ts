import { Color } from "./color";
import { DrawingContext, Game } from "./game";
import { PlayerFish } from "./playerfish";
import { PowerUp } from "./powerups";

export class FishController {
  init(_: Fish) { }
  deinit(_: Fish) { }
  apply(_: Fish) { }
}

export const NoOpFishController = new FishController();

export class Fish {
  game: Game;

  x = 0;
  y = 0;
  velX = 0;
  velY = 0;
  size = 1;
  color = new Color(255, 255, 0);
  lineColor = "black";
  eyeBack = "white";
  eyePupil = "black";
  tailDivideFactor = 0.5;
  tailLengthenFactor = 1;
  tailSpinFactor = 0;
  speed = 1;
  _controller: FishController = NoOpFishController;
  _destroy = false;
  facingRight = true;

  // Powerup
  powerup: PowerUp | null = null;
  powerupRemaining = 0;

  constructor(game: Game) {
    this.game = game;
  }

  getController() {
    return this._controller;
  }

  setController(val: FishController) {
    if (this._controller != null) this._controller.deinit(this);
    this._controller = val || NoOpFishController;
    if (val != null) val.init(this);
  }

  isInWater() {
    return this.y >= this.game.waterLevel;
  }

  getColor() {
    return this.color.toString();
  }

  getEyeDirection() {
    return this.facingRight ? Math.PI : 0;
  }

  distanceTo(f: Fish): number {
    var a = this.x - f.x;
    var b = this.y - f.y;
    return Math.sqrt(a * a + b * b);
  }

  drawBody(ctx: DrawingContext) {
    var p = this.game.transform(this.x, this.y, this.size / 2);
    const s = (this.game.scale * this.size) / 2;
    const b = true;
    if (this.facingRight) {
      p.w = Math.PI;
      p.h = -Math.PI;
    } else {
      p.w = 0;
      p.h = Math.PI * 2;
    }
    ctx.arc(p.x, p.y, s, p.w, p.h, b);
  }

  drawTail(ctx: DrawingContext, xMod?: number, yMod?: number) {
    xMod = xMod || 1;
    yMod = yMod || 1;
    const c1 = this.y - yMod * this.size;
    const c2 = this.y + yMod * this.size;
    let x: number;
    if (this.facingRight) x = this.x - xMod * this.size;
    else x = this.x + xMod * this.size;
    const a = this.game.transform(x, c1);
    const b = this.game.transform(x, c2);
    ctx.lineTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
  }

  drawEye(ctx: DrawingContext) {
    var angle = this.getEyeDirection();
    ctx.fillStyle == this.eyePupil;
    var x: number;
    if (this.facingRight) x = this.x + this.size / 4;
    else x = this.x - this.size / 4;
    var y = this.y - this.size / 4;
    var scaled = this.game.transform(x, y);
    x = scaled.x;
    y = scaled.y;
    ctx.beginPath();
    ctx.fillStyle = this.eyeBack;
    ctx.arc(x, y, (this.size * this.game.scale) / 10, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = this.eyePupil;
    ctx.arc(
      x - (Math.cos(angle) * this.size * this.game.scale) / 20,
      y - (Math.sin(angle) * this.size * this.game.scale) / 20,
      (this.size * this.game.scale) / 20,
      0,
      Math.PI * 2,
      true,
    );
    ctx.closePath();
    ctx.fill();
  }

  draw(ctx: DrawingContext) {
    if (typeof this.getColor == "function") ctx.fillStyle = this.getColor();
    ctx.beginPath();
    if (typeof this.drawBody == "function") this.drawBody(ctx);
    if (typeof this.drawTail == "function")
      this.drawTail(ctx, this.tailLengthenFactor, this.tailDivideFactor);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = this.lineColor;
    ctx.lineWidth = 1 * this.game.scale;
    if (this.game.showOutline) ctx.stroke();
    if (this.game.showEyes) this.drawEye(ctx);
  }

  applyPhysics() {
    if (this.isInWater()) {
      this.velX -= this.velX / this.game.friction;
      this.velY -= this.velY / this.game.friction;
      if (this.getController() != null) {
        this.getController().apply(this);
      }
    } else {
      this.velY += this.game.gravity;
    }
    this.x += this.velX;
    this.y += this.velY;
  }

  increment() {
    this.applyPhysics();
  }

  onCollision(_: PlayerFish) { }
}
