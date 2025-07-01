import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
const GRID_SIZE = 20;
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 400;
function App() {
  const canvasRef = useRef(null);
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [direction, setDirection] = useState({ x: 0, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [speed, setSpeed] = useState(200);
  const [isPaused, setPaused] = useState(false);
  useEffect(() => {
    const savedHighScore = localStorage.getItem('snakeHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, []);
  const generateFood = useCallback((currentSnake) => {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * (CANVAS_WIDTH / GRID_SIZE)),
        y: Math.floor(Math.random() * (CANVAS_HEIGHT / GRID_SIZE))
      };
    } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, []);
  const resetGame = () => {
    const initialSnake = [{ x: 10, y: 10 }];
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setDirection({ x: 0, y: 0 });
    setGameOver(false);
    setScore(0);
    setGameStarted(false);
    setSpeed(200);
    setPaused(false);
  };
  const startGame = () => {
    setGameStarted(true);
    setDirection({ x: 1, y: 0 });
  };
  const togglePause = () => {
    if (gameStarted && !gameOver) {
      setPaused(!isPaused);
    }
  };
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!gameStarted || gameOver || isPaused) return;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          setDirection(prev => prev.y === 0 ? { x: 0, y: -1 } : prev);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          setDirection(prev => prev.y === 0 ? { x: 0, y: 1 } : prev);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          setDirection(prev => prev.x === 0 ? { x: -1, y: 0 } : prev);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          setDirection(prev => prev.x === 0 ? { x: 1, y: 0 } : prev);
          break;
        case ' ':
          e.preventDefault();
          togglePause();
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStarted, gameOver, isPaused]);
  useEffect(() => {
    if (!gameStarted || gameOver || isPaused) return;
    const gameLoop = setInterval(() => {
      setSnake(prevSnake => {
        const newSnake = [...prevSnake];
        const head = { ...newSnake[0] };
        head.x += direction.x;
        head.y += direction.y;
        if (head.x < 0 || head.x >= CANVAS_WIDTH / GRID_SIZE || 
            head.y < 0 || head.y >= CANVAS_HEIGHT / GRID_SIZE) {
          setGameOver(true);
          return prevSnake;
        }
        if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
          setGameOver(true);
          return prevSnake;
        }
        newSnake.unshift(head);
        if (head.x === food.x && head.y === food.y) {
          const newScore = score + 10;
          setScore(newScore);
          setFood(generateFood(newSnake));
          if (newScore % 50 === 0 && speed > 100) {
            setSpeed(prev => prev - 20);
          }
          if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem('snakeHighScore', newScore.toString());
          }
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    }, speed);
    return () => clearInterval(gameLoop);
  }, [direction, food, gameStarted, gameOver, score, highScore, speed, generateFood, isPaused]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= CANVAS_WIDTH; i += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let i = 0; i <= CANVAS_HEIGHT; i += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(CANVAS_WIDTH, i);
      ctx.stroke();
    }
    snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? '#2d5a2d' : '#4a7c4a';
      ctx.fillRect(
        segment.x * GRID_SIZE + 1,
        segment.y * GRID_SIZE + 1,
        GRID_SIZE - 2,
        GRID_SIZE - 2
      );
    });
    ctx.fillStyle = '#cc3333';
    ctx.fillRect(
      food.x * GRID_SIZE + 1,
      food.y * GRID_SIZE + 1,
      GRID_SIZE - 2,
      GRID_SIZE - 2
    );
  }, [snake, food]);
  return (
    <div className="App">
      <div className="game-container">
        <h1>Snake Game</h1>
        <div className="score-board">
          <div className="score">Score: {score}</div>
          <div className="high-score">High Score: {highScore}</div>
        </div>
        <div className="game-area">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="game-canvas"
          />
          {!gameStarted && !gameOver && (
            <div className="game-overlay">
              <button onClick={startGame} className="start-button">
                Start Game
              </button>
            </div>
          )}
          {isPaused && (
            <div className="game-overlay">
              <div className="pause-message">PAUSED</div>
              <button onClick={togglePause} className="resume-button">
                Resume
              </button>
            </div>
          )}
          {gameOver && (
            <div className="game-overlay">
              <div className="game-over">
                <h2>Game Over!</h2>
                <p>Final Score: {score}</p>
                {score === highScore && score > 0 && (
                  <p className="new-record">New High Score!</p>
                )}
                <button onClick={resetGame} className="restart-button">
                  Play Again
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="controls">
          <h3>Controls:</h3>
          <p>Arrow Keys or WASD to move</p>
          <p>Spacebar to pause/resume</p>
          {gameStarted && !gameOver && (
            <button onClick={togglePause} className="pause-btn">
              {isPaused ? 'Resume' : 'Pause'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
export default App;