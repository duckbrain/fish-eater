// Basic fish class

Fish = function() {
	// TODO: Initialize randomly if passed game info
	this.x = 0;
	this.y = 0;
	this.velX = 0;
	this.velY = 0;
	this.size = 1;
	this.lineColor = "black";
	this.eyeBack = "white";
	this.eyePupil = "black";
	this.speed = 2;
	this._controller = null;	
	this.facingRight = true;
	
	// Powerup
	this.powerup = null;
	this.powerupRemaining = 0;
	
};
Fish.prototype = {
	getController: function() { return this._controller; },
	setController: function(val) {
		if (this._controller != null)
			this._controller.deinit(this);
		this._controller = val;
		if (val != null)
			val.init(this); 
	},
	isInWater: function() {
		return this.y >= game.waterLevel;
	},
	getColor: function() { return "black"; },
	getEyeDirection: function() { return this.facingRight ? Math.PI : 0; },
	
	distanceTo: function(f) { 
		var a = this.x - f.x;
		var b = this.y - f.y;
		return Math.sqrt(a*a + b*b); 
	},
	
	drawBody: function(ctx) {
		var p = game.transform(this.x, this.y, this.size / 2);
		p.s = game.scale * this.size / 2
		p.b = true;
		if (this.facingRight) {
			p.w = Math.PI;
			p.h = -Math.PI;
		}
		else {
			p.w = 0;
			p.h = Math.PI * 2;
		}
		ctx.arc(p.x, p.y, p.s, p.w, p.h, p.b);
	},
	drawTail: function(ctx, xMod, yMod) {
		xMod = xMod || 1;
		yMod = yMod || 1;
		var a, b;
		var x, c1, c2;
		c1 = this.y - yMod * this.size / 2;
		c2 = this.y + yMod * this.size / 2;
		if (this.facingRight)
			x = this.x - xMod * this.size;
		else
			x = this.x + xMod * this.size;
		a = game.transform(x, c1);
		b = game.transform(x, c2);
		ctx.lineTo(a.x, a.y);
		ctx.lineTo(b.x, b.y);
	},
	drawEye: function(ctx) {
		var angle = this.getEyeDirection();
		ctx.fillStyle == this.eyePupil;
		var x;
		if (this.facingRight)
			x = this.x + this.size / 4;
		else
			x = this.x - this.size / 4;
		var y = this.y - this.size / 4;
		var scaled = game.transform(x, y);
		x = scaled.x;
		y = scaled.y;
		ctx.beginPath();
		ctx.fillStyle = this.eyeBack;
		ctx.arc(x, y, this.size * game.scale / 10, 0, Math.PI * 2, true);
		ctx.closePath();
		ctx.fill();
		ctx.beginPath();
		ctx.fillStyle = this.eyePupil;
		ctx.arc(x - (Math.cos(angle) * this.size * game.scale / 20), y - (Math.sin(angle) * this.size * game.scale / 20), this.size * game.scale / 20, 0, Math.PI * 2, true);
		ctx.closePath();
		ctx.fill();
	},
	draw: function(ctx) {
		if (typeof(this.getColor) == "function")
			ctx.fillStyle = this.getColor();
		ctx.beginPath();
		if (typeof(this.drawBody) == "function")
			this.drawBody(ctx);
		if (typeof(this.drawTail) == "function")
			this.drawTail(ctx);
		ctx.closePath();
		ctx.fill();
		ctx.strokeStyle = this.lineColor;
		ctx.lineWidth = 1 * game.scale;
		if (game.showOutline)
			ctx.stroke();
		if (game.showEyes)
			this.drawEye(ctx);
	},
	applyPhysics: function() {
		if (this.isInWater()) {
			this.velX -= this.velX / game.friction;
			this.velY -= this.velY / game.friction;
			if (this.getController() != null) {
				this.getController().apply(this);
			}
		} else {
			this.velY += game.gravity;
		}
		this.x += this.velX;
		this.y += this.velY;
	},
	increment: function() {
		this.applyPhysics();
	},
	onCollision: function() {}
}