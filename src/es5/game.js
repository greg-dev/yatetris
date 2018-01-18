'use strict';

function Game (options) {
  this.grid = [];
  this.tetrominos = [];
  this.tetromino = null;
  this.speed = 1000;
  this.timeout = null;

  if (this.validateOption(options)) {
    this.init(options);
  }
}

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

Game.prototype.createEmptyGrid = function (rows, cells) {
  return new Array(rows).fill(0).map(function () {
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
  this.createNextTetromino();
  this.createNextTetromino();
  this.spawnNextTetromino();
  this.play();
};

Game.prototype.getRandomShape = function () {
  var keys = Object.keys(shapes);
  return shapes[keys[Math.floor(Math.random() * keys.length)]];
};

Game.prototype.createRandomTetromino = function () {
  return new Tetromino(this.getRandomShape(), this.grid);
};

Game.prototype.createNextTetromino = function () {
  this.tetrominos.push(this.createRandomTetromino());
};

Game.prototype.spawnTetromino = function (tetromino) {
  tetromino.x = Math.floor((this.grid[0].length - tetromino.blocks[0].length) / 2);
  tetromino.y = 0;
  this.tetromino = tetromino;
  this.view.renderTetromino();
};

Game.prototype.spawnNextTetromino = function () {
  if (this.tetrominos.length) {
    this.spawnTetromino(this.tetrominos.shift());
  }
};

Game.prototype.dropTetromino = function () {
  for (var y = 0; y < this.tetromino.blocks.length; y++) {
    for (var x = 0; x < this.tetromino.blocks.length; x++) {
      if (this.tetromino.blocks[y][x]) {
        this.grid[this.tetromino.y + y][this.tetromino.x + x] = this.tetromino.blocks[y][x];
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
  if (this.tetromino.tryMoveDown()) {
    this.view.renderTetromino();
  } else {
    this.dropTetromino();
    var removedLines = this.tryRemoveLines();
    if (removedLines.length) {
      this.view.renderRemovedLines(removedLines);
    }
    this.view.renderGrid();
    this.createNextTetromino();
    this.spawnNextTetromino();
    if (this.tetromino.blocked()) {
      this.end();
      return;
    }
    this.view.renderTetromino();
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

Game.prototype.play = function () {
  this.input.enableMove();
  this.applySpeed(this.speed);
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

Game.prototype.end = function () {
  this.input.disableMove();
  this.applySpeed(0);
  this.tetrominos = [];
  this.clearGrid();
  this.view.showEndScreen();
  this.input.enableStart();
};
