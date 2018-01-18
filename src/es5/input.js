'use strict';

function Input (params) {
  this.params = params;
}

Input.prototype.init = function (game) {
  this.game = game;
  this.view = game.view;
  this.ready = false;
};

Input.prototype.missingMethodError = function (method) {
  throw new Error('Custom input ' + method + '() implementation needed');
};

Input.prototype.enableStart = function () {
  this.missingMethodError('enableStart');
};

Input.prototype.disableStart = function () {
  this.missingMethodError('disableStart');
};

Input.prototype.enableMove = function () {
  this.missingMethodError('enableMove');
};

Input.prototype.disableMove = function () {
  this.missingMethodError('disableMove');
};

Input.prototype.rotate = function () {
  this.game.tryRotate();
};

Input.prototype.moveDown = function () {
  this.game.tryMoveDown();
};

Input.prototype.moveLeft = function () {
  this.game.tryMoveLeft();
};

Input.prototype.moveRight = function () {
  this.game.tryMoveRight();
};

Input.prototype.startGame = function () {
  this.game.startGame();
};
