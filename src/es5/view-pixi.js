'use strict';

function ViewPixi (params) {
  View.call(this, params);
  this.ready = false;
  this.instance = ++ViewPixi.prototype.instance;
  this.rows = 0;
  this.cells = 0;
  this.blockSize = parseInt(params.blockSize, 10) || 16;
  this.animationTimer = null;
}

ViewPixi.prototype = Object.create(View.prototype);

ViewPixi.prototype.instance = 0;

ViewPixi.prototype.init = function (game, callback) {
  View.prototype.init.call(this, game);

  var params = this.params;

  var view = this.game.view;
  var blockSize = view.blockSize;

  // clear root
  while (params.root.firstChild) {
    params.root.removeChild(params.root.firstChild);
  }

  // create ui
  var app = new PIXI.Application({ backgroundColor: 0xe8edf4 });
  params.root.appendChild(app.view);
  this.ui = app.stage;

  // create board for falling tetromino and dropped blocks
  var boardWidth = view.cells * blockSize;
  var boardHeight = view.rows * blockSize;
  var board = createContainer(boardWidth, boardHeight);
  board.x = blockSize;
  board.y = blockSize;
  this.ui.addChild(board);
  this.ui.board = board;

  // create separate containers:
  // dropped layer for dropped blocks
  // falling layer for falling tetromino
  // overlay layer for text informations and animations
  var layers = ['dropped', 'falling', 'overlay'];

  this.ui.layers = layers.reduce(function (layers, layer) {
    layers[layer] = createContainer(boardWidth, boardHeight);
    view.ui.board.addChild(layers[layer]);
    return layers;
  }, {});
  view.ui.layers.dropped.addChild(createBackground(boardWidth, boardHeight, 0xffffff));
  view.ui.layers.overlay.addChild(createBackground(boardWidth, boardHeight, 0xffffff));

  // create container for next tetromino preview
  var tetrominoSize = this.getMaxTetrominoSize();
  var previewWidth = (tetrominoSize + 1) * blockSize;
  var preview = createContainer(previewWidth, previewWidth, 0xffffff);
  this.ui.addChild(preview);
  this.ui.preview = preview;
  preview.x = boardWidth + 2 * blockSize;
  preview.y = blockSize;

  // create canvas for game progress
  var progress = createContainer(previewWidth, previewWidth + blockSize);
  progress.x = boardWidth + 2 * blockSize;
  progress.y = preview.height + 1.5 * blockSize;
  this.ui.addChild(progress);
  this.ui.progress = progress;

  // update ui
  var uiWidth = (this.cells + 2 + tetrominoSize + 2) * blockSize;
  var uiHeight = (this.rows + 2) * blockSize;
  app.renderer.resize(uiWidth, uiHeight);

  function createBackground (width, height, color) {
    var graphics = new PIXI.Graphics();
    graphics.beginFill(color, 1);
    graphics.drawRect(0, 0, width, height);
    graphics.endFill();
    return graphics;
  }

  function createContainer (width, height, color) {
    var container = new PIXI.Container();
    container.width = width;
    container.height = height;
    if (color) {
      container.addChild(createBackground(width, height, color));
    }
    return container;
  }

  this.ui.images = {};
  this.loadImages(function onAllImagesLoaded (view) {
    view.ready = true;
    callback();
  });
};

ViewPixi.prototype.getMaxTetrominoSize = function () {
  return Object.values(this.game.tetrominos).reduce(function (max, tetromino) {
    var curr = tetromino.shape[0][0].length;
    return curr > max ? curr : max;
  }, 0);
};

ViewPixi.prototype.loadImages = function (callback) {
  var files = this.assets.files.blocks;
  var imagesToLoad = Object.keys(files).length;
  for (var tile in files) {
    var filename = files[tile];
    var image = this.ui.images[tile] = new Image(); // eslint-disable-line no-undef
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

    image.src = (this.assets.path || '') + filename;
  }
};

ViewPixi.prototype.renderLoadingProgress = function (text) {
  var container = this.ui.layers.overlay;
  this.clearContainer(container, true);

  this.renderRichText(container, text);
};

ViewPixi.prototype.showStartScreen = function () {
  var container = this.ui.layers.overlay;
  this.clearContainer(container, true);

  this.renderRichText(container, 'Press [space] to play');
  this.showOverlay(0.7);
};

ViewPixi.prototype.showEndScreen = function () {
  var container = this.ui.layers.overlay;
  this.clearContainer(container, true);

  this.renderRichText(container, 'Press [space] to play again');
  this.showOverlay(0.7);
};

ViewPixi.prototype.renderBasicText = function (container, text, x, y, color) {
  var style = new PIXI.TextStyle({
    fill: color || '#000000',
    fontSize: Math.floor(this.blockSize / 2)
  });
  var basicText = new PIXI.Text(text, style);
  basicText.x = x;
  basicText.y = y;
  container.addChild(basicText);
};

ViewPixi.prototype.renderRichText = function (container, text) {
  var style = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: this.blockSize,
    fontWeight: 'bold',
    fill: ['#ffffff', '#00ff99'],
    stroke: '#4a1850',
    strokeThickness: 5,
    dropShadow: true,
    dropShadowColor: '#000000',
    dropShadowBlur: 4,
    dropShadowAngle: Math.PI / 6,
    dropShadowDistance: 6,
    wordWrap: true,
    wordWrapWidth: this.ui.board.width
  });

  var richText = new PIXI.Text(text, style);
  richText.x = 0;
  richText.y = 0;

  container.addChild(richText);
};

ViewPixi.prototype.renderNextTetromino = function () {
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
        var tile = PIXI.Sprite.fromImage(image.src);
        tile.x = x * blockSize + dx;
        tile.y = y * blockSize + dy;
        container.addChild(tile);
      }
    }
  }
};

ViewPixi.prototype.renderTetromino = function () {
  var container = this.ui.layers.falling;
  this.clearContainer(container);

  var tetromino = this.game.tetromino;
  var images = this.ui.images;
  console.log(tetromino.tile, images[tetromino.tile]);
  var image = (tetromino.tile && images[tetromino.tile]) || images.blue;
  var blocks = tetromino.blocks;
  var blockSize = this.blockSize;
  for (var y = 0; y < blocks.length; y++) {
    for (var x = 0; x < blocks[0].length; x++) {
      if (blocks[y][x]) {
        var tile = PIXI.Sprite.fromImage(image.src);
        tile.x = (tetromino.x + x) * blockSize;
        tile.y = (tetromino.y + y - this.hiddenLines) * blockSize;
        container.addChild(tile);
      }
    }
  }
};

ViewPixi.prototype.removeTetromino = function () {
  var container = this.ui.layers.falling;
  this.clearContainer(container);
};

ViewPixi.prototype.showGameScreen = function () {
  this.hideOverlay();
};

ViewPixi.prototype.renderGrid = function () {
  var container = this.ui.layers.dropped;
  this.clearContainer(container, true);

  var blocks = this.game.grid;
  for (var y = 0; y < blocks.length; y++) {
    for (var x = 0; x < blocks[0].length; x++) {
      if (blocks[y][x]) {
        var image = PIXI.Sprite.fromImage(this.ui.images.dropped.src);
        image.x = x * this.blockSize;
        image.y = (y - this.hiddenLines) * this.blockSize;
        container.addChild(image);
      }
    }
  }
};

ViewPixi.prototype.renderRemovedLines = function (removedLines, callback) {
  var container = this.ui.layers.dropped;
  this.clearContainer(container, true);
  callback();
};

ViewPixi.prototype.clearOverlay = function () {
  var container = this.ui.layers.overlay;
  this.clearContainer(container, true);
};

ViewPixi.prototype.hideOverlay = function () {
  this.ui.layers.overlay.alpha = 0;
};

ViewPixi.prototype.showOverlay = function (opacity) {
  this.ui.layers.overlay.alpha = opacity || 1;
};

ViewPixi.prototype.clearContainer = function (container, keepBackground) {
  container.children.splice(keepBackground ? 1 : 0);
};

ViewPixi.prototype.updateProgress = function (info) {
  var container = this.ui.progress;
  this.clearContainer(container);

  for (var i = 0; i < info.length; i++) {
    this.renderBasicText(container, info[i], 0, i * 0.5 * this.blockSize);
  }
};
