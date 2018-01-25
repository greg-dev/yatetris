'use strict';

function View (params) {
  this.instance = ++View.prototype.instance;
  this.rows = 0;
  this.cells = 0;
  this.blockSize = parseInt(params.blockSize, 10) || 16;
  this.params = params;
  this.ready = false;
}

View.prototype.instance = 0;

View.prototype.init = function (game, callback) {
  this.assets = JSON.parse(JSON.stringify(this.params.assets || assets));
  this.game = game;
  this.rows = game.grid.length - game.hiddenLines;
  this.cells = game.grid[0].length;
  this.hiddenLines = game.hiddenLines;

  var params = this.params;

  this.initAnimation(params);

  var view = this.game.view;
  var blockSize = view.blockSize;

  // create and append ui
  this.rootElement = params.root;
  this.ui = this.createUI();
  this.appendUI(this.ui);
  var ui = this.ui;

  // create board for falling tetromino and dropped blocks
  var boardWidth = view.cells * blockSize;
  var boardHeight = view.rows * blockSize;
  var board = this.createContainer(boardWidth, boardHeight, 'board');
  this.setContainerXY(board, blockSize, blockSize);
  this.insertIntoContainer(ui, board);
  ui.board = board;

  // create separate containers:
  // - for dropped blocks
  // - for falling tetromino
  // - for text informations and animations
  var layers = ['dropped', 'falling', 'overlay'];
  ui.layers = layers.reduce(function (layers, layer) {
    var color = layer === 'falling' ? undefined : 0xffffff;
    layers[layer] = view.createCanvasContainer(boardWidth, boardHeight, layer, color);
    view.insertIntoContainer(ui.board, layers[layer]);
    return layers;
  }, {});

  // create container for next tetromino preview
  var tetrominoSize = this.getMaxTetrominoSize();
  var previewSize = (tetrominoSize + 1) * blockSize;
  var preview = this.createCanvasContainer(previewSize, previewSize, 'preview', 0xffffff);
  this.setContainerXY(preview, boardWidth + 2 * blockSize, blockSize);
  this.insertIntoContainer(ui, preview);
  ui.preview = preview;

  // create canvas container for game progress
  var progress = this.createCanvasContainer(previewSize, previewSize + blockSize, 'progress');
  this.setContainerXY(progress, boardWidth + 2 * blockSize, preview.height + 1.5 * blockSize);
  this.insertIntoContainer(ui, progress);
  ui.progress = progress;

  // update ui
  this.resizeUI(
    (this.cells + 2 + tetrominoSize + 2) * blockSize,
    (this.rows + 2) * blockSize
  );

  // preload images
  ui.images = {};
  this.loadImages(function onAllImagesLoaded (view) {
    view.ready = true;
    callback();
  });
};

View.prototype.getMaxTetrominoSize = function () {
  var tetrominos = this.game.tetrominos;
  return Object.keys(tetrominos)
    .map(function (key) {
      return tetrominos[key];
    })
    .reduce(function (max, tetromino) {
      var curr = tetromino.shape[0][0].length;
      return curr > max ? curr : max;
    }, 0);
};

View.prototype.loadImages = function (callback) {
  var game = this.game;
  var files = this.assets.files.blocks;
  var imagesToLoad = Object.keys(files).length;
  for (var tile in files) {
    var filename = files[tile];
    var image = this.ui.images[tile] = new Image();
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
          var messages = game.messages;
          messages.progress = game.messages.loadingProgress
            .replace('%d1', count)
            .replace('%d2', imagesToLoad);
          view.renderLoadingProgress(messages);
          if (count >= imagesToLoad) {
            callback(view);
          }
        };
      }(this.view, loadedImages.length, callback)), loadedImages.length * 100);
    };

    image.src = (this.assets.path || '') + filename;
  }
};

View.prototype.clearOverlay = function () {
  var cnv = this.ui.layers.overlay;
  this.clearContainer(cnv);
};

View.prototype.renderGrid = function () {
  var container = this.ui.layers.dropped;
  this.clearContainer(container, true);

  var image = this.ui.images.dropped;
  var blocks = this.game.grid;
  for (var y = 0; y < blocks.length; y++) {
    for (var x = 0; x < blocks[0].length; x++) {
      if (blocks[y][x]) {
        this.drawImage(
          container,
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

View.prototype.renderTetromino = function () {
  var container = this.ui.layers.falling;
  this.clearContainer(container);

  var tetromino = this.game.tetromino;
  var images = this.ui.images;
  var image = (tetromino.tile && images[tetromino.tile]) || images.blue;
  var blocks = tetromino.blocks;
  var blockSize = this.blockSize;
  for (var y = 0; y < blocks.length; y++) {
    for (var x = 0; x < blocks[0].length; x++) {
      if (blocks[y][x]) {
        if (tetromino.y + y >= this.hiddenLines) {
          this.drawImage(
            container,
            image,
            (tetromino.x + x) * blockSize,
            (tetromino.y + y - this.hiddenLines) * blockSize,
            blockSize,
            blockSize
          );
        }
      }
    }
  }
};

View.prototype.renderNextTetromino = function () {
  var container = this.ui.preview;
  this.clearContainer(container, true);

  if (!this.game.queue.length) return;

  var tetromino = this.game.queue[0];
  var images = this.ui.images;
  var image = (tetromino.tile && images[tetromino.tile]) || images.blue;
  var blocks = tetromino.blocks.filter(function (row) {
    return row.reduce(function (sum, cell) {
      return sum + cell;
    }, 0);
  });
  var blockSize = this.blockSize;
  var dx = (container.width - blocks[0].length * blockSize) / 2;
  var dy = ((container.height - blocks.length * blockSize) / 2) + tetromino.spawnLine;
  for (var y = 0; y < blocks.length; y++) {
    for (var x = 0; x < blocks[0].length; x++) {
      if (blocks[y][x]) {
        this.drawImage(
          container,
          image,
          x * blockSize + dx,
          y * blockSize + dy,
          blockSize,
          blockSize
        );
      }
    }
  }
};

View.prototype.showGameScreen = function () {
  this.hideOverlay();
};

View.prototype.removeTetromino = function () {
  var container = this.ui.layers.falling;
  this.clearContainer(container);
};

View.prototype.missingMethodError = function (method) {
  throw new Error('Custom view ' + method + '() implementation needed');
};
View.prototype.initAnimation = function () {
  this.missingMethodError('initAnimation');
};
View.prototype.createUI = function () {
  this.missingMethodError('createUI');
};
View.prototype.appendUI = function () {
  this.missingMethodError('appendUI');
};
View.prototype.resizeUI = function () {
  this.missingMethodError('resizeUI');
};
View.prototype.createContainer = function () {
  this.missingMethodError('createContainer');
};
View.prototype.createCanvasContainer = function () {
  this.missingMethodError('createCanvasContainer');
};
View.prototype.createBackground = function () {
  this.missingMethodError('createBackground');
};
View.prototype.insertIntoContainer = function () {
  this.missingMethodError('insertIntoContainer');
};
View.prototype.setContainerXY = function () {
  this.missingMethodError('setContainerXY');
};
View.prototype.clearContainer = function () {
  this.missingMethodError('clearContainer');
};
View.prototype.drawImage = function () {
  this.missingMethodError('drawImage');
};
View.prototype.renderRemovedLines = function () {
  this.missingMethodError('renderRemovedLines');
};
View.prototype.showOverlay = function () {
  this.missingMethodError('showOverlay');
};
View.prototype.hideOverlay = function () {
  this.missingMethodError('hideOverlay');
};
View.prototype.showStartScreen = function () {
  this.missingMethodError('showStartScreen');
};
View.prototype.showEndScreen = function () {
  this.missingMethodError('showEndScreen');
};
View.prototype.updateProgress = function (info) {
  this.missingMethodError('updateProgress');
};
View.prototype.renderLoadingProgress = function () {
  this.missingMethodError('renderLoadingProgress');
};
