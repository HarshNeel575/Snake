// Get the canvas element and its context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Initialize game variables
let snake = [{ x: 10, y: 10 }];
let food = null;
let direction = 'RIGHT';
let score = 0;
let level = 1;
let coins = 0;
let gameInterval;
let foodTimer = 0;
let snakeMultiplier = 1; // Multiplier for score and coins
let currentSnakeType = 'normal'; // Default snake type
let speedMultiplier = 1; // Controls the speed of the snake

// Game speed
let gameSpeed = 100; // Lower means faster speed

// Special Snakes inventory
let purchasedSnakes = [];

// Subtle background gradients
const backgrounds = [
  'radial-gradient(circle, rgba(220, 20, 60, 0.1) 0%, rgba(178, 34, 34, 0.15) 30%, rgba(210, 4, 45, 0.3) 60%, rgba(255, 36, 0, 0.4) 80%, rgba(139, 0, 0, 0.6) 100%)',
  'radial-gradient(circle, rgba(238, 130, 238, 0.1) 0%, rgba(148, 0, 211, 0.15) 30%, rgba(75, 0, 130, 0.25) 60%, rgba(138, 43, 226, 0.35) 80%, rgba(72, 61, 139, 0.45) 100%)',
  'radial-gradient(circle, rgba(0, 128, 128, 0.1) 0%, rgba(0, 100, 100, 0.15) 30%, rgba(0, 139, 139, 0.3) 60%, rgba(0, 150, 136, 0.4) 80%, rgba(0, 128, 128, 0.5) 100%)',
  'radial-gradient(circle, rgba(255, 94, 77, 0.1) 0%, rgba(186, 85, 211, 0.15) 30%, rgba(70, 130, 180, 0.25) 60%, rgba(160, 82, 45, 0.35) 80%, rgba(128, 0, 128, 0.45) 100%)',
  'radial-gradient(circle, rgba(255, 223, 186, 0.1) 0%, rgba(255, 105, 180, 0.15) 30%, rgba(70, 130, 180, 0.25) 60%, rgba(255, 69, 0, 0.35) 80%, rgba(75, 0, 130, 0.45) 100%)'
];

// Load high scores, coins, level, and snake type from localStorage
let highScores = JSON.parse(localStorage.getItem('highScores')) || [];
let savedCoins = JSON.parse(localStorage.getItem('coins')) || 0;
let savedLevel = JSON.parse(localStorage.getItem('level')) || 1;
let savedSnakeType = JSON.parse(localStorage.getItem('snakeType')) || 'normal';
let savedPurchasedSnakes = JSON.parse(localStorage.getItem('purchasedSnakes')) || [];

// Update game state from saved values
coins = savedCoins;
level = savedLevel;
currentSnakeType = savedSnakeType;
purchasedSnakes = savedPurchasedSnakes;

// Update high scores in the DOM
function updateHighScores() {
  const highScoresList = document.getElementById('high-scores-list');
  highScoresList.innerHTML = '';
  const topScores = highScores.slice(0, 5);
  topScores.forEach(score => {
    const li = document.createElement('li');
    li.textContent = score;
    highScoresList.appendChild(li);
  });
}

// Display coins, level, and score in the UI
function updateUI() {
  document.getElementById('score').textContent = score;
  document.getElementById('level').textContent = level;
  document.getElementById('coins').textContent = coins;

  // Update special snake options in the dropdown
  const snakeSelect = document.getElementById('snakeSelect');
  snakeSelect.querySelectorAll('option').forEach(option => {
    if (option.value !== 'normal' && !purchasedSnakes.includes(option.value)) {
      option.disabled = true;
    } else {
      option.disabled = false;
    }
  });
}

// Keydown event listener for snake movement
document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp' && direction !== 'DOWN') direction = 'UP';
  if (event.key === 'ArrowDown' && direction !== 'UP') direction = 'DOWN';
  if (event.key === 'ArrowLeft' && direction !== 'RIGHT') direction = 'LEFT';
  if (event.key === 'ArrowRight' && direction !== 'LEFT') direction = 'RIGHT';
});

// Handle background change
document.getElementById('backgroundSelect').addEventListener('change', function() {
  const selectedIndex = this.value;
  canvas.style.background = backgrounds[selectedIndex];
});

// Set the initial background to the first one
canvas.style.background = backgrounds[0];

// Purchase special snakes directly from the dropdown
document.getElementById('snakeSelect').addEventListener('change', function() {
  const selectedSnake = this.value;
  if (selectedSnake === 'normal') {
    currentSnakeType = 'normal';
    snakeMultiplier = 1;
    speedMultiplier = 1;
    alert('You are now using the Normal Snake!');
    localStorage.setItem('snakeType', 'normal');
  } else if (purchasedSnakes.includes(selectedSnake)) {
    currentSnakeType = selectedSnake;
    alert(`You are now using the ${selectedSnake.replace('special', 'Special ')}!`);
    localStorage.setItem('snakeType', selectedSnake);
  } else {
    alert('You must purchase this snake first!');
  }
});

// Purchase special snakes directly from the dropdown
function purchaseSnake(snakeType, cost, multiplier, message) {
  if (coins >= cost) {
    coins -= cost;
    purchasedSnakes.push(snakeType);
    currentSnakeType = snakeType;
    snakeMultiplier = multiplier;
    alert(message);
    localStorage.setItem('coins', JSON.stringify(coins));
    localStorage.setItem('purchasedSnakes', JSON.stringify(purchasedSnakes));
    updateUI();
  } else {
    alert('You do not have enough coins to purchase this snake!');
  }
}

// Populate special snakes purchase options
function setupSnakeStore() {
  const store = document.getElementById('snakeStore');
  store.innerHTML = ''; // Clear previous content

  const specialSnakes = [
    { name: 'Fire Snake', type: 'special1', cost: 100, multiplier: 2, message: 'You purchased the Fire Snake!' },
    { name: 'Ice Snake', type: 'special2', cost: 150, multiplier: 0.5, message: 'You purchased the Ice Snake!' },
    { name: 'Golden Snake', type: 'special3', cost: 200, multiplier: 1.5, message: 'You purchased the Golden Snake!' },
    { name: 'Lightning Snake', type: 'special4', cost: 300, multiplier: 1.5, message: 'You purchased the Lightning Snake!' },
    { name: 'Shadow Snake', type: 'special5', cost: 500, multiplier: 1, message: 'You purchased the Shadow Snake!' },
  ];

  specialSnakes.forEach(snake => {
    const button = document.createElement('button');
    button.textContent = `${snake.name} (${snake.cost} Coins)`;
    button.disabled = purchasedSnakes.includes(snake.type);
    button.addEventListener('click', () => {
      if (!button.disabled) {
        purchaseSnake(snake.type, snake.cost, snake.multiplier, snake.message);
      }
    });
    store.appendChild(button);
  });
}

// Start the game
function startGame() {
  snake = [{ x: 10, y: 10 }];
  direction = 'RIGHT';
  score = 0;
  food = generateFood();
  foodTimer = 0;
  gameInterval = setInterval(gameLoop, gameSpeed);
  updateUI();
  setupSnakeStore();
}

// The main game loop
function gameLoop() {
  clearCanvas();
  moveSnake();
  checkCollisions();
  checkFood();
  drawSnake();
  drawFood();
}

// Move the snake in the current direction
function moveSnake() {
  const head = { ...snake[0] };

  if (direction === 'UP') head.y -= 1;
  if (direction === 'DOWN') head.y += 1;
  if (direction === 'LEFT') head.x -= 1;
  if (direction === 'RIGHT') head.x += 1;

  // Add new head to the snake
  snake.unshift(head);
  snake.pop(); // Remove the last part of the snake (tail)
}

// Draw the snake on the canvas
function drawSnake() {
  snake.forEach((part, index) => {
    if (index === 0) {
      // Draw the snake's head with a special style
      ctx.fillStyle = '#00FF00'; // Head color
      ctx.beginPath();
      ctx.arc(part.x * 20 + 10, part.y * 20 + 10, 10, 0, Math.PI * 2); // Head with circle shape
      ctx.fill();
    } else {
      // Draw the snake's body with a different style
      ctx.fillStyle = '#32CD32'; // Body color
      ctx.beginPath();
      ctx.arc(part.x * 20 + 10, part.y * 20 + 10, 10, 0, Math.PI * 2); // Body with circle shape
      ctx.fill();
    }
  });
}

// Draw the food on the canvas
function drawFood() {
  if (food.type === 'normal') {
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * 20, food.y * 20, 20, 20); // Normal food is a red square
  } else if (food.type === 'double') {
    ctx.fillStyle = 'gold';
    ctx.beginPath();
    ctx.arc(food.x * 20 + 10, food.y * 20 + 10, 10, 0, Math.PI * 2); // Double points food is a gold circle
    ctx.fill();
  } else if (food.type === 'speedup') {
    ctx.fillStyle = 'cyan';
    ctx.fillRect(food.x * 20, food.y * 20, 20, 20); // Speed-up food is cyan square
  }
}

// Clear the canvas
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Check if the snake eats food
function checkFood() {
  const head = snake[0];

  if (head.x === food.x && head.y === food.y) {
    // Check food type and apply effects
    if (food.type === 'normal') {
      score += 10;
    } else if (food.type === 'double') {
      score += 20;
    } else if (food.type === 'speedup') {
      score += 15;
      increaseSpeed(); // Speed-up the game if speed-up food is eaten
    }

    // Update the score
    document.getElementById('score').textContent = score;

    // Grow the snake by adding a new segment at the tail
    snake.push({});

    // Generate a new food location
    food = generateFood();
  }
}

// Generate new food at random positions
function generateFood() {
  const types = ['normal', 'double', 'speedup']; // Types of food
  const randomType = types[Math.floor(Math.random() * types.length)];
  const x = Math.floor(Math.random() * canvas.width / 20);
  const y = Math.floor(Math.random() * canvas.height / 20);
  return { x, y, type: randomType };
}

// Increase the game speed when a speed-up food is eaten
function increaseSpeed() {
  if (gameSpeed > 50) {
    clearInterval(gameInterval); // Clear the current game loop
    gameInterval = setInterval(gameLoop, gameSpeed - 10); // Increase game speed (decrease the interval)
  }
}

// Check for collisions with walls or the snake itself
function checkCollisions() {
  const head = snake[0];

  // Collision with walls
  if (head.x < 0 || head.x >= canvas.width / 20 || head.y < 0 || head.y >= canvas.height / 20) {
    gameOver();
  }

  // Collision with the snake itself
  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      gameOver();
    }
  }
}

// End the game
function gameOver() {
  clearInterval(gameInterval); // Stop the game loop

  // Check if the current score is a new high score
  if (highScores.length < 5 || score > highScores[highScores.length - 1]) {
    highScores.push(score);
    highScores.sort((a, b) => b - a); // Sort in descending order
    if (highScores.length > 5) highScores.pop(); // Keep only the top 5 scores

    localStorage.setItem('highScores', JSON.stringify(highScores)); // Save high scores to localStorage
    updateHighScores(); // Update high scores in the DOM
  }

  alert(`Game Over! Your score is ${score}`);
  startGame(); // Restart the game
}

// Start the game when the page loads
startGame();
