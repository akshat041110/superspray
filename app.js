setScreen("welcomeScreen");

var enemies = [];
var shooterX = 20;
var shooterY = 185;
var shooterHeight = 40;
var shooterFillColor = "white";

var bulletColor = "CYAN";
var maxShots = 100;
var remainingShots = maxShots;
var shooterHitPenalty = 20;
var fired = false;
var maxEnemies = 2;
var bulletStartX = shooterX + 20;
var bulletStartY = shooterY + 5/2;
var bulletEndX = bulletStartX;
var bulletEndY = bulletStartY;
var bulletEndUpY = bulletStartY;
var allBulletPositions = [];
var score = 0;
var numHitsToShooter = 0;
var gameStarted = false;
var startTime;
var enemySize = 30;

var muted = false;

onEvent("button_play", "click", function( ) {
  if (!gameStarted) {
    setScreen("playground");
    clearCanvas();
    createCanvas("gameCanvas");
    setActiveCanvas("gameCanvas");
    startGame();
  }
});

var shooterVerticalSpeed = 10;

onEvent("playground", "keydown", function(event) {
  if (event.key == "Down") {
    moveShooterDown();
  } 
  if (event.key == "Up") {
    moveShooterUp();
  }
  if (event.key == "f" || event.key == "F") {
    fire();
  }
});

onEvent("btnFire", "click", fire);
onEvent("btnUp", "click", moveShooterUp);
onEvent("btnDown", "click", moveShooterDown);


onEvent("btnFire", "touchstart", fire);
onEvent("btnUp", "touchstart", moveShooterUp);
onEvent("btnDown", "touchstart", moveShooterDown);

function moveShooterUp() {
  // event.preventDefault();
  if (shooterY - shooterVerticalSpeed <= 0) {
      shooterY += 450;
    } else {
      shooterY = shooterY - shooterVerticalSpeed;
    }
    if (bulletEndY - shooterVerticalSpeed <= 0) {
      bulletEndY += 450;
    } else {
      bulletEndY = bulletEndY - shooterVerticalSpeed;
    }
    if (bulletEndUpY - shooterVerticalSpeed <= 0) {
      bulletEndUpY += 450;
    } else {
      bulletEndUpY = bulletEndUpY - shooterVerticalSpeed;
    }
}

function moveShooterDown() {
  // event.preventDefault();
  shooterY = (shooterY + shooterVerticalSpeed)%450;
  bulletEndY = (bulletEndY + shooterVerticalSpeed)%450;
  bulletEndUpY = (bulletEndUpY + shooterVerticalSpeed)%450;
}

function fire() {
  // event.preventDefault();
  reduceRemainingShots(1);
  setRemainingShots();
  if (remainingShots >= 0) {
    fired = true;
  }
}

function reduceRemainingShots(amount) {
  remainingShots = remainingShots - amount;
  if (remainingShots < 0) {
    remainingShots = 0;
  }
}

function startGame () {
  initGame();
  timedLoop(50, function() {
    clearCanvas();
    createShooter(shooterX, shooterY);
    if (bulletEndX > 200) {
      fired = false;
      bulletEndX = bulletStartX;
      bulletEndY = bulletStartY;
      bulletEndUpY = bulletStartY;
    }
    redrawEnemies();
    for (var i = enemies.length; i < maxEnemies; i++) {
      createRandomEnemy();
    }
    if (fired) {
      killEnemies();
    }
    checkShooterHit();
    if (remainingShots <= 0) {
      stopTimedLoop();
      setScreen("gameOver");
      muted = true;
      toggleSound();
      showStats();
    }
    updateTime();
  });
  gameStarted = true;
}
var timeS = 0;
var prevTimeS = 0;

function showStats() {
  var gameOverX = getXPosition("lblGameOver");
  var gameOverY = getYPosition("lblGameOver");
  
  textLabel("yourScore", "You Scored: " + score);
  setPosition("yourScore", gameOverX, gameOverY + 30);
  textLabel("totalTimeTaken", "Time Taken: " + timeS + " seconds");
  setPosition("totalTimeTaken", gameOverX, gameOverY + 60);
}

function updateTime() {
  var currentTime = getTime();
  var timeMs = currentTime - startTime;
  prevTimeS = timeS;
  timeS = Math.round(timeMs/1000);
  
  setText("timeTaken", "Time: " + timeS + " s");
  if (timeS > 0 && timeS % 10 == 0 && timeS != prevTimeS) {
    maxEnemies = maxEnemies + 2;
  }
}

function setRemainingShots() {
  setText("shotsRemaining", remainingShots + " / " + maxShots);
  var color = getSanitizerColor();
  setProperty("shotsRemaining", "background-color", color);
}

function initGame() {
  setRemainingShots();
  startTime = getTime();
  toggleSound();
}

function checkShooterHit() {
  var newEnemies = [];
  for (var i = 0; i < enemies.length; i++) {
    var enemy = enemies[i];
    if (enemy.x - enemy.size <= shooterX + 20 
      && enemy.y + enemy.size > shooterY 
      && enemy.y - enemy.size < shooterY + shooterHeight + 15) {
      numHitsToShooter++;
      reduceRemainingShots(shooterHitPenalty);
      setRemainingShots();
    } else {
      newEnemies.push(enemy);
    }
  }
  enemies = newEnemies;
}

function showScore() {
  setText("score", "Score: " + score);
}

function killEnemies() {
  for (var j = 0; j < allBulletPositions.length; j++) {
    var bulletPosition = allBulletPositions[j];
    for (var i = 0; i < enemies.length; i++){
      var enemy = enemies[i];

      if (bulletPosition.x > enemy.x - enemy.size 
        && bulletPosition.y > enemy.y - enemy.size 
        && bulletPosition.y < enemy.y + enemy.size) {
        console.log("Killing enemy " + enemy.x + enemy.y + enemy.size);
        score++;
        showScore();
        removeItem(enemies, i);
        break;
      }
    }
  }
}

function getSanitizerColor() {
  if (remainingShots >= maxShots / 2) {
    return "green";
  } else if (remainingShots >= maxShots / 4) {
    return "orange";
  }
  return "red";
}

function createShooter(x, y) {
  setStrokeColor("black");
 setFillColor(shooterFillColor);
 rect(x, y, 20, 5);
 rect(x + 5, y + 5, 5, 10);
 rect(x, y + 15, 20, shooterHeight);
 setFillColor(getSanitizerColor());
 if (remainingShots > 0) {
  rect(x, y + 20 + (shooterHeight - 5)*(maxShots - remainingShots)/maxShots, 
    20, 
    remainingShots/maxShots*(shooterHeight - 5));
 }
 bulletStartX = shooterX + 20;
 bulletStartY = shooterY + 5/2;
 allBulletPositions = [];
 if (fired) {
   bulletEndX = bulletEndX + 10;
   bulletEndY = bulletEndY + 4;
   bulletEndUpY = bulletEndUpY - 4;
   var lineYDistance = bulletEndY - bulletEndUpY;

   var numLines = 20;
    setStrokeColor(bulletColor);
   for (var i = 0; i < numLines; i++) {
    var bulletNewY = bulletEndUpY + i*lineYDistance/numLines;
    line(bulletStartX, bulletStartY, bulletEndX, bulletNewY);
    allBulletPositions.push({x: bulletEndX, y: bulletNewY});
   }
 }
}

function createRandomEnemy() {
  var x = randomNumber(250, 300);
  var y = randomNumber(20, 430);
  var size = enemySize; //randomNumber(20, 20);
  createEnemy(x, y, size);
  enemies.push({x: x, y: y, size: size});
}

function createEnemy(x, y, size) {
  // var r =  randomNumber(0, 255);
  // var g =  randomNumber(0, 255);
  // var b =  randomNumber(0, 255);
  
  // setFillColor(rgb(r,g,b));
  // circle(x, y, size);
  drawImage("enemy", x, y, size, size);
}

function redrawEnemies() {
  var newEnemies = [];
  for (var i = 0; i < enemies.length; i++) {
    var enemy = enemies[i];
    var newX = enemy.x - 5;
    
    if (newX > 0) {
      createEnemy(newX, enemy.y, enemy.size);
      newEnemies.push({ x: newX, y: enemy.y, size: enemy.size});
    }
  }
  enemies = newEnemies;
}


var introLines = [{line: "Mother earth is under virus attack!", x: -400, y: 20},
  {line: "We present you the ultimate weapon to protect the mother earth", x: -400, y: 60},
  {line: "Presenting!!!! - The SUPER SPRAY", x: -400, y: 140}
];

function moveRight(elementId, delta) {
  if (getXPosition(elementId) >= 20) {
    currentIntroLine++;
    if (currentIntroLine == introLines.length) {
      stopTimedLoop();
      createCanvas("welcomeCanvas");
      createShooter(150, 220);
      showElement("instruction0");
      showElement("instruction1");
      showElement("instruction2");
      showElement("button_play");
    }
  } else {
    setPosition(elementId, getXPosition(elementId) + delta, getYPosition(elementId));
  }
}

intro();

function createIntroLine(id, introLine) {
  textLabel(id, introLine.line);
  setProperty(id, "x", introLine.x);
  setProperty(id, "y",  introLine.y);
}

var currentIntroLine = 0;

function intro() {
  hideElement("instruction0");
  hideElement("instruction1");
  hideElement("instruction2");
  hideElement("button_play");
  for (var i = 0; i < introLines.length; i++) {
    var introLine = introLines[i];
    createIntroLine("intro"+i, introLine);
  }

  timedLoop(50, function() {
    moveRight("intro" + currentIntroLine, 20);
  });

}

onEvent("btnMute", "click", function() {
  muted = !muted;
  toggleSound();
});

function toggleSound() {
  if (muted) {
    stopSound();
    setProperty("btnMute", "image", "icon://fa-volume-off");
  } else {
    setProperty("btnMute", "image", "icon://fa-volume-up");
    playSound("corona_go.mp3", true);
  }
}
