Status = function(fish) {
    this.fish = fish;
    this.side = 1;//-1 = top left, 1 = top right, 0 = top center
    this.width = 200;
    this.buffer = 5;
    
    this.data = [];
    
    this.color = new Color();
    this.backgroundColor = new Color(100,100,100,.3);
    this.barBackground = new Color(200,200,200,.3);
}
Status.prototype = {
    draw: function(ctx) {
        var scale = Math.max(game.scale, 1);
        var b = this.buffer * scale;
        var width = this.width * scale;
        var height = b * 2;
        var d, i;
        for (i = 0; i < this.data.length; ++i) {
            d = this.data[i];
            if ("height" in d)
                height += d.height * scale + b;
            else height += (d.height = 12) * scale + b;
        }
        var y = 0, x = game.width * game.scale - width;
        
        if (this.side == -1)
            x = b;
        if (this.size == 0)
            x = (game.width * scale) / 2 - width / 2
        
        // TODO: Draw the panel. Only scale if scaling down.
        ctx.fillStyle = this.backgroundColor.toString();
        ctx.fillRect(x, y, width, height);
        x += b; y += b; width -= b * 2;
        
        for (i = 0; i < this.data.length; ++i) {
            d = this.data[i];
            ctx.font = d.height * scale + 'px Arial';
            if ("text" in d) {
                ctx.fillStyle = this.color.toString();
                ctx.fillText(d.title + ": " + d.text, x, y + d.height * scale);
            } else {
                ctx.fillStyle = this.barBackground.toString();
                ctx.fillRect(x, y, width - b, d.height * scale);
                ctx.fillStyle = d.color.toString();
                ctx.fillRect(x, y, (width - b) * (d.value / d.max), d.height * scale);
                var percent = Math.round(100 * d.value / d.max) + "%";
                var v = ctx.measureText(percent);
                ctx.fillStyle = this.color.toString();
                ctx.fillText(percent, x + width / 2 - v.width / 2, y + d.height * scale - scale * 2);
            }
            y += d.height * scale + b;
        }
 
        return;
        
        ctx.fillStyle = this.barBackground.toString();
        ctx.fillRect(x, y, width, this.healthBarHeight);
        y += b + this.healthBarHeight;
        ctx.fillRect(x, y, width, this.powerupRemainingHeight);
        
        //This is directly copied from the old program
        //Draw status Info
        //controls background
        ctx.fillStyle = 'rgba(100, 100, 100, .3)';
        ctx.fillRect(game.width - 200, 0, 200, 67);
        ctx.fillStyle = 'rgba(200, 200, 200, .3)';
        ctx.fillRect(game.width - 195, 5, 190, 18);
        ctx.fillRect(game.width - 195, 27, 190, 7);
        //bars
        ctx.fillStyle = 'rgba(0, 0, 255, 1)';
        ctx.fillRect(game.width - 195, 5, 190 * this.fish.health / 100, 18);
        ctx.fillStyle = 'rgba(255, 0, 0, 1)';
        if (this.fish.powerup)
            ctx.fillRect(game.width - 195, 27, 190 * this.fish.powerupRemaining / this.fish.powerup.timeLimit, 7);
        //text
        ctx.fillStyle = 'rgba(0, 0, 0, 1)'
        ctx.font = '8pt Arial';
        ctx.fillText(String(this.fish.powerupRemaining), game.width - 100, 34);
        ctx.font = '12pt Arial';
        ctx.fillText(String(this.fish.health) + "%", game.width - 100, 20);
        ctx.font = '10pt Arial';
        if (this.fish.powerup)
        ctx.fillText("Power-Up: " + this.fish.powerup.displayText, game.width - 194, 47);
        //ctx.fillText("Time: " + getTimeString(), Width - 194, 62);
        //ctx.fillText("Score: " + String(Math.round(getScore())), Width - 120, 62);
        //Draw mouse controls
        ctx.fillStyle = 'rgba(0, 0, 0, .2)';
    },
    increment: function() {
        this.data = [];
        if (game.players.length > 1) {
            this.data.push({
                title: "Player",
                text: game.players.indexOf(this.fish) + 1
            });
        }
        
        this.data.push({
            color: new Color(0,0,255),
            max: game.maxHealth,
            value: this.fish.health,
            height: 18
        });
      
        if (this.fish.powerup) {
            this.data.push({
                color: new Color(255),
                max: this.fish.powerup.timeLimit,
                value: this.fish.powerupRemaining,
                height: 7
            });
            this.data.push({
                title: "Power-Up",
                text: this.fish.powerup.displayText
            });
        }
        
        this.data.push({
            title: "Score",
            text: Math.floor(this.fish.getScore().total)
        });
    }
}