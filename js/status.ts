import { Color } from "./color";
import { DrawingContext } from "./game";
import { PlayerFish } from "./playerfish";

type Row =
  | {
    text: string;
    title: string;
    height: number;
  }
  | {
    color: Color;
    value: number;
    max: number;
    height: number;
  };

export class Status {
  constructor(fish: PlayerFish) {
    this.fish = fish;
  }

  fish: PlayerFish;
  side = 1; //-1 = top left, 1 = top right, 0 = top center
  size?: number;
  width = 200;
  buffer = 5;

  data: Row[] = [];

  color = new Color();
  backgroundColor = new Color(100, 100, 100, 0.3);
  barBackground = new Color(200, 200, 200, 0.3);

  draw(ctx: DrawingContext) {
    const { game } = this.fish;
    var scale = Math.max(game.scale, 1);
    var b = this.buffer * scale;
    var width = this.width * scale;
    var height = b * 2;
    var d: Row;
    for (let i = 0; i < this.data.length; ++i) {
      d = this.data[i];
      height += d.height * scale + b;
    }
    var y = 0,
      x = game.width * game.scale - width;

    if (this.side == -1) x = b;
    if (this.size == 0) x = (game.width * scale) / 2 - width / 2;

    // TODO: Draw the panel. Only scale if scaling down.
    ctx.fillStyle = this.backgroundColor.toString();
    ctx.fillRect(x, y, width, height);
    x += b;
    y += b;
    width -= b * 2;

    for (let i = 0; i < this.data.length; ++i) {
      d = this.data[i];
      ctx.font = d.height * scale + "px FontAwesome";
      if ("text" in d) {
        ctx.fillStyle = this.color.toString();
        ctx.fillText(d.title + ": " + d.text, x, y + d.height * scale);
      } else {
        ctx.fillStyle = this.barBackground.toString();
        ctx.fillRect(x, y, width - b, d.height * scale);
        ctx.fillStyle = d.color.toString();
        ctx.fillRect(x, y, (width - b) * (d.value / d.max), d.height * scale);
        var percent = Math.round((100 * d.value) / d.max) + "%";
        var v = ctx.measureText(percent);
        ctx.fillStyle = this.color.toString();
        ctx.fillText(
          percent,
          x + width / 2 - v.width / 2,
          y + d.height * scale - scale * 2,
        );
      }
      y += d.height * scale + b;
    }

    return;
  }
  increment() {
    const { game } = this.fish;
    this.data = [];
    if (game.players.length > 1) {
      this.data.push({
        title: "Player",
        text: (game.players.indexOf(this.fish) + 1).toString(),
        height: 12,
      });
    }

    this.data.push({
      color: new Color(0, 0, 255),
      max: game.maxHealth,
      value: this.fish.health,
      height: 18,
    });

    if (this.fish.powerup) {
      this.data.push({
        color: new Color(255),
        max: this.fish.powerup.timeLimit,
        value: this.fish.powerupRemaining,
        height: 7,
      });
      this.data.push({
        title: "Power-Up",
        text: this.fish.powerup.displayText,
        height: 12,
      });
    }

    this.data.push({
      title: "Score",
      text: Math.floor(this.fish.getScore().total).toString(),
      height: 12,
    });
  }
}
