'use strict';

/* eslint-disable no-unused-vars */

window.onload = function () {
  var game1 = new Game({
    rows: 10,
    cells: 8,
    view: new ViewCanvas({
      root: document.getElementById('game1')
    }),
    input: new InputKeyboard()
  });

  var game2 = new Game({
    rows: 10,
    cells: 5,
    view: new ViewCanvas({
      root: document.getElementById('game2')
    }),
    input: new InputKeyboard()
  });
};
