Sun = function () {
  this.rotation = 0;
  this.interval = 0.01;
  this.size = 30;
  this.rayDist = 10;
  this.rayLength = 30;
  this.rayCount = 30;
  this.x = 0;
  this.y = 0;

  this.increment = function () {
    this.rotation += this.interval;
  };
  this.draw = function (ctx) {
    var p = game.transform(this.x, this.y, this.size);

    ctx.fillStyle = "Yellow";
    ctx.strokeStyle = "Yellow";
    ctx.lineWidth = 1 * game.scale;
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
            game.scale,
        p.y +
          Math.sin(theta + this.rotation) *
            (this.size + this.rayDist) *
            game.scale,
      );
      ctx.lineTo(
        p.x +
          Math.cos(theta + this.rotation) *
            (this.size + this.rayDist + this.rayLength) *
            game.scale,
        p.y +
          Math.sin(theta + this.rotation) *
            (this.size + this.rayDist + this.rayLength) *
            game.scale,
      );
    }

    ctx.stroke();
  };
};

WaterLevel = function () {
  this.targetWaterLevel = 100;
  this.framesToNextChange = 0;
  this.interval = 1;
  this.color = new Color(0, 0, 255, 0.5);
  this.hurtColor = new Color(255, 0, 0, 0.5);
};
WaterLevel.prototype = {
  increment: function () {
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
  },
  draw: function (ctx) {
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
  },
};
