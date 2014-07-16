function Game() {
	// Game constants
	this.gravity = 1;
	this.friction = 15;
	this.waterLevel = 0;
	this.width = 1000;
	this.height = 600;
	
	this.enemies = [];
	this.players = [];
	this.smallestPlayer = 0;
	this.growthRate = 1 / 15;
	this.maxHealth = 100;
	this.healthGain = 1;
	this.healthLoss = 1;
	this.maxSize = 200;
	this.gameOver = false;
	
	this.enemyFishController = new EnemyFishController();
	this.enemyFishController2 = new EnemyFishController();
	this.enemyFishController2.iq = 2;
	
	this.backgroundMusic = "background.mp3";
	this.sun = new Sun();
	this.waterLevel = 0;
	this.water = new WaterLevel();
	this.showOutline = true;
	this.showEyes = true;
	
	this.backgroundColor = "lightblue";
	this.ctx = null;
	this.canvas = null;
	this.scale = 1;	
	
	//Drawing Transforms
	this.scale = 1;
	this.xPan = 0;
	this.yPan = 0;
	
	this._interval = null;
	this.pausedMessage = "Paused";
	this._music = "";
	this._mp3s = { };
	
	this.drawablesTop = [this.water];
	this.drawablesBottom = [this.sun];
};
Game.prototype = {
	getPaused: function() { return this._interval == null; },
	setPaused: function(val) {
		if (val != this.paused) {
			if (typeof(val) == "string") {
				this.pausedMessage = val;
			} else {
				this.pausedMessage = "Paused";
			}
			if (!val) {
				if (this.gameOver) {
					this.reset();
					return;
				}
				if (this._music)
					this._mp3s[this._music].play();
				this._interval = setInterval(function() { game.loop(); }, 30);
			} else {
				clearInterval(this._interval);
				if (this._music)
					this._mp3s[this._music].pause();
				this._interval = null;
			}
		}
		this.loop();
	},
	togglePaused: function() { this.setPaused(!this.getPaused()); },
	
	win: function() {
		this.gameOver = true;
		this.setPaused("You Win!");
		this.setMusic("win.mp3");
	},
	lose: function() {
		this.gameOver = true;
		this.setPaused("You Lose");
		this.setMusic("loose.mp3");
	},
	
	getMusic: function() { return this._music; },
	setMusic: function(val) {
		//TODO: Add music to mp3s (if needed) and fade in the new music
		if (this._music != val) {
			var fade = function(audio, dir) {
				if (dir > 0)
					audio.play();
				else audio.pause();
			}
			var looper = function() {
				this.currentTime = 0;
				this.play();
			}
			
			if (this._music)
				fade(this._mp3s[this._music], -1);
			if (val) {
				var mp3;
				if (!(val in this._mp3s)) {
					mp3 = this._mp3s[val] = new Audio('audio/' + val);
					mp3.addEventListener('ended', looper, false);
				}
				else mp3 = this._mp3s[val];
				
				fade(mp3, 1);
			}
			this._music  = val;
		}
	},
	
	transform: function(x, y, w, h) {
		return {
			x: x ? x * this.scale + this.xPan : this.xPan,
			y: y ? y * this.scale + this.yPan : this.yPan,
			w: w ? w * this.scale : 0,
			h: h ? h * this.scale : 0
		}
	},
	init: function() {
		this.canvas = document.getElementById('canvas');
		this.ctx = this.canvas.getContext('2d');
		window.addEventListener('resize', this.reloadScale, false);
		window.addEventListener('orientationchange', this.reloadScale, false);
		this.reloadScale();
	},
	
	reloadScale: function() {
		game.canvas.width = window.innerWidth;
		game.canvas.height = window.innerHeight;
		var xScale = game.canvas.width / game.width;
		var yScale = game.canvas.height / game.height;
		game.scale = (xScale < yScale) ? xScale : yScale;
		game.xPan = game.canvas.width / 2 - game.width * game.scale / 2
		game.loop();
	},
	
	checkGameOver: function() {
		var i;
		for (i=0; i < this.players.length; ++i) {
			if (this.players[i]._destroy) {
				this.lose();
			}
			if (this.players[i].size > this.maxSize) {
				this.win();
			}
		}
	},
	
	setup: function() {
		f = new PlayerFish();
		f.size = 10;
		f.setController(new GroupController(new KeyController, new TouchController(-1)));
		this.players.push(f);
		this.drawablesTop.push(new Status(f));
		
		g = new PlayerFish();
		g.size = 10;
		g.x = 300;
		g.y = 75;
		//g.setController(new GroupController(new KeyController("wasd"), new TouchController(1)));
		//game.players.push(g);
		
		this.setPaused(false);
		this.setMusic(game.backgroundMusic)
	},
	
	reset: function() {
		for (var i = 0; i < this.players.length; ++i) {
			var p = this.players[i];
			p.setController(null);
			p.setPowerup(null);
		}
		this.gameOver = false;
		this.players = [];
		this.enemies = [];
		this.drawablesTop = [this.water];
	this.drawablesBottom = [this.sun];
		this.init();
		this.setup();
	},
	
	loop: function() {
		
		//game.width++;
		//game.height++;
		//game.reloadScale();
		
		this.smallestPlayer = this.players[0];
		var paused = this.getPaused();
		var i, j, player;
		
		for (i = 1; i < this.players.length; ++i)
			if (this.players[i].size < this.smallestPlayer.size)
				this.smallestPlayer = this.players[i];
				
		if (!this.smallestPlayer)
			return;
		
		//Determine if a new fish needs to be added
		if (game.enemies.length < 500 / this.smallestPlayer.size)
			this.newFish();
		
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.fillStyle = this.backgroundColor;
		this.ctx.fillRect(this.xPan, this.yPan, this.width * this.scale, this.height * this.scale);
		
		// Loop Elements
		for (i = 0; i < this.drawablesBottom.length; ++i) {
			var f = this.drawablesBottom[i];
			if (!paused)
				f.increment();
			f.draw(this.ctx);
		}
		
		for (i = 0; i < this.enemies.length; ++i) {
			var f = this.enemies[i];
			if (!paused)
				f.increment();
			for (j = 0; j < this.players.length; ++j) {
				player = this.players[j];
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
			else
				f.draw(this.ctx);
		}
		for (i = 0; i < this.players.length; ++i) {
			var f = this.players[i];
			if (!paused) {
				f.increment();
			}
			f.draw(this.ctx);
		}
		
		// Cover edges
		this.ctx.fillStyle = "white";
		this.ctx.fillRect(0,0,this.xPan, this.canvas.height);
		this.ctx.fillRect(this.canvas.width - this.xPan,0,this.xPan, this.canvas.height);
		this.ctx.fillRect(0, this.yPan + this.height * this.scale, this.width * this.scale, this.canvas.height);
		
		for (i = 0; i < this.drawablesTop.length; ++i) {
			var f = this.drawablesTop[i];
			if (!paused)
				f.increment();
			f.draw(this.ctx);
		}
		
		if (!this.getPaused())
			this.checkGameOver();
		else {
			this.ctx.fillStyle = 'black';
			this.ctx.font = 50 * this.scale + 'pt Arial';
			var v = this.ctx.measureText(this.pausedMessage);
			var p = this.transform(this.width / 2, this.height / 2);
			this.ctx.fillText(this.pausedMessage, this.canvas.width / 2 - v.width / 2, this.height * this.scale / 2);
		}
	},
	
	newFish: function() {
		var f;
		if (Math.floor(Math.random() * 100) <= 10 )
			{ f = new EnemyFish2(); }
//		else if (Math.floor(Math.random() * 100) == 1 )
//			{ f = new EnemyFish3(); } //TOOD: Change 2 into 3 to enable expiremental level 3 intelegence
		else {
			f = new EnemyFish();
		}
		if (f.size > this.maxSize)
			f.size = this.maxSize;
		f.y = Math.random() * this.height;
		var avgSize = this.smallestPlayer.size;
		f.size = Math.min(Math.random() * avgSize * 3 / 2 + avgSize / 2, 200);
		f.velX = Math.random() * f.size / 7 - f.size / 14;
		if (Math.abs(f.velX) < 1)
			if (f.velX > 0)
				f.velX += 1;
			else f.velX -= 1;
		if (f.velX < 0) {
			f.x = this.width + f.size;
			f.facingRight = false;
		}
		else {
			f.x = -f.size;
			f.facingRight = true;
		}
		f.speed = Math.abs(f.velX);
		this.enemies.push(f);
	}
};


game = new Game();
game.init();
game.setup();
