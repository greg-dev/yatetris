'use strict';

function Game (options) {
  this.grid = [];
  this.queue = [];
  this.tetrominos = [];
  this.tetromino = null;
  this.timeout = null;

  this.speedPercent = 100;
  this.level = 1;
  this.lines = 0;
  this.score = 0;

  if (this.validateOption(options)) {
    this.init(options);
  }
}

Game.prototype.pointsForLines = [0, 40, 100, 300, 1200];
Game.prototype.linesPerLevel = 5;
Game.prototype.speedPercentIncreasePerLevel = 10;
Game.prototype.initialSpeed = 1000;
Game.prototype.removedLinesInfo = {
  1: 'single',
  2: 'double',
  3: 'triple',
  4: 'tetris'
};

Game.prototype.validateOption = function (options) {
  options = typeof options === 'object' ? options : {};
  var params = {
    defaultRows: 20,
    defaultCells: 10,
    minRows: 2,
    minCells: 2
  };
  var cells = parseInt(options.cells) || params.defaultCells;
  if (cells < params.minCells) {
    throw new Error(
      'The board should be at least ' + params.minCells + ' blocks wide'
    );
  }
  var rows = parseInt(options.rows) || params.defaultRows;
  if (rows < params.minRows) {
    throw new Error(
      'The board should be at least ' + params.minRows + ' blocks tall'
    );
  }

  return true;
};

Game.prototype.hiddenLines = 1;

Game.prototype.createEmptyGrid = function (rows, cells) {
  return new Array(rows + this.hiddenLines).fill(0).map(function () {
    return new Array(cells).fill(0);
  });
};

Game.prototype.clearGrid = function () {
  for (var i = 0; i < this.grid.length; i++) {
    for (var j = 0; j < this.grid[i].length; j++) {
      this.grid[i][j] = 0;
    }
  }
};

Game.prototype.init = function (options) {
  this.grid = options.grid || this.createEmptyGrid(options.rows, options.cells);
  this.speedPercent = parseInt(options.speedPercent) || this.speedPercent;
  this.tetrominos = options.tetrominos || tetrominos;

  var showStartScreen = this.showStartScreen.bind(this);
  this.view = options.view;
  this.input = options.input;
  this.view.init(this, showStartScreen);
  this.input.init(this, showStartScreen);
};

Game.prototype.showStartScreen = function () {
  if (this.view.ready && this.input.ready) {
    this.view.showStartScreen();
    this.input.enableStart();
  }
};

Game.prototype.startGame = function () {
  this.resetLevelSettings();
  this.input.disableStart();
  this.view.showGameScreen();
  this.view.renderGrid();
  this.updateProgress();
  this.createNextTetromino();
  this.createNextTetromino();
  this.spawnNextTetromino();
  this.resume();
};

Game.prototype.getRandomTetrominoData = function () {
  var keys = Object.keys(this.tetrominos);
  var data = this.tetrominos[keys[Math.floor(Math.random() * keys.length)]];
  return data;
};

Game.prototype.createRandomTetromino = function () {
  return new Tetromino(this.getRandomTetrominoData(), this.grid);
};

Game.prototype.createNextTetromino = function () {
  this.queue.push(this.createRandomTetromino());
};

Game.prototype.spawnTetromino = function (tetromino) {
  tetromino.x = Math.floor((this.grid[0].length - tetromino.blocks[0].length) / 2);
  tetromino.y = tetromino.spawnLine + this.hiddenLines;
  this.tetromino = tetromino;
  this.view.renderTetromino();
};

Game.prototype.spawnNextTetromino = function () {
  if (this.queue.length) {
    this.spawnTetromino(this.queue.shift());
    this.view.renderNextTetromino();
  }
};

Game.prototype.dropTetromino = function () {
  var tetromino = this.tetromino;
  var blocks = tetromino.blocks;
  for (var y = 0; y < blocks.length; y++) {
    for (var x = 0; x < blocks.length; x++) {
      if (blocks[y][x]) {
        this.grid[tetromino.y + y][tetromino.x + x] = blocks[y][x];
      }
    }
  }
};

Game.prototype.tryRotate = function () {
  if (this.tetromino.tryRotate()) {
    this.view.renderTetromino();
  }
};

Game.prototype.tryMoveLeft = function () {
  if (this.tetromino.tryMoveLeft()) {
    this.view.renderTetromino();
  }
};

Game.prototype.tryMoveRight = function () {
  if (this.tetromino.tryMoveRight()) {
    this.view.renderTetromino();
  }
};

Game.prototype.tryMoveDown = function () {
  var game = this;
  var view = game.view;
  if (game.tetromino.tryMoveDown()) {
    view.renderTetromino();
  } else {
    game.dropTetromino();
    var removedLines = game.tryRemoveLines();
    game.updateProgress(removedLines.length);
    if (removedLines.length) {
      game.halt();
      view.renderRemovedLines(removedLines, function () {
        view.removeTetromino();
        view.renderGrid();
        game.createNextTetromino();
        game.spawnNextTetromino();
        game.resume();
      });
    } else {
      view.renderGrid();
      game.createNextTetromino();
      game.spawnNextTetromino();
      if (game.tetromino.blocked()) {
        game.end();
        return;
      }
      view.renderTetromino();
    }
  }
};

Game.prototype.tryRemoveLines = function () {
  var removedLines = this.getLinesToRemove();
  if (removedLines.length) {
    this.removeLinesFromGrid(removedLines);
  }
  return removedLines;
};

Game.prototype.getLinesToRemove = function () {
  var linesToRemove = [];
  var grid = this.grid;

  for (var y = 0, lines = grid.length; y < lines; y++) {
    var remove = true;
    for (var x = 0, cells = grid[0].length; x < cells; x++) {
      remove = remove && grid[y][x];
    }
    if (remove) {
      linesToRemove.push(y);
    }
  }

  return linesToRemove;
};

Game.prototype.removeLinesFromGrid = function (removedLines) {
  var grid = this.grid;
  for (var i = 0; i < removedLines.length; i++) {
    grid.splice(removedLines[i], 1);
    grid.unshift(new Array(grid[0].length).fill(0));
  }
};

Game.prototype.calculateLevel = function (lines) {
  return Math.floor(lines / this.linesPerLevel) + 1;
};

Game.prototype.calculateSpeed = function (level) {
  return 100 + this.speedPercentIncreasePerLevel * (this.level - 1);
};

Game.prototype.calculateScore = function (lines) {
  return this.pointsForLines[lines] * this.level;
};

Game.prototype.setLevel = function (level) {
  this.level = level;
};

Game.prototype.setSpeed = function (speedPercent) {
  if (this.speedPercent !== speedPercent) {
    this.applySpeed(speedPercent);
  }
  this.speedPercent = speedPercent;
};

Game.prototype.addScore = function (score) {
  this.score += score;
};

Game.prototype.addLines = function (lines) {
  this.lines += lines;
};

Game.prototype.updateProgress = function (lines) {
  var score = 0;
  if (lines) {
    this.addLines(lines);
    this.setLevel(this.calculateLevel(this.lines));
    score = this.calculateScore(lines);
    this.addScore(score);
    this.setSpeed(this.calculateSpeed(this.level));
  }
  var progress = [
    'Level: ' + this.level,
    'Speed: ' + this.speedPercent + '%',
    'Score: ' + this.score,
    'Lines: ' + this.lines
  ];
  if (lines) {
    progress.push(this.removedLinesInfo[lines]);
    progress.push('+' + score + ' points');
  }
  this.view.updateProgress(progress);
};

Game.prototype.resetLevelSettings = function () {
  this.level = 1;
  this.speedPercent = 100;
  this.lines = 0;
  this.score = 0;
};

Game.prototype.applySpeed = function (speedPercent) {
  clearTimeout(this.timeout);
  if (speedPercent) {
    var game = this;
    this.timeout = setInterval(function () {
      game.tryMoveDown();
    }, 100 * this.initialSpeed / speedPercent);
  }
};

Game.prototype.startTimer = function () {
  this.applySpeed(this.speedPercent);
};

Game.prototype.stopTimer = function () {
  this.applySpeed(0);
};

Game.prototype.halt = function () {
  this.stopTimer();
  this.input.disableMove();
};

Game.prototype.resume = function () {
  this.input.enableMove();
  this.startTimer();
};

Game.prototype.end = function () {
  this.halt();
  this.queue = [];
  this.clearGrid();
  this.view.showEndScreen();
  this.input.enableStart();
};
