'use strict';

function InputTouch (params) {
  Input.call(this, params);
  this.eventListeners = {};
}

InputTouch.prototype = Object.create(Input.prototype);

InputTouch.prototype.init = function (game) {
  Input.prototype.init.call(this, game);

  this.hammertime = new Hammer(game.view.rootElement);
  this.hammertime.get('swipe').set({ direction: Hammer.DIRECTION_ALL });

  this.ready = true;
};

InputTouch.prototype.getEventListener = function (name) {
  if (!this.eventListeners[name]) {
    this.eventListeners[name] = this[name].bind(this);
  }
  return this.eventListeners[name];
};

InputTouch.prototype.addEventListener = function (eventName, listenerName) {
  var listener = this.getEventListener(listenerName);
  this.hammertime.on(eventName, listener);
  listener.enabled = true;
};

InputTouch.prototype.removeEventListener = function (eventName, listenerName) {
  var listener = this.getEventListener(listenerName);
  this.hammertime.off(eventName, listener);
  listener.enabled = false;
};

InputTouch.prototype.enableStart = function () {
  this.addEventListener('tap', 'start');
};

InputTouch.prototype.disableStart = function () {
  this.removeEventListener('tap', 'start');
};

InputTouch.prototype.enableMove = function () {
  this.addEventListener('swipe', 'moveRotate');
};

InputTouch.prototype.disableMove = function () {
  this.removeEventListener('swipe', 'moveRotate');
};

InputTouch.prototype.moveRotate = function (event) {
  event.preventDefault();
  switch (event.direction) {
    case 8: // UP
      this.rotate();
      break;
    case 16: // DOWN
      this.moveDown();
      break;
    case 2: // LEFT
      this.moveLeft();
      break;
    case 4: // RIGHT
      this.moveRight();
      break;
  }
};

InputTouch.prototype.start = function (event) {
  event.preventDefault();
  this.startGame();
};
