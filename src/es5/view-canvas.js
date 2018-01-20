'use strict';

function ViewCanvas (params) {
  View.call(this, params);
  this.ready = false;
  this.instance = ++ViewCanvas.prototype.instance;
  this.rows = 0;
  this.cells = 0;
  this.blockSize = 16;
  this.animationTimer = null;
}

ViewCanvas.prototype = Object.create(View.prototype);

ViewCanvas.prototype.instance = 0;

ViewCanvas.prototype.init = function (game, callback) {
  View.prototype.init.call(this, game);

  var view = this.game.view;
  var blockSize = view.blockSize;

  // clear root
  while (this.params.root.firstChild) {
    this.params.root.removeChild(this.params.root.firstChild);
  }

  // create ui
  var ui = document.createElement('div');
  ui.id = 'ui-' + this.instance;
  ui.className = 'ui';
  this.params.root.appendChild(ui);
  this.ui = ui;

  // create board for falling tetromino and dropped blocks
  var board = document.createElement('div');
  board.id = 'board-' + this.instance;
  board.className = 'board';
  board.style.top = blockSize + 'px';
  board.style.left = blockSize + 'px';
  this.ui.appendChild(board);
  this.ui.board = board;

  // create separate canvas layers:
  // dropped layer for dropped blocks
  // falling layer for falling tetromino
  // overlay layer for text informations and animations
  var layers = ['dropped', 'falling', 'overlay'];

  var boardWidth = view.cells * blockSize;
  var boardHeight = view.rows * blockSize;
  this.ui.layers = layers.reduce(function (layers, layer) {
    layers[layer] = createCanvasLayer(boardWidth, boardHeight, layer);
    view.ui.board.appendChild(layers[layer]);
    return layers;
  }, {});

  // create canvas for next tetromino preview
  var tetrominoSize = this.getMaxTetrominoSize();
  var previewWidth = (tetrominoSize + 1) * blockSize;
  var preview = createCanvasLayer(previewWidth, previewWidth, 'preview');
  preview.style.top = blockSize + 'px';
  preview.style.right = blockSize + 'px';
  view.ui.appendChild(preview);
  this.ui.preview = preview;

  // create canvas for game progress
  var progress = createCanvasLayer(previewWidth, previewWidth, 'progress');
  progress.style.top = (2 * blockSize + preview.height) + 'px';
  progress.style.right = blockSize + 'px';
  view.ui.appendChild(progress);
  this.ui.progress = progress;

  // update ui size
  ui.style.width = (this.cells + 2 + tetrominoSize + 2) * blockSize + 'px';
  ui.style.height = (this.rows + 2) * blockSize + 'px';

  function createCanvasLayer (width, height, layer) {
    var canvas = document.createElement('canvas');
    canvas.className = layer;
    canvas.width = width;
    canvas.height = height;
    canvas.ctx = canvas.getContext('2d');
    return canvas;
  }

  this.ui.images = {};
  this.loadImages(function onAllImagesLoaded (view) {
    view.ready = true;
    callback();
  });
};

ViewCanvas.prototype.getMaxTetrominoSize = function () {
  return Object.values(tetrominos).reduce(function (max, tetromino) {
    var curr = tetromino.shape[0][0].length;
    return curr > max ? curr : max;
  }, 0);
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
  cnv.ctx.clearRect(0, 0, cnv.width, cnv.height);

  var title = 'tetris';
  var size = this.fitText(cnv, title, 20, 20);
  this.fitText(cnv, text, 20, 20 + size);
  this.showOverlay(0.7);
};

ViewCanvas.prototype.showStartScreen = function () {
  var cnv = this.ui.layers.overlay;
  cnv.ctx.clearRect(0, 0, cnv.width, cnv.height);

  var title = 'tetris';
  var size = this.fitText(cnv, title, 20, 20);
  var info = 'Press [space] to play';
  this.fitText(cnv, info, 20, 20 + size);
  this.showOverlay(0.7);
};

ViewCanvas.prototype.showEndScreen = function () {
  var cnv = this.ui.layers.overlay;
  cnv.ctx.clearRect(0, 0, cnv.width, cnv.height);

  var title = 'tetris';
  var size = this.fitText(cnv, title, 20, 20);
  var info = 'Press [space] to play again';
  this.fitText(cnv, info, 20, 20 + size);
  this.showOverlay(0.7);
};

ViewCanvas.prototype.getFitTextParams = function (cnv, text, initialSize) {
  var ctx = cnv.ctx;
  for (var size = initialSize; size > 0; size--) {
    ctx.font = size + 'px Arial';
    var width = ctx.measureText(text).width;
    if (width < cnv.width) {
      return {
        size: size,
        width: width
      };
    }
  }
  return false;
};

ViewCanvas.prototype.fitText = function (cnv, text, initialSize, y) {
  var ctx = cnv.ctx;
  var params = this.getFitTextParams(cnv, text, initialSize);
  if (typeof params === 'object') {
    ctx.font = params.size + 'px Arial';
    ctx.fillText(text, (cnv.width - params.width) / 2, y);
    return params.size;
  }
  return false;
};

ViewCanvas.prototype.renderNextTetromino = function () {
  var cnv = this.ui.preview;
  var ctx = cnv.ctx;
  ctx.clearRect(0, 0, cnv.width, cnv.height);
  if (!this.game.tetrominos.length) return;

  var tetromino = this.game.tetrominos[0];
  var images = this.ui.images;
  var image = (tetromino.tile && images[tetromino.tile]) || images.blue;
  var blocks = tetromino.blocks.filter(function (row) {
    return row.reduce(function (sum, cell) {
      return sum + cell;
    }, 0);
  });
  var blockSize = this.blockSize;
  var dx = (cnv.width - blocks[0].length * blockSize) / 2;
  var dy = ((cnv.height - blocks.length * blockSize) / 2) + tetromino.spawnLine;
  for (var y = 0; y < blocks.length; y++) {
    for (var x = 0; x < blocks[0].length; x++) {
      if (blocks[y][x]) {
        ctx.drawImage(
          image,
          x * blockSize + dx,
          y * blockSize + dy
        );
      }
    }
  }
};

ViewCanvas.prototype.renderTetromino = function () {
  var cnv = this.ui.layers.falling;
  var ctx = cnv.ctx;
  ctx.clearRect(0, 0, cnv.width, cnv.height);
  var tetromino = this.game.tetromino;
  var images = this.ui.images;
  var image = (tetromino.tile && images[tetromino.tile]) || images.blue;
  var blocks = tetromino.blocks;
  var blockSize = this.blockSize;
  for (var y = 0; y < blocks.length; y++) {
    for (var x = 0; x < blocks[0].length; x++) {
      if (blocks[y][x]) {
        ctx.drawImage(
          image,
          (tetromino.x + x) * blockSize,
          (tetromino.y + y - this.hiddenLines) * blockSize,
          blockSize,
          blockSize
        );
      }
    }
  }
};

ViewCanvas.prototype.removeTetromino = function () {
  var cnv = this.ui.layers.falling;
  var ctx = cnv.ctx;
  ctx.clearRect(0, 0, cnv.width, cnv.height);
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
          (y - this.hiddenLines) * this.blockSize,
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

ViewCanvas.prototype.renderRemovedLines = function (removedLines, callback) {
  var cnv = this.ui.layers.overlay;
  var ctx = cnv.ctx;
  ctx.clearRect(0, 0, cnv.width, cnv.height);
  var blocks = this.game.grid;
  var blockSize = this.blockSize;
  var hiddenLines = this.hiddenLines;
  var removedLinesInfo = this.removedLinesInfo[removedLines.length];
  if (removedLinesInfo) {
    this.fitText(cnv, removedLinesInfo, 20, 20);
  }

  var images = Object.values(this.ui.images);
  var opacity = cnv.style.opacity;
  var animationTimer = this.animationTimer;
  animationTimer = setInterval(function () {
    opacity = parseFloat(parseFloat(opacity).toFixed(1)) + 0.1;
    cnv.style.opacity = opacity;
    for (var i = 0; i < removedLines.length; i++) {
      for (var x = 0; x < blocks[0].length; x++) {
        var image = images[Math.floor(Math.random() * images.length)];
        cnv.ctx.drawImage(
          image,
          x * blockSize,
          (removedLines[i] - hiddenLines) * blockSize,
          blockSize,
          blockSize
        );
      }
    }
    if (opacity >= 0.6) {
      clearInterval(animationTimer);
      animationTimer = setInterval(function () {
        opacity = parseFloat(parseFloat(opacity).toFixed(1)) - 0.1;
        cnv.style.opacity = opacity;
        for (var i = 0; i < removedLines.length; i++) {
          for (var x = 0; x < blocks[0].length; x++) {
            var image = images[Math.floor(Math.random() * images.length)];
            cnv.ctx.drawImage(
              image,
              x * blockSize,
              (removedLines[i] - hiddenLines) * blockSize,
              blockSize,
              blockSize
            );
          }
        }
        if (opacity <= 0) {
          opacity = 0;
          clearInterval(animationTimer);
          callback();
        }
      }, 30);
    }
  }, 30);
};

ViewCanvas.prototype.clearOverlay = function () {
  var cnv = this.ui.layers.overlay;
  var ctx = cnv.ctx;
  ctx.clearRect(0, 0, cnv.width, cnv.height);
};

ViewCanvas.prototype.hideOverlay = function () {
  this.ui.layers.overlay.style.opacity = 0;
};

ViewCanvas.prototype.showOverlay = function (opacity) {
  this.ui.layers.overlay.style.opacity = opacity || 1;
};

ViewCanvas.prototype.updateProgress = function (totalScore, totalLines) {
  var cnv = this.ui.progress;
  cnv.ctx.clearRect(0, 0, cnv.width, cnv.height);
  var stats = [
    'Score: ' + totalScore,
    'Lines: ' + totalLines
  ];
  var initialSize = 20;
  var size = initialSize;
  for (var i = 0; i < stats.length; i++) {
    var params = this.getFitTextParams(cnv, stats[i], initialSize);
    if (params.size < size) {
      size = params.size;
    }
  }

  for (i = 0; i < stats.length; i++) {
    this.fitText(cnv, stats[i], size, (i + 1) * size);
  }
};
