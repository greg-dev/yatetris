'use strict';

function Tetromino (data, grid) {
  this.x = 0;
  this.y = 0;
  this.shape = data.shape;
  this.spawnLine = data.line || 0;
  this.rotationIndex = 0;
  this.blocks = JSON.parse(JSON.stringify(this.shape[this.rotationIndex]));
  this.grid = grid;
}

Tetromino.prototype.collides = function (blocks, posX, posY) {
  var grid = this.grid;
  for (var y = 0; y < blocks.length; y++) {
    for (var x = 0; x < blocks[0].length; x++) {
      if (blocks[y][x] && (grid[posY + y] === undefined || grid[posY + y][posX + x] !== 0)) {
        return true;
      }
    }
  }
  return false;
};

Tetromino.prototype.blocked = function (blocks, posX, posY) {
  return this.collides(this.blocks, this.x, this.y);
};

Tetromino.prototype.tryRotate = function () {
  var rotationIndex = (this.rotationIndex + 1) % this.shape.length;
  return this.canRotate(rotationIndex) ? this.rotate(rotationIndex) : false;
};

Tetromino.prototype.canRotate = function (rotationIndex) {
  var blocks = JSON.parse(JSON.stringify(this.shape[rotationIndex]));
  return !this.collides(blocks, this.x, this.y);
};

Tetromino.prototype.rotate = function (rotationIndex) {
  this.rotationIndex = rotationIndex;
  this.blocks = JSON.parse(JSON.stringify(this.shape[this.rotationIndex]));
  return true;
};

Tetromino.prototype.tryMoveLeft = function () {
  return this.tryMove(-1, 0);
};

Tetromino.prototype.tryMoveRight = function () {
  return this.tryMove(1, 0);
};

Tetromino.prototype.tryMoveDown = function () {
  return this.tryMove(0, 1);
};

Tetromino.prototype.tryMove = function (x, y) {
  return this.canMove(x, y) ? this.move(x, y) : false;
};

Tetromino.prototype.canMove = function (x, y) {
  return !this.collides(this.blocks, this.x + x, this.y + y);
};

Tetromino.prototype.move = function (x, y) {
  this.x += x;
  this.y += y;
  return true;
};
