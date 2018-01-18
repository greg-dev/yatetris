'use strict';

function ViewCanvas (params) {
  View.call(this, params);
  this.ready = false;
  this.instance = ++ViewCanvas.prototype.instance;
  this.blockSize = 16;
  this.animationTimer = null;
}

ViewCanvas.prototype = Object.create(View.prototype);

ViewCanvas.prototype.instance = 0;

ViewCanvas.prototype.init = function (game, callback) {
  View.prototype.init.call(this, game);

  // clear root
  while (this.params.root.firstChild) {
    this.params.root.removeChild(this.params.root.firstChild);
  }

  // create ui
  var ui = document.createElement('div');
  ui.id = 'ui-' + this.instance;
  ui.style.position = 'relative';
  ui.style.border = '1px solid';
  ui.style.backgroundColor = 'gray';
  ui.style.width = (this.game.grid[0].length + 2) * this.blockSize + 'px';
  ui.style.height = (this.game.grid.length + 2) * this.blockSize + 'px';
  this.params.root.appendChild(ui);
  this.ui = ui;

  // create board for falling tetromino and dropped blocks
  var board = document.createElement('div');
  board.id = 'board-' + this.instance;
  board.style.position = 'relative';
  board.style.top = this.blockSize + 'px';
  board.style.left = this.blockSize + 'px';
  this.ui.appendChild(board);
  this.ui.board = board;

  // create separate canvas layers:
  // dropped layer for dropped blocks
  // falling layer for falling tetromino
  // overlay layer for text informations and animations
  var layers = ['dropped', 'falling', 'overlay'];

  var view = this;
  var canvasWidth = view.game.grid[0].length * view.blockSize;
  var canvasHeight = view.game.grid.length * view.blockSize;
  this.ui.layers = layers.reduce(function (layers, layer, index) {
    layers[layer] = createCanvasLayer(canvasWidth, canvasHeight, !index);
    view.ui.board.appendChild(layers[layer]);
    return layers;
  }, {});

  function createCanvasLayer (width, height, first) {
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.style.position = first ? 'relative' : 'absolute';
    canvas.style.top = 0;
    canvas.style.left = 0;
    canvas.style.border = '1px solid';
    canvas.ctx = canvas.getContext('2d');
    return canvas;
  }

  this.ui.images = {};
  this.loadImages(function onAllImagesLoaded (view) {
    view.ready = true;
    callback();
  });
};

ViewCanvas.prototype.loadImages = function (callback) {
  var files = assets.files.blocks;
  var imagesToLoad = Object.keys(files).length;
  for (var filename in files) {
    var image = this.ui.images[filename] = new Image(); // eslint-disable-line no-undef
    image.view = this;
    image.loaded = false;
    image.onload = function () {
      this.loaded = true;
      var loadedImages = [];
      var images = this.view.ui.images;
      for (var image in images) {
        if (images[image].loaded) loadedImages.push(image);
      }

      setTimeout((function (view, count, callback) {
        return function () {
          view.renderLoadingProgress('Loaded images: ' + count + '/' + imagesToLoad);
          if (count >= imagesToLoad) {
            callback(view);
          }
        };
      }(this.view, loadedImages.length, callback)), loadedImages.length * 100);
    };
    image.src = assets.dir + files[filename];
  }
};

ViewCanvas.prototype.renderLoadingProgress = function (text) {
  var cnv = this.ui.layers.overlay;
  cnv.style.backgroundColor = 'white';
  cnv.ctx.clearRect(0, 0, cnv.width, cnv.height);

  var title = 'tetris';
  var size = this.fitText(cnv, title, 20, 20);
  this.fitText(cnv, text, 20, 20 + size);
  this.showOverlay(0.7);
};

ViewCanvas.prototype.showStartScreen = function () {
  var cnv = this.ui.layers.overlay;
  cnv.style.backgroundColor = 'white';
  cnv.ctx.clearRect(0, 0, cnv.width, cnv.height);

  var title = 'tetris';
  var size = this.fitText(cnv, title, 20, 20);
  var info = 'Press [space] to play';
  this.fitText(cnv, info, 20, 20 + size);
  this.showOverlay(0.7);
};

ViewCanvas.prototype.showEndScreen = function () {
  var cnv = this.ui.layers.overlay;
  cnv.style.backgroundColor = 'white';
  cnv.ctx.clearRect(0, 0, cnv.width, cnv.height);

  var title = 'tetris';
  var size = this.fitText(cnv, title, 20, 20);
  var info = 'Press [space] to play again';
  this.fitText(cnv, info, 20, 20 + size);
  this.showOverlay(0.7);
};

ViewCanvas.prototype.fitText = function (cnv, text, initialSize, y) {
  var ctx = cnv.ctx;
  for (var size = initialSize; size > 0; size--) {
    ctx.font = size + 'px Arial';
    var width = ctx.measureText(text).width;
    if (width < cnv.width) {
      ctx.font = size + 'px Arial';
      ctx.fillText(text, (cnv.width - width) / 2, y);
      return size;
    }
  }
  return false;
};

ViewCanvas.prototype.renderTetromino = function () {
  var cnv = this.ui.layers.falling;
  var ctx = cnv.ctx;
  ctx.clearRect(0, 0, cnv.width, cnv.height);
  var image = this.ui.images.blue;
  var tetromino = this.game.tetromino;
  var blocks = tetromino.blocks;
  for (var y = 0; y < blocks.length; y++) {
    for (var x = 0; x < blocks[0].length; x++) {
      if (blocks[y][x]) {
        ctx.drawImage(
          image,
          (tetromino.x + x) * this.blockSize,
          (tetromino.y + y) * this.blockSize,
          this.blockSize,
          this.blockSize
        );
      }
    }
  }
};

ViewCanvas.prototype.showGameScreen = function () {
  this.hideOverlay();
};

ViewCanvas.prototype.renderGrid = function () {
  var cnv = this.ui.layers.dropped;
  var ctx = cnv.ctx;
  ctx.clearRect(0, 0, cnv.width, cnv.height);
  var image = this.ui.images.background;
  var blocks = this.game.grid;
  for (var y = 0; y < blocks.length; y++) {
    for (var x = 0; x < blocks[0].length; x++) {
      if (blocks[y][x]) {
        ctx.drawImage(
          image,
          x * this.blockSize,
          y * this.blockSize,
          this.blockSize,
          this.blockSize
        );
      }
    }
  }
};

ViewCanvas.prototype.removedLinesInfo = {
  2: 'nice',
  3: 'awesome',
  4: 'perfect'
};

ViewCanvas.prototype.renderRemovedLines = function (removedLines) {
  var cnv = this.ui.layers.overlay;
  cnv.style.opacity = 1;
  var ctx = cnv.ctx;
  ctx.clearRect(0, 0, cnv.width, cnv.height);
  var image = this.ui.images.red;
  var blocks = this.game.grid;
  for (var i = 0; i < removedLines.length; i++) {
    for (var x = 0; x < blocks[0].length; x++) {
      ctx.drawImage(
        image,
        x * this.blockSize,
        removedLines[i] * this.blockSize,
        this.blockSize,
        this.blockSize
      );
    }
  }

  var removedLinesInfo = this.removedLinesInfo[removedLines.length];
  if (removedLinesInfo) {
    this.fitText(cnv, removedLinesInfo, 20, 20);
  }

  var opacity = cnv.style.opacity;
  var animationTimer = this.animationTimer;
  animationTimer = setInterval(function () {
    opacity = parseFloat(parseFloat(opacity).toFixed(1)) + 0.1;
    cnv.style.opacity = opacity;
    if (opacity >= 0.6) {
      clearInterval(animationTimer);
      animationTimer = setInterval(function () {
        opacity = parseFloat(parseFloat(opacity).toFixed(1)) - 0.1;
        cnv.style.opacity = opacity;
        if (opacity <= 0) {
          opacity = 0;
          clearInterval(animationTimer);
        }
      }, 30);
    }
  }, 30);
};

ViewCanvas.prototype.clearOverlay = function () {
  var cnv = this.ui.layers.overlay;
  var ctx = cnv.ctx;
  cnv.style.backgroundColor = 'gray';
  ctx.clearRect(0, 0, cnv.width, cnv.height);
};

ViewCanvas.prototype.hideOverlay = function () {
  this.ui.layers.overlay.style.opacity = 0;
};

ViewCanvas.prototype.showOverlay = function (opacity) {
  this.ui.layers.overlay.style.opacity = opacity || 1;
};
