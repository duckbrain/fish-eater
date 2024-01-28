import { PlayerController } from "./controller";
import { DrawingContext, Game } from "./game";
import { PlayerFish } from "./playerfish";

interface MSPointerEvent extends Event {
  pointerType: any;
  clientX: number;
  clientY: number;
  pointerId: string;
}

export class TouchController extends PlayerController {
  constructor(game: Game, canvas: HTMLElement, bound: -1 | 1 | 0 = 0) {
    super();
    this.game = game;
    this.canvas = canvas;
    this.bound = bound;
  }

  game: Game;
  fish: PlayerFish;
  canvas: HTMLElement;
  bound: -1 | 1 | 0;
  myTouch = null;
  controlSize = 30;
  controlColor = "red";
  pauseTime = 300;

  xStart = NaN;
  yStart = NaN;
  lastTap = false;
  x = NaN;
  y = NaN;
  leftCircle = false;
  timeDown: number = 0;

  apply(fish: PlayerFish): void {
    this.fish = fish;
    super.apply(fish);
  }

  onTouchStart = (e: TouchEvent | MSPointerEvent) => {
    e.preventDefault();
    if (this.myTouch == null) {
      var x, y, id;
      if ("pointerType" in e) {
        // MS Touch Screen
        x = e.clientX;
        y = e.clientY;
        id = e.pointerId;
      } else {
        x = e.changedTouches[0].clientX;
        y = e.changedTouches[0].clientY;
        id = e.changedTouches[0].identifier;
      }
      var halfScreen = this.game.canvas.width / 2;
      if (this.bound == -1 && x >= halfScreen) return;
      if (this.bound == 1 && x <= halfScreen) return;
      this.myTouch = id;
      this.x = x;
      this.y = y;
      this.timeDown = Date.now();
      this.xStart = x;
      this.yStart = y;
      this.leftCircle = false;
    }
    if (this.game.getPaused()) this.game.loop();
  };
  onTouchEnd = (e: TouchEvent | MSPointerEvent) => {
    if (this.myTouch == null) return;
    e.preventDefault();

    const { game } = this;

    const handle = () => {
      if (!this.leftCircle && Date.now() - this.timeDown <= this.pauseTime) {
        if (this.game.getPaused()) {
          this.game.togglePaused();
        } else {
          if (this.lastTap) {
            if (this.fish?.powerup != null) {
              this.depower = true;
            } else {
              this.game.togglePaused();
            }
            this.lastTap = false;
          } else {
            this.lastTap = true;
          }
        }
      } else {
        this.lastTap = false;
      }
      this.myTouch = null;
      this.x = NaN;
      this.y = NaN;
      this.up = 0;
      this.down = 0;
      this.left = 0;
      this.right = 0;
    };

    if ("pointerId" in e) {
      if (e.pointerId == this.myTouch) {
        handle();
      } else return;
    } else {
      for (var i in e.changedTouches) {
        if (
          e.pointerId == this.myTouch ||
          e.changedTouches[i].identifier == this.myTouch
        ) {
          handle();
          break;
        }
      }
    }
    if (game.getPaused()) game.loop();
  };

  onTouchMove = (e: TouchEvent | MSPointerEvent) => {
    if (this.myTouch == null) return;
    e.preventDefault();

    const { game } = this;

    if ("pointerId" in e) {
      if (e.pointerId == this.myTouch) {
        this.x = e.clientX;
        this.y = e.clientY;
      } else return;
    } else {
      for (let i = 0; i < e.changedTouches.length; i++)
        if (e.changedTouches[i].identifier == this.myTouch) {
          this.x = e.changedTouches[i].clientX;
          this.y = e.changedTouches[i].clientY;
          break;
        }
    }

    var xd = this.x - this.xStart;
    var yd = this.y - this.yStart;
    var dist =
      Math.min(Math.sqrt(xd * xd + yd * yd), this.controlSize) /
      this.controlSize;
    var angle = Math.atan2(this.yStart - this.y, this.xStart - this.x);
    var overlap = 0.15;

    if (yd < 0) {
      this.up = Math.sin(angle) * dist;
      this.down = 0;
    } else {
      this.up = 0;
      this.down = Math.sin(angle) * dist * -1;
    }
    if (xd < 0) {
      this.left = Math.cos(angle) * dist;
      this.right = 0;
    } else {
      this.left = 0;
      this.right = Math.cos(angle) * dist * -1;
    }
    console.log(Math.sin(angle) + ", " + Math.cos(angle));

    this.leftCircle = dist == 1;
    if (game.getPaused()) game.loop();
  };

  increment() {
    this.depower = false;
  }

  draw(ctx: DrawingContext) {
    if (this.myTouch != null) {
      ctx.strokeStyle = this.controlColor;
      ctx.beginPath();
      ctx.arc(this.xStart, this.yStart, this.controlSize, 0, 2 * Math.PI, true);
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = this.controlColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 10, 0, 2 * Math.PI, true);
      ctx.closePath();
      ctx.fill();
    }
  }

  init() {
    const { canvas, game } = this;
    canvas.addEventListener("touchstart", this.onTouchStart);
    canvas.addEventListener("touchend", this.onTouchEnd);
    canvas.addEventListener("touchleave", this.onTouchEnd);
    canvas.addEventListener("touchmove", this.onTouchMove);
    //IE compatibility
    canvas.addEventListener("MSPointerDown", this.onTouchStart);
    canvas.addEventListener("MSPointerUp", this.onTouchEnd);
    canvas.addEventListener("MSPointerOut", this.onTouchEnd);
    canvas.addEventListener("MSPointerMove", this.onTouchMove);
    game.drawablesTop.push(this);
  }

  deinit() {
    const { canvas } = this;
    canvas.removeEventListener("touchstart", this.onTouchStart);
    canvas.removeEventListener("touchend", this.onTouchEnd);
    canvas.removeEventListener("touchleave", this.onTouchEnd);
    canvas.removeEventListener("touchmove", this.onTouchMove);
    //IE compatibility
    canvas.removeEventListener("MSPointerDown", this.onTouchStart);
    canvas.removeEventListener("MSPointerUp", this.onTouchEnd);
    canvas.removeEventListener("MSPointerOut", this.onTouchEnd);
    canvas.removeEventListener("MSPointerMove", this.onTouchMove);
  }
}
