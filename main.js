
// Initialize a new game.
var game = new Game();
function init() {
  if(game.init())
    game.start();
}

// Repository of images for background, ships, and bullet.
var imageRepository = new function() {
  // Define the actual images.
  this.background = new Image();
  this.spaceship = new Image();
  this.bullet = new Image();
  // Load all images before game start.
  var numImages = 3;
  var numLoaded = 0;
  function imageLoaded() {
    numLoaded++;
    if (numLoaded === numImages) {
      window.init();
    }
  }
  this.background.onload = function() {
    imageLoaded();
  }
  this.spaceship.onload = function() {
    imageLoaded();
  }
  this.bullet.onload = function() {
    imageLoaded();
  }
  // Set images source.
  this.background.src = "imgs/bg.png";
  this.spaceship.src = "imgs/ship.png";
  this.bullet.src = "imgs/bullet.png";
}

function Drawable() {
  this.init = function(x, y, width, height){
    // Default variables.
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
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

// Bullet objects fired from ships. Drawn on "main" canvas.
function Bullet() {
  this.alive = false;
  // Default bullet values.
  this.spawn = function(x, y, speed){
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.alive = true;
  };
  // Function to move or erase bullet.
  this.draw = function() {
    this.context.clearRect(this.x, this.y, this.width, this.height);
    this.y -= this.speed;
    if (this.y <= 0 - this.height) {
      return true;
    } else {
      this.context.drawImage(imageRepository.bullet, this.x, this.y);
    }
  };
  // Resets bullet values.
  this.clear = function() {
    this.x = 0;
    this.y = 0;
    this.speed = 0;
    this.alive = false;
  };
}
Bullet.prototype = new Drawable;

// Custom Pool object to hold bullets and prevent garbage collection.
function Pool(maxSize) {
  var size = maxSize;
  var pool = [];
  // Populate pool array with bullet objects.
  this.init = function() {
    for (var i = 0; i < size; i++){
      var bullet = new Bullet();
      bullet.init(0,0, imageRepository.bullet.width, imageRepository.bullet.height);
      pool[i] = bullet;
    }
  };
  // Grabs last bullet and initializes it to front of array.
  this.get = function(x, y, speed) {
    if(!pool[size -1].alive) {
      pool[size - 1].spawn(x, y, speed);
      pool.unshift(pool.pop());
    }
  };
  // Ship gets two bullet at once.
  this.getTwo = function(x1, y1, speed1, x2, y2, speed2) {
    if(!pool[size - 1].alive && !pool[size - 2].alive) {
      this.get(x1, y1, speed1);
      this.get(x2, y2, speed2);
     }
   };
  // Draws bullets that are in use.
  // Bullets that go off screen are cleared and pushed to front of array.
  this.animate = function() {
    for (var i = 0; i < size; i++) {
      if (pool[i].alive) {
        if (pool[i].draw()) {
          pool[i].clear();
          pool.push((pool.splice(i,1))[0]);

        }
      }
      else
        break;
    }
  };
}

function Ship() {
  this.speed = 3;
  this.bulletPool = new Pool(30);
  this.bulletPool.init();
  var fireRate = 15;
  var counter = 0;
  this.draw = function() {
    this.context.drawImage(imageRepository.spaceship, this.x, this.y);
  };
  this.move = function() {
    counter++;
    // Determine if this is move action.
    if (KEY_STATUS.left || KEY_STATUS.right ||
      KEY_STATUS.up || KEY_STATUS.down){
        // Ship is moving, erase and redraw at new location.
        this.context.clearRect(this.x, this.y, this.width, this.height);
        // Update x/y according to move direction. Redraw ship.
        if (KEY_STATUS.left){
          this.x -= this.speed;
          if (this.x <= 0)
            this.x = 0;
        } else if (KEY_STATUS.right) {
          this.x += this.speed;
          if (this.x >= this.canvasWidth - this.width)
            this.x = this.canvasWidth - this.width;
        } else if (KEY_STATUS.up) {
          this.y -= this.speed;
          if (this.y <= this.canvasHeight/4*3)
            this.y = this.canvasHeight/4*3;
        } else if (KEY_STATUS.down) {
          this.y += this.speed;
          if (this.y >= this.canvasHeight - this.height)
            this.y = this.canvasHeight - this.height;
        }
        // Finish by drawing ship again.
        this.draw();
    }
    if (KEY_STATUS.space && counter >= fireRate) {
      this.fire();
      counter = 0;
    }
  };
  // Fire two bullets.
  this.fire = function() {
    this.bulletPool.getTwo(this.x+6, this.y, 3, this.x+33, this.y, 3);
  };
}
Ship.prototype = new Drawable();

function Game() {
  // Check if canvas is supported.
  this.init = function() {
    this.bgCanvas = document.getElementById('background');
    this.shipCanvas = document.getElementById('ship');
    this.mainCanvas = document.getElementById('main');

    if (this.bgCanvas.getContext) {
      this.bgContext = this.bgCanvas.getContext('2d');
      this.shipContext = this.shipCanvas.getContext('2d');
      this.mainContext = this.mainCanvas.getContext('2d');
      // Initialize objects.
      Background.prototype.context = this.bgContext;
      Background.prototype.canvasWidth = this.bgCanvas.width;
      Background.prototype.canvasHeight = this.bgCanvas.height;
      Ship.prototype.context = this.shipContext;
      Ship.prototype.canvasWidth = this.shipCanvas.width;
      Ship.prototype.canvasHeight = this.shipCanvas.height;
      Bullet.prototype.context = this.mainContext;
      Bullet.prototype.canvasWidth = this.mainCanvas.width;
      Bullet.prototype.canvasWidth = this.mainCanvas.height;
      // Initialize background object.
      this.background = new Background();
      this.background.init(0,0);
      // Initialize the ship.
      this.ship = new Ship();
      // Set the ship to start near the bottom middle of the canvas
			var shipStartX = this.shipCanvas.width/2 - imageRepository.spaceship.width;
			var shipStartY = this.shipCanvas.height/4*3 + imageRepository.spaceship.height*2;
			this.ship.init(shipStartX, shipStartY, imageRepository.spaceship.width,
			               imageRepository.spaceship.height);
      return true;
    } else {
      return false;
    }
  };

  // Start animation loop.
  this.start = function() {
    this.ship.draw();
    animate();
  };
}

// Global function to call requestAnimationFrame to draw objects.
function animate() {
  requestAnimFrame ( animate );
  game.background.draw();
  game.ship.move();
  game.ship.bulletPool.animate();
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

// Keycodes mapped when a player presses a button.
KEY_CODES = {
  32: 'space',
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
}

// Creates array for KEY_CODES and sets default false;
KEY_STATUS = {};
for (code in KEY_CODES){
  KEY_STATUS [ KEY_CODES[ code ]] = false;
}

// Document listens for onkeydown and sets key to true;
document.onkeydown = function(e) {
  var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
  if (KEY_CODES[keyCode]) {
    e.preventDefault();
    KEY_STATUS[KEY_CODES[keyCode]] = true;
  }
}

//Document listens for onkeyup and sets key to false;
document.onkeyup = function(e) {
  var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
  if (KEY_CODES[keyCode]) {
    e.preventDefault();
    KEY_STATUS[KEY_CODES[keyCode]] = false;
  }
}
