'use strict';

function ViewCanvas (params) {
  View.call(this, params);
  this.animationTimer = null;
}

ViewCanvas.prototype = Object.create(View.prototype);

ViewCanvas.prototype.animationSpeed = 30;
ViewCanvas.prototype.animationBlocks = [
  'blue', 'cyan', 'green', 'orange', 'purple', 'red', 'yellow'
];

ViewCanvas.prototype.setContainerXY = function (container, x, y) {
  container.style.left = x + 'px';
  container.style.top = y + 'px';
};

ViewCanvas.prototype.createUI = function () {
  var ui = document.createElement('div');
  ui.id = 'ui-' + this.instance;
  ui.className = 'ui';
  this.rootElement.appendChild(ui);
  return ui;
};

ViewCanvas.prototype.appendUI = function (ui) {
  var rootElement = this.rootElement;
  while (rootElement.firstChild) {
    rootElement.removeChild(rootElement.firstChild);
  }
  rootElement.appendChild(ui);
};

ViewCanvas.prototype.resizeUI = function (width, height) {
  this.ui.style.width = width + 'px';
  this.ui.style.height = height + 'px';
};

ViewCanvas.prototype.initAnimation = function (params) {
  var animationSpeed = parseInt(params.animationSpeed, 10);
  if (animationSpeed) {
    this.animationSpeed = animationSpeed;
  }

  var animationBlocks = params.animationBlocks;
  if (typeof animationBlocks === 'object' && animationBlocks.length) {
    this.animationBlocks = animationBlocks;
  }
};

ViewCanvas.prototype.createContainer = function (width, height, name, color) {
  var container = document.createElement('div');
  if (name) {
    container.id = name + '-' + this.instance;
    container.className = name;
  }
  container.style.width = width + 'px';
  container.style.height = height + 'px';
  return container;
};

ViewCanvas.prototype.createCanvasContainer = function (width, height, name, color) {
  var canvas = document.createElement('canvas');
  canvas.className = name;
  canvas.width = width;
  canvas.height = height;
  canvas.ctx = canvas.getContext('2d');
  return canvas;
};

ViewCanvas.prototype.insertIntoContainer = function (container, item) {
  container.appendChild(item);
};

ViewCanvas.prototype.renderLoadingProgress = function (messages) {
  var container = this.ui.layers.overlay;
  this.clearContainer(container, true);

  var size = this.fitText(container, messages.title, 20, 20);
  this.fitText(container, messages.progress, 20, 20 + size);
  this.showOverlay(0.7);
};

ViewCanvas.prototype.showStartScreen = function (messages) {
  var container = this.ui.layers.overlay;
  this.clearContainer(container);

  var size = this.fitText(container, messages.title, 20, 20);
  this.fitText(container, messages.startScreenPressToPlay, 20, 20 + size);
  this.showOverlay(0.7);
};

ViewCanvas.prototype.showEndScreen = function (messages) {
  var container = this.ui.layers.overlay;
  this.clearContainer(container);

  var title = messages.title;
  var size = this.fitText(container, title, 20, 20);
  this.fitText(container, messages.endScreenPressToPlay, 20, 20 + size);
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

ViewCanvas.prototype.drawImage = function (container, image, x, y, width, height) {
  container.ctx.drawImage(image, x, y, width, height);
};

ViewCanvas.prototype.renderRemovedLines = function (removedLines, done) {
  this.clearOverlay();
  var cnv = this.ui.layers.overlay;

  var blocks = this.game.grid;
  var blockSize = this.blockSize;
  var hiddenLines = this.hiddenLines;

  var images = this.ui.images;
  var animationImages = this.animationBlocks.reduce(function (imgs, block) {
    imgs.push(images[block]);
    return imgs;
  }, []);

  var animationStep = 0;
  var animationTimer = this.animationTimer;
  animationTimer = setInterval(function () {
    cnv.style.opacity = 1 - (parseFloat(parseFloat(animationStep * 0.1).toFixed(1)));
    for (var i = 0; i < removedLines.length; i++) {
      for (var x = 0; x < blocks[0].length; x++) {
        var image = animationImages[animationStep - 1];
        if (image) {
          cnv.ctx.drawImage(
            image,
            x * blockSize,
            (removedLines[i] - hiddenLines) * blockSize,
            blockSize,
            blockSize
          );
        }
      }
    }
    if (animationStep === animationImages.length) {
      cnv.style.opacity = 0;
      clearInterval(animationTimer);
      done();
    }
    animationStep++;
  }, this.animationSpeed);
};

ViewCanvas.prototype.hideOverlay = function () {
  this.ui.layers.overlay.style.opacity = 0;
};

ViewCanvas.prototype.showOverlay = function (opacity) {
  this.ui.layers.overlay.style.opacity = opacity || 1;
};

ViewCanvas.prototype.clearContainer = function (canvas) {
  canvas.ctx.clearRect(0, 0, canvas.width, canvas.height);
};

ViewCanvas.prototype.updateProgress = function (info) {
  var container = this.ui.progress;
  this.clearContainer(container);

  var initialSize = this.blockSize - 2;
  var size = initialSize;
  for (var i = 0; i < info.length; i++) {
    var params = this.getFitTextParams(container, info[i], initialSize);
    if (params.size < size) {
      size = params.size;
    }
  }

  for (i = 0; i < info.length; i++) {
    this.fitText(container, info[i], size, (i + 1) * size);
  }
};
