'use strict';

/* eslint-disable no-unused-vars */

window.onload = function () {
  var game1 = new Game({
    view: new ViewCanvas({
      root: document.getElementById('game1')
    }),
    input: new InputKeyboard()
  });
};