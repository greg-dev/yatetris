'use strict';

function ViewPixi (params) {
  View.call(this, params);
  this.animationTimer = null;
}

ViewPixi.prototype = Object.create(View.prototype);

ViewPixi.prototype.setContainerXY = function (container, x, y) {
  container.x = x;
  container.y = y;
};

ViewPixi.prototype.createUI = function (rootElement) {
  var app = new PIXI.Application({ backgroundColor: 0xe8edf4 });
  app.stage.app = app;
  return app.stage;
};

ViewPixi.prototype.appendUI = function (ui, rootElement) {
  while (rootElement.firstChild) {
    rootElement.removeChild(rootElement.firstChild);
  }
  rootElement.appendChild(ui.app.view);
};

ViewPixi.prototype.resizeUI = function (width, height) {
  this.ui.app.renderer.resize(width, height);
};

ViewPixi.prototype.initAnimation = function (params) {
  // no animation, so nothing to init
};

ViewPixi.prototype.createBackground = function (width, height, color) {
  var graphics = new PIXI.Graphics();
  graphics.beginFill(color, 1);
  graphics.drawRect(0, 0, width, height);
  graphics.endFill();
  return graphics;
};

ViewPixi.prototype.createContainer = function (width, height, name, color) {
  var container = new PIXI.Container();
  container.width = width;
  container.height = height;
  if (color) {
    container.addChild(this.createBackground(width, height, color));
  }
  return container;
};

ViewPixi.prototype.createCanvasContainer = function (width, height, name, color) {
  return this.createContainer(width, height, name, color);
};

ViewPixi.prototype.insertIntoContainer = function (container, item) {
  container.addChild(item);
};

ViewPixi.prototype.renderLoadingProgress = function (text) {
  var container = this.ui.layers.overlay;
  this.clearContainer(container, true);

  this.renderRichText(container, text);
};

ViewPixi.prototype.showStartScreen = function (messages) {
  var container = this.ui.layers.overlay;
  this.clearContainer(container, true);

  this.renderRichText(container, messages.startScreenPressToPlay);
  this.showOverlay(0.7);
};

ViewPixi.prototype.showEndScreen = function (messages) {
  var container = this.ui.layers.overlay;
  this.clearContainer(container, true);

  this.renderRichText(container, messages.endScreenPressToPlay);
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

ViewPixi.prototype.drawImage = function (container, image, x, y, width, height) {
  var img = PIXI.Sprite.fromImage(image.src);
  img.x = x;
  img.y = y;
  container.addChild(img);
};

ViewPixi.prototype.renderRemovedLines = function (removedLines, done) {
  this.clearOverlay();
  done();
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
