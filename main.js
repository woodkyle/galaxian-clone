var imageRepository = new function() {
  // Define the actual images.
  this.background = new Image();

  // Set images source.
  this.background.src = "imgs/bg.png"
}

function Drawable() {
  this.init = function(x, y){
    // Default variables.
    this.x = x;
    this.y = y;
  }
  this.speed = 0;
  this.canvasWidth = 0;
  this.canvasHeight = 0;

  // Abstract function for child objects.
  this.draw = function() {};
}

function Background() {
  // Low speed for panning.
  this.speed = 1;
  // Abstract from parent.
  this.draw = function() {
    // Used to pan background.
    this.y += this.speed;
    this.context.drawImage(imageRepository.background, this.x, this.y);
    // Draw another image on top of first.
    this.context.drawImage(imageRepository.background, this.x, this.y - this.canvasHeight);
    // If image is off screen, reset.
    if (this.y >= this.canvasHeight)
      this.y = 0;
  };
}

Background.prototype = new Drawable();

function Game() {
  // Check if canvas is supported.
  this.init = function() {
    this.bgCanvas = document.getElementById('background');
    if (this.bgCanvas.getContext) {
      this.bgContext = this.bgCanvas.getContext('2d');
      // Initialize objects.
      Background.prototype.context = this.bgContext;
      Background.prototype.canvasWidth = this.bgCanvas.width;
      Background.prototype.canvasHeight = this.bgCanvas.height;
      // Initialize background object.
      this.background = new Background();
      this.background.init(0,0);
      return true;
    } else {
      return false;
    }
  };

  // Start animation loop.
  this.start = function() {
    animate();
  };
}

// Global function to call requestAnimationFrame to draw objects.
function animate() {
  requestAnimFrame ( animate );
  game.background.draw();
}

// Finds first API that works for animation loop.
window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame   ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame    ||
			window.oRequestAnimationFrame      ||
			window.msRequestAnimationFrame     ||
			function(callback, element){
				window.setTimeout(callback, 1000 / 60);
			};
})();

// Initialize a new game.
var game = new Game();
function init() {
  if(game.init())
    game.start();
}
