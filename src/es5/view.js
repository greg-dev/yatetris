'use strict';

function View (params) {
  this.params = params;
}

View.prototype.init = function (game) {
  this.game = game;
  this.rows = game.grid.length - game.hiddenLines;
  this.cells = game.grid[0].length;
  this.hiddenLines = game.hiddenLines;
  this.ready = false;
};

View.prototype.missingMethodError = function (method) {
  throw new Error('Custom view ' + method + '() implementation needed');
};

View.prototype.renderTetromino = function () {
  this.missingMethodError('renderTetromino');
};
View.prototype.renderNextTetromino = function () {
  this.missingMethodError('renderNextTetromino');
};
View.prototype.removeTetromino = function () {
  this.missingMethodError('removeTetromino');
};
View.prototype.renderGrid = function () {
  this.missingMethodError('renderGrid');
};
View.prototype.renderRemovedLines = function (removedLines, callback) {
  this.missingMethodError('renderRemovedLines');
};
View.prototype.showStartScreen = function () {
  this.missingMethodError('showStartScreen');
};
View.prototype.showGameScreen = function () {
  this.missingMethodError('showGameScreen');
};
View.prototype.showEndScreen = function () {
  this.missingMethodError('showEndScreen');
};
View.prototype.updateProgress = function (info) {
  this.missingMethodError('updateProgress');
};
