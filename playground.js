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

  var game3 = new Game({
    rows: 20,
    cells: 6,
    view: new ViewCanvas({
      root: document.getElementById('game3')
    }),
    input: new InputKeyboard(),
    tetrominos: {
      small: {
        shape: [
          [
            [1]
          ]
        ],
        line: 1
      },
      big: {
        shape: [
          [
            [1, 1, 1],
            [1, 1, 1],
            [1, 1, 1]
          ]
        ],
        line: 0
      },
      fck: {
        shape: [
          [
            [0, 1, 0],
            [0, 1, 0],
            [1, 1, 1]
          ],
          [
            [1, 0, 0],
            [1, 1, 1],
            [1, 0, 0]
          ],
          [
            [1, 1, 1],
            [0, 1, 0],
            [0, 1, 0]
          ],
          [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 1]
          ]
        ],
        line: 0
      }
    }
  });
};
