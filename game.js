const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// Paddle settings
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 90;
const PADDLE_MARGIN = 18;
const PADDLE_SPEED = 6;

// Ball settings
const BALL_SIZE = 16;
const BALL_SPEED = 5;

// Game state
let playerY = HEIGHT / 2 - PADDLE_HEIGHT / 2;
let aiY = HEIGHT / 2 - PADDLE_HEIGHT / 2;
let ballX = WIDTH / 2 - BALL_SIZE / 2;
let ballY = HEIGHT / 2 - BALL_SIZE / 2;
let ballVelX = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
let ballVelY = BALL_SPEED * (Math.random() * 2 - 1);

let playerScore = 0;
let aiScore = 0;

// Score display
const playerScoreSpan = document.getElementById('playerScore');
const aiScoreSpan = document.getElementById('aiScore');

// Mouse control for player paddle
canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  const mouseY = e.clientY - rect.top;
  playerY = mouseY - PADDLE_HEIGHT / 2;
  // Clamp paddle position
  playerY = Math.max(0, Math.min(HEIGHT - PADDLE_HEIGHT, playerY));
});

// Reset ball after score
function resetBall(direction = 1) {
  ballX = WIDTH / 2 - BALL_SIZE / 2;
  ballY = HEIGHT / 2 - BALL_SIZE / 2;
  ballVelX = BALL_SPEED * direction;
  ballVelY = BALL_SPEED * (Math.random() * 2 - 1);
}

// Main game loop
function gameLoop() {
  // Move ball
  ballX += ballVelX;
  ballY += ballVelY;

  // Wall collision (top/bottom)
  if (ballY <= 0) {
    ballY = 0;
    ballVelY *= -1;
  }
  if (ballY + BALL_SIZE >= HEIGHT) {
    ballY = HEIGHT - BALL_SIZE;
    ballVelY *= -1;
  }

  // Paddle collision - Player (left)
  if (
    ballX <= PADDLE_MARGIN + PADDLE_WIDTH &&
    ballY + BALL_SIZE > playerY &&
    ballY < playerY + PADDLE_HEIGHT
  ) {
    ballX = PADDLE_MARGIN + PADDLE_WIDTH;
    ballVelX *= -1;
    // Add spin based on where it hit the paddle
    ballVelY += ((ballY + BALL_SIZE / 2) - (playerY + PADDLE_HEIGHT / 2)) / 18;
  }

  // Paddle collision - AI (right)
  if (
    ballX + BALL_SIZE >= WIDTH - (PADDLE_MARGIN + PADDLE_WIDTH) &&
    ballY + BALL_SIZE > aiY &&
    ballY < aiY + PADDLE_HEIGHT
  ) {
    ballX = WIDTH - (PADDLE_MARGIN + PADDLE_WIDTH) - BALL_SIZE;
    ballVelX *= -1;
    ballVelY += ((ballY + BALL_SIZE / 2) - (aiY + PADDLE_HEIGHT / 2)) / 20;
  }

  // Score?
  if (ballX < 0) {
    aiScore++;
    aiScoreSpan.textContent = aiScore;
    resetBall(1);
  }
  if (ballX + BALL_SIZE > WIDTH) {
    playerScore++;
    playerScoreSpan.textContent = playerScore;
    resetBall(-1);
  }

  // AI paddle movement (simple tracking)
  let aiCenter = aiY + PADDLE_HEIGHT / 2;
  if (aiCenter < ballY + BALL_SIZE / 2 - 12) {
    aiY += PADDLE_SPEED;
  } else if (aiCenter > ballY + BALL_SIZE / 2 + 12) {
    aiY -= PADDLE_SPEED;
  }
  // Clamp AI paddle
  aiY = Math.max(0, Math.min(HEIGHT - PADDLE_HEIGHT, aiY));

  // Draw everything
  draw();

  requestAnimationFrame(gameLoop);
}

function draw() {
  // Clear
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  // Draw middle line
  ctx.save();
  ctx.strokeStyle = '#888';
  ctx.setLineDash([12, 12]);
  ctx.beginPath();
  ctx.moveTo(WIDTH / 2, 0);
  ctx.lineTo(WIDTH / 2, HEIGHT);
  ctx.stroke();
  ctx.restore();

  // Draw paddles
  ctx.fillStyle = '#fff';
  // Player paddle (left)
  ctx.fillRect(PADDLE_MARGIN, playerY, PADDLE_WIDTH, PADDLE_HEIGHT);
  // AI paddle (right)
  ctx.fillRect(WIDTH - PADDLE_MARGIN - PADDLE_WIDTH, aiY, PADDLE_WIDTH, PADDLE_HEIGHT);

  // Draw ball
  ctx.beginPath();
  ctx.arc(ballX + BALL_SIZE / 2, ballY + BALL_SIZE / 2, BALL_SIZE / 2, 0, Math.PI * 2);
  ctx.fillStyle = '#ff3';
  ctx.shadowColor = '#ff0';
  ctx.shadowBlur = 20;
  ctx.fill();
  ctx.shadowBlur = 0;
}

// Start the game
resetBall(ballVelX > 0 ? 1 : -1);
gameLoop();