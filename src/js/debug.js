Debug = function() {
    this.info = {}
    this.color = "black";
    this.side = -1;
    this.width = 200;
    this.buffer = 5;
    this.color = new Color();
    this.backgroundColor = new Color(100,100,100,.3);
    this.barBackground = new Color(200,200,200,.3);
}
Debug.prototype = new Status();
Debug.prototype.increment = function() {
    this.data = [
        {
            title: "Location",
            text: f.x + ", " + f.y
        },
        {
            title: "Velocity",
            text: f.velX + ", " + f.velY
        },
        {
            title: "Controller",
            text: f._controller
        }
    ]
}
    
debug = new Debug();
game.drawablesTop.push(debug);