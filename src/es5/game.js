'use strict';

function Game (options) {
  this.grid = [];
  this.tetrominos = [];
  this.tetromino = null;
  this.speed = 1000;
  this.timeout = null;

  this.lines = 0;
  this.score = 0;

  if (this.validateOption(options)) {
    this.init(options);
  }
}

Game.prototype.pointsForLines = [0, 40, 100, 300, 1200];

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
  this.tetrominos = options.tetrominos || this.tetrominos;
  this.speed = parseInt(options.speed) || this.speed;

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
  var keys = Object.keys(tetrominos);
  var data = tetrominos[keys[Math.floor(Math.random() * keys.length)]];
  return data;
};

Game.prototype.createRandomTetromino = function () {
  return new Tetromino(this.getRandomTetrominoData(), this.grid);
};

Game.prototype.createNextTetromino = function () {
  this.tetrominos.push(this.createRandomTetromino());
};

Game.prototype.spawnTetromino = function (tetromino) {
  tetromino.x = Math.floor((this.grid[0].length - tetromino.blocks[0].length) / 2);
  tetromino.y = tetromino.spawnLine + this.hiddenLines;
  this.tetromino = tetromino;
  this.view.renderTetromino();
};

Game.prototype.spawnNextTetromino = function () {
  if (this.tetrominos.length) {
    this.spawnTetromino(this.tetrominos.shift());
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

Game.prototype.calculateScore = function (lines) {
  return this.pointsForLines[lines];
};

Game.prototype.addScore = function (score) {
  this.score += score;
};

Game.prototype.addLines = function (lines) {
  this.lines += lines;
};

Game.prototype.updateProgress = function (lines) {
  if (lines) {
    this.addScore(this.calculateScore(lines));
    this.addLines(lines);
  }
  this.view.updateProgress(this.score, this.lines);
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

Game.prototype.applySpeed = function (speed) {
  clearTimeout(this.timeout);
  if (speed) {
    var game = this;
    this.timeout = setInterval(function () {
      game.tryMoveDown();
    }, speed);
  }
};

Game.prototype.startTimer = function () {
  this.applySpeed(this.speed);
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
  this.tetrominos = [];
  this.clearGrid();
  this.view.showEndScreen();
  this.input.enableStart();
};
