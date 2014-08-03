TouchController = function(bound) {
	var self = this;
	this.myTouch = null;
	this.controlSize = 30;
	this.controlColor = 'red';
	this.pauseTime = 100;
	this.bound = bound || 0; // -1 for left, 1 for right, 0 for fullscreen
	
	this.xStart = NaN;
	this.yStart = NaN;
	this.x = NaN;
	this.y = NaN;
	this.leftCircle = false;
	this.timeDown = null;
	
	this.onTouchStart = function(e) {
		e.preventDefault();
		if (self.myTouch == null) {
			var x , y, id;
			if (e.pointerType) // MS Touch Screen
			{
				x = e.clientX;
				y = e.clientY;	
				id = e.pointerId;
			} else {
				x = e.changedTouches[0].clientX;
				y = e.changedTouches[0].clientY;
				id = e.changedTouches[0].identifier;
			}
			var halfScreen = game.canvas.clientWidth / 2
			if (self.bound == -1 && x >= halfScreen)
				return;
			if (self.bound == 1 && x <= halfScreen)
				return;
			self.myTouch = id;
			self.x = x;
			self.y = y;
			self.timeDown = new Date();
			self.xStart = x;
			self.yStart = y;
			self.leftCircle = false;
		}
		if (game.getPaused())
			game.loop();
	};
	this.onTouchEnd = function(e) {
		if (self.myTouch == null)
			return;
		e.preventDefault();
		if (e.pointerId) {
			if (e.pointerId== self.myTouch) {
				if (!self.leftCircle) {
					game.togglePaused();
				}
				self.myTouch = null;
				self.x = NaN;
				self.y = NaN;
				self.up = false;
				self.down = false;
				self.left = false;
				self.right = false;
			}
			else return;
		} else {
			for (var i in e.changedTouches) {
				if (e.pointerId == self.myTouch || e.changedTouches[i].identifier == self.myTouch) {
					
					if (!self.leftCircle && new Date() - self.timeDown <= self.pauseTime) {
						game.togglePaused();
					}
					self.myTouch = null;
					self.x = NaN;
					self.y = NaN;
					self.up = false;
					self.down = false;
					self.left = false;
					self.right = false;
					break;
				}
			}
		}
		if (game.getPaused())
			game.loop();
	};
	
	this.onTouchMove = function(e) {
		if (self.myTouch == null)
			return;
		e.preventDefault();
		if (e.pointerId) {
			if (e.pointerId== self.myTouch) {
				self.x = e.clientX;
				self.y = e.clientY;
			}
			else return;
		} else {
			var i;
			for (i = 0; i < e.changedTouches.length; i++)
			if (e.changedTouches[i].identifier == self.myTouch) {
				self.x = e.changedTouches[i].clientX;
				self.y = e.changedTouches[i].clientY;
				break;
			}
		}
		
		var xd = self.x - self.xStart;
		var yd = self.y - self.yStart;
		var dist = Math.min(Math.sqrt(xd*xd + yd*yd), self.controlSize) / self.controlSize;
		var angle = Math.atan2(self.yStart - self.y, self.xStart - self.x);
		var overlap = 0.15;
		/*self.up = (angle >= 0.25-overlap) && (angle <= 0.75+overlap);
		self.down = (angle <= -0.25+overlap) && (angle >= -0.75-overlap);
		self.left = (angle > 0 && angle <= 0.25+overlap) || (angle < 0 && angle >= -0.25-overlap);
		self.right = (angle >= 0.75-overlap) || (angle <= -0.75+overlap);
		
		self.up = self.up ? dist : 0;
		self.down = self.down ? dist : 0;
		self.left = self.left ? dist : 0;
		self.right = self.right ? dist : 0;*/
		
		if (yd < 0) {
			self.up = Math.sin(angle) * dist;
			self.down = 0;
		}
		else {
			self.up = 0
			self.down = Math.sin(angle) * dist * -1;
		}
		if (xd < 0) {
			self.left = Math.cos(angle) * dist;
			self.right = 0;
		} else {
			self.left = 0;
			self.right = Math.cos(angle) * dist * -1;
		}
		console.log(Math.sin(angle) + ", " + Math.cos(angle))
			

		self.leftCircle = dist == 1;
		if (game.getPaused())
			game.loop();
	};
	
	this.increment = function() {
	};
	
	this.draw = function(ctx) {
		if (this.myTouch != null)
		{
			ctx.strokeStyle = this.controlColor;
			ctx.beginPath();
			ctx.arc(this.xStart, this.yStart, this.controlSize, 0, 2*Math.PI, true);
			ctx.closePath();
			ctx.stroke();
			ctx.fillStyle = this.controlColor;
			ctx.lineWidth = 3;
			ctx.beginPath();
			ctx.arc(this.x, this.y, 10, 0, 2*Math.PI, true);
			ctx.closePath();
			ctx.fill();
		}
	}
	
	this.init = function() {
		game.canvas.addEventListener('touchstart', this.onTouchStart);
		game.canvas.addEventListener('touchend', this.onTouchEnd);
		game.canvas.addEventListener('touchleave', this.onTouchEnd);
		game.canvas.addEventListener('touchmove', this.onTouchMove);
		//IE compatibility
		game.canvas.addEventListener('MSPointerDown', this.onTouchStart);
		game.canvas.addEventListener('MSPointerUp', this.onTouchEnd);
		game.canvas.addEventListener('MSPointerOut', this.onTouchEnd);
		game.canvas.addEventListener('MSPointerMove', this.onTouchMove);
		game.drawablesTop.push(this);
	};
	this.deinit = function() {
		game.canvas.removeEventListener('touchstart', this.onTouchStart);
		game.canvas.removeEventListener('touchend', this.onTouchEnd);
		game.canvas.removeEventListener('touchleave', this.onTouchEnd);
		game.canvas.removeEventListener('touchmove', this.onTouchMove);
		//IE compatibility
		game.canvas.removeEventListener('MSPointerDown', this.onTouchStart);
		game.canvas.removeEventListener('MSPointerUp', this.onTouchEnd);
		game.canvas.removeEventListener('MSPointerOut', this.onTouchEnd);
		game.canvas.removeEventListener('MSPointerMove', this.onTouchMove);
		
	};
};
TouchController.prototype = new PlayerController();
