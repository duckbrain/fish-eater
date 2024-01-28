import { Color } from "./color";
import { DrawingContext, Game } from "./game";

export class Sun {
  game: Game;

  rotation = 0;
  interval = 0.01;
  size = 30;
  rayDist = 10;
  rayLength = 30;
  rayCount = 30;
  x = 0;
  y = 0;

  constructor(game: Game) {
    this.game = game;
  }

  increment() {
    this.rotation += this.interval;
  }
  draw(ctx: DrawingContext) {
    var p = this.game.transform(this.x, this.y, this.size);

    ctx.fillStyle = "Yellow";
    ctx.strokeStyle = "Yellow";
    ctx.lineWidth = 1 * this.game.scale;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.w, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();

    for (
      var theta = 0;
      theta < Math.PI * 2;
      theta = theta + (Math.PI * 2) / this.rayCount
    ) {
      ctx.moveTo(
        p.x +
        Math.cos(theta + this.rotation) *
        (this.size + this.rayDist) *
        this.game.scale,
        p.y +
        Math.sin(theta + this.rotation) *
        (this.size + this.rayDist) *
        this.game.scale,
      );
      ctx.lineTo(
        p.x +
        Math.cos(theta + this.rotation) *
        (this.size + this.rayDist + this.rayLength) *
        this.game.scale,
        p.y +
        Math.sin(theta + this.rotation) *
        (this.size + this.rayDist + this.rayLength) *
        this.game.scale,
      );
    }

    ctx.stroke();
  }
}

export class WaterLevel {
  game: Game;

  targetWaterLevel = 100;
  framesToNextChange = 0;
  interval = 1;
  color = new Color(0, 0, 255, 0.5);
  hurtColor = new Color(255, 0, 0, 0.5);

  constructor(game: Game) {
    this.game = game;
  }

  increment() {
    const { game } = this;

    if (this.targetWaterLevel > game.waterLevel)
      game.waterLevel += this.interval;
    if (this.targetWaterLevel < game.waterLevel)
      game.waterLevel -= this.interval;
    if (
      this.targetWaterLevel == game.waterLevel &&
      --this.framesToNextChange > 0
    )
      this.targetWaterLevel = (Math.random() * game.height) / 3;
    if (
      this.targetWaterLevel == game.waterLevel &&
      this.framesToNextChange <= 0
    )
      this.framesToNextChange = Math.random() * 300 + 30;
  }

  draw(ctx: DrawingContext) {
    const { game } = this;
    if (game.players.length == 1) {
      ctx.fillStyle = (
        game.players[0].hurt ? this.hurtColor : this.color
      ).toString();
    } else {
      ctx.fillStyle = this.color.toString();
    }
    ctx.fillRect(
      game.xPan,
      game.yPan + game.waterLevel * game.scale,
      game.width * game.scale,
      game.height * game.scale - (game.yPan + game.waterLevel * game.scale),
    );
  }
}
