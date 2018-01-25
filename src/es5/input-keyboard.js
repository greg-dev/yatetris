'use strict';

function InputKeyboard (params) {
  Input.call(this, params);
  this.eventListeners = {};
}

InputKeyboard.prototype = Object.create(Input.prototype);

InputKeyboard.prototype.init = function (game) {
  Input.prototype.init.call(this, game);
  this.ready = true;
};

InputKeyboard.prototype.getEventListener = function (name) {
  if (!this.eventListeners[name]) {
    this.eventListeners[name] = this[name].bind(this);
  }
  return this.eventListeners[name];
};

InputKeyboard.prototype.addEventListener = function (eventName, listenerName) {
  var listener = this.getEventListener(listenerName);
  document.addEventListener(eventName, listener);
  listener.enabled = true;
};

InputKeyboard.prototype.removeEventListener = function (eventName, listenerName) {
  var listener = this.getEventListener(listenerName);
  document.removeEventListener(eventName, listener);
  listener.enabled = false;
};

InputKeyboard.prototype.enableStart = function () {
  this.addEventListener('keydown', 'pressStart');
};

InputKeyboard.prototype.disableStart = function () {
  this.removeEventListener('keydown', 'pressStart');
};

InputKeyboard.prototype.enableMove = function () {
  this.addEventListener('keydown', 'pressMoveRotate');
};

InputKeyboard.prototype.disableMove = function () {
  this.removeEventListener('keydown', 'pressMoveRotate');
};

InputKeyboard.prototype.pressMoveRotate = function (event) {
  event.preventDefault();
  switch (event.keyCode) {
    case 38: // UP
      this.rotate();
      break;
    case 40: // DOWN
      this.moveDown();
      break;
    case 37: // LEFT
      this.moveLeft();
      break;
    case 39: // RIGHT
      this.moveRight();
      break;
  }
};

InputKeyboard.prototype.pressStart = function (event) {
  event.preventDefault();
  if (event.keyCode === 32) {
    this.startGame();
  }
};
