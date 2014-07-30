
//
// Load Settings from Settings api (Loaded prior to this script)
//
yourcolor = GetColor('yourcolor');
ediblefishcolor = GetColor('ediblecolor');
powerupfishcolor = GetColor('powerupcolor');
enemyfishcolor = GetColor('enemycolor');
watercolornormal = colora(GetColor('watercolorn'), .5);
watercolorhurt = colora(GetColor('watercolorh'), .5);
backgroundcolor = GetColor('backcolor');
suncolor = GetColor('suncolor');
pagebackgroundcolor = GetColor('pagecolor');
panelbackgroundcolor = colora(GetColor('panelcolor'), .5);
paneltextcolor = GetColor('paneltcolor');
healthbarcolor = GetColor('healthbarcolor');
powerupbarcolor = GetColor('powerupbarcolor');
pausemessagecolor = GetColor('messagecolor');

showEyes = !GetOption('noEyes');
showOutline = !GetOption('noOutline');
blackBack = GetOption('black');


//
// Define various game variables
//

Width = 750;
Height = 566;
timer = -1;
timeprogress = 0;

time_totaled = new Date(0);
time_started = new Date(0);

sun_size = 50;
sun_rays_distance = 20;
sun_rays_length = 50;
sun_rays_count = 30;
sun_rotation = 0;

closestFish = null;

playingMusic = null;
backgroundMusic = new Audio('media/background.mp3');
backgroundMusicFade = 1;

highscore = parseInt(localStorage.getItem('highscore'));



Array.prototype.contains = function(obj) {
	var i = this.length;
	while (i--) {
		if (this[i] === obj) {
			return true;
		}
	}
	return false;
}

function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}
function HexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
function HexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
function HexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
function colora(h, a) { return 'rgba(' + HexToR(h) + ',' + HexToG(h) + ',' + HexToB(h) + ',' + a + ')'; }
if (blackBack)
	document.body.classList.add('black');

function blurHappened() {
	Pause();
	window.onblur = '';
}

window.onfocus = function () {
	window.onblur = blurHappened;
}

window.onblur = blurHappened;

function startTime() {
	if (time_started.getMilliseconds() != 0)
		stopTime();
	time_started = new Date();
}
function stopTime() {
	time_totaled = getTime();
	time_started = new Date(0);
}
function getTime() {
	if (time_started.getMilliseconds() != 0)
		return new Date(time_totaled.getTime() + new Date().getTime() - time_started.getTime());
	else
		return time_totaled;
}
function getTimeString() {
	time = getTime();
	sec = String(time.getSeconds());
	if (sec.length == 1)
		sec = "0" + sec;
	return String(time.getMinutes()) + ":" + sec;
}

FishEaten = 0;
TotalFishSize = 0;

function getFishAverage() {
	return TotalFishSize / FishEaten;
}

function getScoreFish() {
	return FishEaten * 100;
}

function getScoreAverage() {
	return getFishAverage() * 1000;
}

function getScoreTime() {
	time = getTime();
	return -100 * (time.getMinutes() * 60 + time.getSeconds());
}


function getScore() {
	var score = (getScoreFish() + getScoreAverage() + getScoreTime()) * health / 100;
	return score
}

powerupText = "";

PauseReason = "Paused";

function startGame() {
	drawingCanvas = document.getElementById('canvas');
	document.getElementById('canvas').onclick = TogglePause;
	startTime();
	TogglePause();
}

window.onload = function () {
	document.onselectstart = function () { return false; } // ie
}



//
// Global Variables
//
you = new fish(5, 'Yellow');
you.position = new vector(50, -20);
you.size = 20;
you.powerup = 0;

fishes = new Array();

waterLevel = 100.0;
targetWaterLevel = 100.0;
health = 50;
powerupRemaining = 0;
powerupMax = 10;

WinSize = 200;

function increment(passed) {
	if(backgroundMusic.volume > backgroundMusicFade) {
		backgroundMusic.volume = Math.round((backgroundMusic.volume - .01) * 100) / 100;
	} else if (backgroundMusic.volume < backgroundMusicFade) {
		backgroundMusic.volume = Math.round((backgroundMusic.volume + .01) * 100) / 100;
	}

	if (passed != true)
		alert('Started');
	if ((you.powerup == powerup.Heal || you.powerup == powerup.Super) && health < 100) {
		health = health + 1;
	}
	//Move the fish
	hit = false;
	for (index = 0; index < fishes.length; index = index + 1) {
		f = fishes[index];
		if (you.powerup != powerup.TimeStop) {
			//TODO:Intelligence
			if (f.position.y < waterLevel)
				f.momentum.y++;
			else if (f.intelligence == 0) {
				if (f.momentum.y > 0)
					f.momentum.y--;
				if (f.momentum.y < 0)
					f.momentum.y++;
				if (Math.abs(f.momentum.y) < 0)
					f.momentum.y = 0;
			}
			else {
				var x = ((distToYou(f) - f.size - you.size) < 100) && (you.powerup != powerup.Song) && (you.powerup != powerup.Invincability);
				var edible = (f.size < you.size || you.powerup == powerup.PacMan || you.powerup == powerup.Super);
				var left = (f.position.x < you.position.x && x) == edible;
				var right = (f.position.x > you.position.x && x) == edible;
				var up = (f.position.y < you.position.y && x) == edible;
				var down = (f.position.y > you.position.y && x) == edible;
				if (f.intelligence == 2 && !left && !right)
					if (f.direction == 'right')
						right = true;
					else left = true;
				moveFish(f, left, right, up, down, 1.1, f.intelligence == 2);
			}
		}

		if (!(you.powerup == powerup.TimeStop && f != you))
			f.move();
		if (you.powerup == powerup.Song || you.powerup == powerup.Super) {
			f.position.y -= 3;
		}
		if (f.position.x < -f.size || f.position.x > f.size + Width) {
			fishes.splice(index, 1);
			index--;
			continue;
		}
		if (IsCollision(f)) {
			if (f.size < you.size || you.powerup == powerup.PacMan || you.powerup == powerup.Super) {
				you.size += f.size / 15;
				FishEaten++;
				TotalFishSize += f.size;
				if (you.powerup == powerup.Super)
					powerupRemaining = powerupRemaining + 2;
				if (f.haspowerup()) {
					if (you.powerup != powerup.Super) {
						if (you.powerup != f.powerup)
							try {
								playingMusic.pause();
								playingMusic.currentTime = 0;
							}
						catch (ex) { }
						switch (f.powerup) {
							case powerup.Fast:
								powerupRemaining = powerupMax = 500;
								powerupText = "Fast";
								playingMusic = sounds.Fast;
								break;
							case powerup.PacMan:
								powerupRemaining = powerupMax = 100;
								powerupText = "Pac-Man";
								playingMusic = sounds.PacMan;
								break;
							case powerup.TimeStop:
								powerupRemaining = powerupMax = 300;
								powerupText = "Time Stop";
								playingMusic = sounds.TimeStop;
								break;
							case powerup.Spawn:
								powerupRemaining = powerupMax = 20;
								powerupText = "Spawn";
								playingMusic = sounds.Spawn;
								break;
							case powerup.Invincibility:
								powerupRemaining = powerupMax = 500;
								powerupText = "Invincibility";
								playingMusic = sounds.Invincability;
								break;
							case powerup.Song:
								powerupRemaining = powerupMax = 300;
								powerupText = "Control Song";
								playingMusic = sounds.Song;
								break;
							case powerup.Fly:
								powerupRemaining = powerupMax = 600;
								powerupText = "Fly";
								playingMusic = sounds.Fly;
								break;
							case powerup.Heal:
								powerupRemaining = powerupMax = 50;
								powerupText = "Heal";
								playingMusic = sounds.Heal;
								break;
							case powerup.Super:
								powerupRemaining = 50;
								powerupMax = 200;
								powerupText = "Super Fish";
								playingMusic = sounds.Super;
								break;
						}
						try {
							playingMusic.play();
							backgroundMusicFade = 0;
							playingMusic.addEventListener('ended', musicRepeater, false);
						}
						catch (ex) { }
						you.powerup = f.powerup;
					}
					else
						if (f.powerup == powerup.Super) {
							powerupRemaining = powerupRemaining + 50;
							powerupText = "Recharge Awsomeness";
						}
						else {
							powerupRemaining = powerupRemaining + 10;
							powerupText = "Super Fish is better";
						}
				}
				fishes.splice(index, 1);
				index = index - 1;
				if (health < 100) {
					health = health + 1;
				}
				continue;
			}
			else {
				//Die
				hit = true;
				if (you.powerup != powerup.Invincibility || you.powerup == powerup.Super)
					if (health > 0) {
						health = health - 1;
					}
					else {
						PauseReason = "Game Over";
						Pause();
						endMusic = new Audio('media/loose.mp3');
						endMusic.play()
						endMusic.addEventListener('ended', musicRepeater, false);
						return;
					}
			}
		}
	}
	//Player
	if (you.position.y <= waterLevel && (you.powerup != powerup.Fly && you.powerup != powerup.Super))
		you.momentum.y = you.momentum.y + 1;
	else {
		moveFish(you, keyLeft, keyRight, keyUp, keyDown, (you.powerup == powerup.Fast || you.powerup == powerup.Super) ? 3.0 : 1.5);
	}
	if (you.position.x < 0 && you.momentum.x < 0) {
		you.position.x = 0;
		you.momentum.x = -1;
	}
	if (you.position.x > Width && you.momentum.x > 0) {
		you.position.x = Width;
		you.momentum.x = -1;
	}
	you.move();

	//Paint
	ctx = drawingCanvas.getContext('2d');
	ctx.clearRect(0, 0, Width, Height);

	//Draw Sun
	ctx.fillStyle = 'Yellow';
	ctx.strokeStyle = 'Yellow';
	ctx.beginPath();
	ctx.arc(0, 0, sun_size, 0, Math.PI * 2, true);
	ctx.closePath();
	ctx.fill();

	for (var theta = 0; theta < Math.PI * 2; theta = theta + Math.PI * 2 / sun_rays_count) {
		ctx.moveTo(Math.cos(theta + sun_rotation) * (sun_size + sun_rays_distance), Math.sin(theta + sun_rotation) * (sun_size + sun_rays_distance));
		ctx.lineTo(Math.cos(theta + sun_rotation) * (sun_size + sun_rays_distance + sun_rays_length), Math.sin(theta + sun_rotation) * (sun_size + sun_rays_distance + sun_rays_length));
	}

	ctx.stroke();

	if (waterLevel > targetWaterLevel)
		sun_rotation = sun_rotation + .01;
	else if (waterLevel < targetWaterLevel)
		sun_rotation = sun_rotation + .04;
	else
		sun_rotation = sun_rotation + .02;

	//Draw Fish
	for (i = 0; i < fishes.length; i = i + 1) {
		var f = fishes[i];
		f.draw(ctx, f.size <= you.size);
	}
	you.draw(ctx, false);

	//Draw Water
	if (hit && you.powerup != powerup.Invincibility)
		if (you.powerup == powerup.TimeStop)
			ctx.fillStyle = 'rgba(255, 100, 100, .5)';
		else
			ctx.fillStyle = 'rgba(255, 0, 0, .5)';
	else
		if (you.powerup == powerup.TimeStop)
			ctx.fillStyle = 'rgba(100, 100, 255, .5)';
		else
			ctx.fillStyle = 'rgba(0, 0, 255, .5)';
	ctx.fillRect(0, waterLevel, Width, Height);

	//Draw status Info
	//controls background
	ctx.fillStyle = 'rgba(100, 100, 100, .3)';
	ctx.fillRect(Width - 200, 0, 200, 67);
	ctx.fillStyle = 'rgba(200, 200, 200, .3)';
	ctx.fillRect(Width - 195, 5, 190, 18);
	ctx.fillRect(Width - 195, 27, 190, 7);
	//bars
	ctx.fillStyle = 'rgba(0, 0, 255, 1)';
	ctx.fillRect(Width - 195, 5, 190 * health / 100, 18);
	ctx.fillStyle = 'rgba(255, 0, 0, 1)';
	ctx.fillRect(Width - 195, 27, 190 * powerupRemaining / powerupMax, 7);
	//text
	ctx.fillStyle = 'rgba(0, 0, 0, 1)'
	ctx.font = '8pt Arial';
	ctx.fillText(String(powerupRemaining), Width - 100, 34);
	ctx.font = '12pt Arial';
	ctx.fillText(String(health) + "%", Width - 100, 20);
	ctx.font = '10pt Arial';
	ctx.fillText("Power-Up: " + powerupText, Width - 194, 47);
	ctx.fillText("Time: " + getTimeString(), Width - 194, 62);
	ctx.fillText("Score: " + String(Math.round(getScore())), Width - 120, 62);
	//Draw mouse controls
	ctx.fillStyle = 'rgba(0, 0, 0, .2)';
	mouseControlVisualRectWidth = 200;
	if (mouse) {
		if (keyUp)
			ctx.fillRect(Width / 2 - mouseControlVisualRectWidth / 2, 0, mouseControlVisualRectWidth, mouseControlVisualRectWidth);
		if (keyDown)
			ctx.fillRect(Width / 2 - mouseControlVisualRectWidth / 2, Height - mouseControlVisualRectWidth, mouseControlVisualRectWidth, mouseControlVisualRectWidth);
		if (keyLeft)
			ctx.fillRect(0, Height / 2 - mouseControlVisualRectWidth / 2, mouseControlVisualRectWidth, mouseControlVisualRectWidth);
		if (keyRight)
			ctx.fillRect(Width - mouseControlVisualRectWidth, Height / 2 - mouseControlVisualRectWidth / 2, mouseControlVisualRectWidth, mouseControlVisualRectWidth);
	}
	//Win
	if (you.size > WinSize) {
		//You win
		PauseReason = "You Win";
		var score = getScore();
		if (String(highscore) == 'NaN' || highscore < score)
		{
			highscore = score;
			document.getElementById('highscore').innerHTML = Math.floor(score);
			localStorage.setItem('highscore', score);
			SubmitHighScore();
		}
		Pause();
		endMusic = new Audio('media/win.mp3');
		endMusic.play()
		endMusic.addEventListener('ended', musicRepeater, false);
		return;
	}
	//Add More fish
	if (you.powerup == powerup.Spawn) {
		x = Math.random() * Width;
		f = new fish();
		f.position = new vector(x, 0);
		while (f.momentum.x == 0)
			f.momentum = new vector(Math.random() * 6 - 3, Math.random() * 3);
		if (f.momentum.x > 0)
			f.direction = 'right';
		else
			f.direction = 'left';
		f.powerup = powerup.None;
		f.size = 15;
		fishes.push(f);
	}
	if (fishes.length < 500 / you.size)
		newFish();
	//Power-Up Time Limit
	if (powerupRemaining > powerupMax)
		powerupRemaining = powerupMax;
	if (powerupRemaining > 0) {
		powerupRemaining = powerupRemaining - 1;
		if (powerupRemaining == 0 || keyCancelPowerup) {
			you.powerup = powerup.None;
			powerupRemaining = 0;
			try {
				playingMusic.pause();
				playingMusic.currentTime = 0;
				playingMusic = null;
			}
			catch (ex) { }
			backgroundMusicFade = 1;
		}
	}
	if (you.powerup != powerup.TimeStop) {
		if (waterLevel > targetWaterLevel)
			waterLevel--;
		if (waterLevel < targetWaterLevel)
			waterLevel++;
		if (Math.floor(Math.random() * 400) == 0) {
			targetWaterLevel = Math.random() * 250 + 50;
		}
	}
	timeprogress = timeprogress + 1;
}
//
// Classes
//
function vector(x, y) {
	this.x = x;
	this.y = y;
};
function fish(s, c) {
	this.size = s;
	this.color = c;
	dws
	this.position = new vector(0, 0);
	this.momentum = new vector(0, 0);
	this.direction = 'right';
	this.timeOffset = 5 * Math.random();
	this.intelligence = 0;
	fish.prototype.move = function () {
		if (this.position == null)
			return;
		if (this.intelligence > 1 && distToYou(this) < 1000)
		{
			if (you.position.x > this.position.x)
				this.momentum.x = this.momentum.x + .2;
			if (you.position.x < this.position.x)
				this.momentum.x = this.momentum.x - .2;
		}
		this.position = new vector(this.position.x + this.momentum.x, this.position.y + this.momentum.y);
	}
	fish.prototype.draw = function (ctx, edible) {
		if (ctx == null)
			return;
		if (this.color == null)
			/*if (closestFish == this)
				ctx.fillStyle = 'orange';
			else */if (!edible && you.powerup != powerup.PacMan && you.powerup != powerup.Super)
				ctx.fillStyle = 'red';
			else
				if (this.haspowerup())
					ctx.fillStyle = 'purple';
				else
					ctx.fillStyle = 'green';
		else
			if (this.powerup == powerup.Invincibility || this.powerup == powerup.Super)
				ctx.fillStyle = random_color('rgb');
			else ctx.fillStyle = this.color;
		ctx.beginPath();
		if (this == you && (this.powerup == powerup.PacMan || this.powerup == powerup.Super))
		//Omn OMno OMno Pac-Mouth
			if (this.direction == 'left') {
				ctx.arc(this.position.x, this.position.y, this.size / 2, Math.PI - Math.abs(Math.sin(((timeprogress + this.timeOffset) / 5)) / 2), -Math.PI + Math.abs(Math.sin((timeprogress + this.timeOffset) / 5) / 2), true);
				ctx.lineTo(this.position.x, this.position.y);
				ctx.moveTo(this.position.x + this.size / 2, this.position.y);
				this.drawTail(ctx);
			}
			else {
				ctx.arc(this.position.x, this.position.y, this.size / 2, Math.abs(Math.sin(((timeprogress + this.timeOffset) / 5)) / 2), Math.PI * 2 - Math.abs(Math.sin((timeprogress + this.timeOffset) / 5) / 2), false);
				ctx.lineTo(this.position.x, this.position.y);
				ctx.moveTo(this.position.x - this.size / 2, this.position.y);
				this.drawTail(ctx);
			}
		else
			if (this.direction == 'left') {
				ctx.arc(this.position.x, this.position.y, this.size / 2, 0, Math.PI * 2, true);
				this.drawTail(ctx);
			}
			else {
				ctx.arc(this.position.x, this.position.y, this.size / 2, Math.PI, -Math.PI, true);
				this.drawTail(ctx);
			}
		ctx.closePath();
		ctx.fill();
		ctx.strokeStyle = 'black';
		if (showOutline)
			ctx.stroke();
		if (showEyes)
			this.drawEye(ctx);
	};
	fish.prototype.haspowerup = function () {
		return this.powerup > 0 && this.powerup < 10
	};
	fish.prototype.drawTail = function (ctx) {
		if (this.direction == 'left') {
			if (this == you && (this.powerup == powerup.Fast || this.powerup == powerup.Super)) {
				ctx.lineTo(this.position.x + this.size * 1.2, this.position.y - this.size / 3);
				ctx.lineTo(this.position.x + this.size * 1.2, this.position.y + this.size / 3);
			}
			else {
				ctx.lineTo(this.position.x + this.size, this.position.y - this.size / 2);
				ctx.lineTo(this.position.x + this.size, this.position.y + this.size / 2);
			}
		}
		else {
			if (this == you && (this.powerup == powerup.Fast || this.powerup == powerup.Super)) {
				ctx.lineTo(this.position.x - this.size * 1.2, this.position.y - this.size / 3);
				ctx.lineTo(this.position.x - this.size * 1.2, this.position.y + this.size / 3);
			}
			else {
				ctx.lineTo(this.position.x - this.size, this.position.y - this.size / 2);
				ctx.lineTo(this.position.x - this.size, this.position.y + this.size / 2);
			}
		}
	};
	fish.prototype.lookingat = function () {
		if (this == you) {
			if (!fishes.contains(closestFish))
				closestFish = null;
			for (index = 0; index < fishes.length; index = index + 1) {
				f = fishes[index];
				if (closestFish == null || distToYou(closestFish) > distToYou(f))
					closestFish = f;
			}
			if (closestFish != null)
				return Math.atan2(you.position.y - closestFish.position.y, you.position.x - closestFish.position.x);
			else return 0;
		}
		if (this.intelligence > 0) {
			return Math.atan2(this.position.y - you.position.y, this.position.x - you.position.x);
		}
		else if (this.direction == 'left')
			return 0;
		else
			return Math.PI;
	};
	fish.prototype.drawEye = function (ctx) {
		var angle = this.lookingat();
		ctx.fillStyle == 'black';
		var x;
		if (this.direction == 'left')
			x = this.position.x - this.size / 4;
		else
			x = this.position.x + this.size / 4;
		var y = this.position.y - this.size / 4;
		ctx.beginPath();
		ctx.fillStyle = 'white';
		ctx.arc(x, y, this.size / 10, 0, Math.PI * 2, true);
		ctx.closePath();
		ctx.fill();
		ctx.beginPath();
		ctx.fillStyle = 'black';
		ctx.arc(x - (Math.cos(angle) * this.size / 20), y - (Math.sin(angle) * this.size / 20), this.size / 20, 0, Math.PI * 2, true);
		ctx.closePath();
		ctx.fill();
	};
};

function moveFish(you, keyLeft, keyRight, keyUp, keyDown, moveAmount, allowHorizontal) {
	if (allowHorizontal == undefined)
		allowHorizontal = true;
	x = y = 0;
	if (allowHorizontal) {
		if (you.momentum.x > 0)
			you.momentum.x = you.momentum.x - 1;
		if (you.momentum.x < 0)
			you.momentum.x = you.momentum.x + 1;
	}
	if (you.momentum.y > 0)
		you.momentum.y = you.momentum.y - 1;
	if (you.momentum.y < 0)
		you.momentum.y = you.momentum.y + 1
	if (allowHorizontal) {
		if (keyLeft) x = x - moveAmount;
		if (keyRight) x = x + moveAmount;
	}
	if (keyUp) y = y - moveAmount;
	if (keyDown) y = y + moveAmount;
	if (allowHorizontal) {
		if (keyLeft && !keyRight) you.direction = 'left';
		if (!keyLeft && keyRight) you.direction = 'right';
	}
	you.momentum = new vector(you.momentum.x + x, you.momentum.y + y);
	if (allowHorizontal && Math.abs(you.momentum.x) <= 1)
		you.momentum.x = 0;
	if (Math.abs(you.momentum.y) <= 1)
		you.momentum.y = 0;
	if (you.position.y < 0 && you.momentum.y < 0) {
		you.position.y = 0;
		you.momentum.y = -1;
	}
	if (you.position.y > Height && you.momentum.y > 0) {
		you.position.y = Height;
		you.momentum.y = -1;
	}
}

function distToYou(f) {
	return Math.sqrt(Math.pow(f.position.x - you.position.x, 2) + Math.pow(f.position.y - you.position.y, 2));
}

//
// Methods
//
function IsCollision(f) {
	dist = distToYou(f);
	return dist * 2 < f.size + you.size;
}

// @format (hex|rgb|null) : Format to return, default is integer
function random_color(format) {
	var rint = Math.round(0xffffff * Math.random());
	switch (format) {
		case 'hex':
			return ('#0' + Math.round(0xffffff * Math.random()).toString(16)).replace(/^#0([0-9a-f]{6})$/i, '#$1');
			break;

		case 'rgb':
			return 'rgb(' + (rint >> 16) + ',' + (rint >> 8 & 255) + ',' + (rint & 255) + ')';
			break;

		default:
			return rint;
			break;
	}
}

function musicRepeater() {
	this.currentTime = 0;
	this.play();
}
backgroundMusic.addEventListener('ended', musicRepeater, false);

function newFish() {
	var f = new fish();
	fishes.push(f);
	f.position.y = Math.random() * Height;
	f.size = Math.random() * you.size * 3 / 2 + you.size / 2;
	if (Math.floor(Math.random() * 100) <= 10 )
		{ f.intelligence = 1; }
	if (Math.floor(Math.random() * 100) == 1 )
		{ f.intelligence = 1; } //TOOD: Change 1 into 2 to enable expiremental level 2 intelegence
	if (f.size > 200)
		f.size = 200;
	f.momentum.x = Math.random() * f.size / 7 - f.size / 14;
	if (Math.abs(f.momentum.x) < 1)
		if (f.momentum.x > 0)
			f.momentum.x += 1;
		else f.momentum.x -= 1;
	if (f.momentum.x < 0) {
		f.position.x = Width + f.size;
		f.direction = 'left';
	}
	else {
		f.position.x = -f.size;
		f.direction = 'right';
	}
}

keyUp = keyDown = keyLeft = keyRight = keyCancelPowerup = false;

function page_keydown(e) {
	if (e.keyCode == Keys.Up || e.keyCode == Keys.W) {
		keyUp = true;
		return false;
	}
	if (e.keyCode == Keys.Down || e.keyCode == Keys.S) {
		keyDown = true;
		return false;
	}
	if (e.keyCode == Keys.Left || e.keyCode == Keys.A) {
		keyLeft = true;
		return false;
	}
	if (e.keyCode == Keys.Right || e.keyCode == Keys.D) {
		keyRight = true;
		return false;
	}
	if (e.keyCode == Keys.Cancel) {
		keyCancelPowerup = true;
		return false;
	}
	if (e.keyCode == Keys.Escape) {
		PauseToggle();
		return false;
	}
	if (e.keyCode == Keys.Restart) {
		RestartGame();
		return false;
	}
}
function page_keyup(e) {
	if (e.keyCode == Keys.Up || e.keyCode == Keys.W)
		keyUp = false;
	if (e.keyCode == Keys.Down || e.keyCode == Keys.S)
		keyDown = false;
	if (e.keyCode == Keys.Left || e.keyCode == Keys.A)
		keyLeft = false;
	if (e.keyCode == Keys.Right || e.keyCode == Keys.D)
		keyRight = false;
	if (e.keyCode == Keys.Cancel)
		keyCancelPowerup = false;
	if (e.keyCode == Keys.Escape)
		PauseToggle();
}

function RestartGame() {
	if (endMusic) {
		endMusic.pause();
		endMusic = null;
	}

	stopTime();
	PauseReason = "Paused";

	if (timer != -1)
		clearInterval(timer);

	sun_rotation = 0;
	timer = -1;
	timeprogress = 0;

	time_totaled = new Date(0);
	time_started = new Date(0);
	FishEaten = 0;
	TotalFishSize = 0;

	you = new fish(5, 'Yellow');
	you.position = new vector(50, -20);
	you.size = 20;
	you.powerup = 0;

	fishes = new Array();

	waterLevel = 100.0;
	targetWaterLevel = 100.0;
	health = 50;
	powerupRemaining = 0;
	powerupMax = 10;

	try {
		playingMusic.pause();
		playingMusic.currentTime = 0;
	}
	catch (ex) { }
	playingMusic = null;
	try {
		backgroundMusic.currentTime = 0;
		backgroundMusic.play();
	}
	catch (ex) { }

	powerupText = "";

	startTime();
	TogglePause();
}

mouse = false;

function page_mousedown(e) {
	if (DetectMobile())
		mouse = true;
	else; //TogglePause();
}
function page_mouseup(e) {
	if (DetectMobile())
		mouse = false;
}

function IsUpKey(code) {
	switch (code) {
		case Keys.Up:
		case Keys.W:
			return true;
		default:
			return false;
	}
}

function Pause() {
	clearInterval(timer);
	timer = -1;
	ctx = drawingCanvas.getContext('2d');
	 
	try { playingMusic.pause(); }
	catch (ex) { }
	try { backgroundMusic.pause(); }
	catch (ex) { }
	stopTime();
}
function TogglePause() {
	if (timer == -1) {
		if (PauseReason == 'Paused') {
			Paused = false;
			timer = setInterval(function() { increment(true); }, 33);
			startTime();
			try { playingMusic.play(); }
			catch (ex) { }
			backgroundMusic.play();
		}
		else {
			RestartGame();
		}
	}
	else Pause();
	return false;
}

//
//Enums
//
//powerup
powerup = { "None": 0,
	"Fast": 1,
	"PacMan": 2,
	"TimeStop": 3,
	"Spawn": 4,
	"Invincibility": 5,
	"Song": 6,
	"Super": 7,
	"Heal": 8,
	"Fly": 9
};
//Keys
Keys = { "Up": 38,
	"Down": 40,
	"Left": 37,
	"Right": 39,
	"W": 87,
	"A": 65,
	"S": 83,
	"D": 68,
	"Cancel": 84,
	"Restart": 82,
	"Escape": 27
};

//
// Sound Effects
//
sounds = { "Fast": new Audio("media/fast.mp3"),
	"PacMan": new Audio("media/pacman.mp3"),
	"TimeStop": new Audio("media/timestop.mp3"),
	"Spawn": new Audio("media/spawn.mp3"),
	"Invincibility": new Audio("media/invincible.mp3"),
	"Song": new Audio("media/song.mp3"),
	"Super": new Audio("media/super.mp3"),
	"Heal": new Audio("media/heal.mp3"),
	"Fly": new Audio("media/fly.mp3")
};

document.onkeydown = page_keydown;
document.onkeyup = page_keyup;