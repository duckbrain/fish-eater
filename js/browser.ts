import { GroupController, PlayerController } from "./controller";
import { Game } from "./game";
import { KeyController } from "./keycontroller";
import { TouchController } from "./touchcontroller";

function element(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error(`element ${id} not found`);
  }
  return el;
}

export class Browser {
  backButton = element("back");
  canvas = element("canvas") as HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  _music = "";
  _mp3s = {};

  constructor() {
    const ctx = this.canvas.getContext("2d");
    if (!ctx) {
      throw new Error(`canvas: unable to make drawing context`);
    }
    this.ctx = ctx;
  }

  bind(game: Game) {
    const reload = () => this.reloadScale(game);
    window.addEventListener("resize", reload, false);
    window.addEventListener("orientationchange", reload, false);
    reload(); // set initial scale
  }

  reloadScale(game: Game) {
    if (!this.canvas) {
      return;
    }
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    var xScale = this.canvas.width / game.width;
    var yScale = this.canvas.height / game.height;
    game.scale = xScale < yScale ? xScale : yScale;
    game.xPan = this.canvas.width / 2 - (game.width * game.scale) / 2;
    game.redraw();
  }

  toggleBackButton(show: boolean) {
    this.backButton.style.display = show ? "block" : "none";
  }

  playerControls(game: Game, numPlayers: number): PlayerController {
    if (numPlayers !== 1) {
      throw new Error("only supports 1 player");
    }
    return new GroupController(
      new KeyController(game, "wasd"),
      new TouchController(game, this.canvas),
    );
  }

  setMusic(val: string, restart: boolean) {
    //TODO: Add music to mp3s (if needed) and fade in the new music
    if (this._music != val) {
      var fade = function (audio: HTMLAudioElement, diration: number) {
        if (diration > 0) audio.play();
        else audio.pause();
      };
      var looper = function () {
        this.currentTime = 0;
        this.play();
      };

      if (this._music) fade(this._mp3s[this._music], -1);
      if (val) {
        var mp3: HTMLAudioElement;
        if (!(val in this._mp3s)) {
          mp3 = this._mp3s[val] = new Audio("audio/" + val);
          mp3.addEventListener("ended", looper, false);
        } else mp3 = this._mp3s[val];

        fade(mp3, 1);
      }
      this._music = val;
    }
    if (restart) {
      var mp3Player = this._mp3s[val];
      if (mp3Player.readyState == 4) mp3Player.currentTime = 0;
    }
  }

  play() {
    if (this._music) this._mp3s[this._music].play();
  }
  pause() {
    if (this._music) this._mp3s[this._music].pause();
  }
}
