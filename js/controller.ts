import { PlayerFish } from "./playerfish";

// Class that determines how the fish will move
export class PlayerController {
  up = 0;
  down = 0;
  left = 0;
  right = 0;
  depower = false;
  speed = 2;

  apply(fish: PlayerFish) {
    const applyValue = (val: number, vel: "velX" | "velY", dir: 1 | -1) => {
      fish[vel] += fish.speed * val * dir;
    };

    applyValue(this.up, "velY", -1);
    applyValue(this.down, "velY", 1);
    applyValue(this.left, "velX", -1);
    applyValue(this.right, "velX", 1);
    if (this.left > 0 !== this.right > 0) {
      fish.facingRight = this.right > 0;
    }
    if (this.depower) {
      fish.setPowerup(null);
    }
  }
  init() {}
  deinit() {}
}

export class GroupController extends PlayerController {
  controllers: PlayerController[] = [];

  constructor(...controllers: PlayerController[]) {
    super();
    this.controllers = controllers;
  }

  apply(fish: PlayerFish) {
    this.right = this.left = this.down = this.up = 0;
    this.controllers.forEach((c) => {
      this.up = Math.min(this.up + c.up, 1);
      this.down = Math.min(this.down + c.down, 1);
      this.left = Math.min(this.left + c.left, 1);
      this.right = Math.min(this.right + c.right, 1);
      c.up = c.down = c.left = c.right = 0;
      c.apply(fish);

      if (c.depower) fish.setPowerup(null);
    });
    super.apply(fish);
  }
  init() {
    this.controllers.forEach(function (c) {
      c.init();
    });
  }
  deinit() {
    this.controllers.forEach(function (c) {
      c.deinit();
    });
  }
}
