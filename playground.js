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
    rows: 15,
    cells: 5,
    view: new ViewCanvas({
      root: document.getElementById('game2')
    }),
    input: new InputKeyboard(),
    grid: [
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 1, 0, 1, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 1, 0, 0],
      [1, 0, 0, 0, 1],
      [0, 1, 1, 1, 0],
      [0, 0, 0, 0, 0]
    ]
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

  var game4 = new Game({
    rows: 6,
    cells: 3,
    view: new ViewCanvas({
      root: document.getElementById('game4')
    }),
    input: new InputKeyboard(),
    tetrominos: {
      i: {
        tile: 'red',
        shape: [
          [
            [0, 0],
            [1, 1]
          ],
          [
            [1, 0],
            [1, 0]
          ],
          [
            [1, 1],
            [0, 0]
          ],
          [
            [0, 1],
            [0, 1]
          ]
        ],
        line: 0
      },
      j: {
        tile: 'red',
        shape: [
          [
            [0, 1],
            [1, 1]
          ],
          [
            [1, 0],
            [1, 1]
          ],
          [
            [1, 1],
            [1, 0]
          ],
          [
            [1, 1],
            [0, 1]
          ]
        ],
        line: 0
      },
      l: {
        tile: 'red',
        shape: [
          [
            [1, 0],
            [1, 1]
          ],
          [
            [1, 1],
            [1, 0]
          ],
          [
            [1, 1],
            [0, 1]
          ],
          [
            [0, 1],
            [1, 1]
          ]
        ],
        line: 0
      }
    }
  });

  var assetsGames56 = {
    path: 'https://assets-cdn.github.com/images/icons/emoji/',
    files: {
      blocks: {
        dropped: 'hurtrealbad.png',
        godmode: 'godmode.png',
        suspect: 'suspect.png',
        hurtrealbad: 'hurtrealbad.png',
        rage1: 'rage1.png',
        rage2: 'rage2.png',
        rage3: 'rage3.png',
        rage4: 'rage4.png',
        goberserk: 'goberserk.png',
        finnadie: 'finnadie.png'
      }
    }
  };

  var animationBlocksGames56 = [
    'rage1',
    'rage2',
    'rage3',
    'rage4',
    'goberserk',
    'finnadie',
    'finnadie'
  ];

  var tetrominosGames56 = Object.keys(tetrominos).reduce(function (modified, tetromino) {
    modified[tetromino].tile = 'suspect';
    return modified;
  }, tetrominos);

  var game5 = new Game({
    rows: 11,
    cells: 5,
    view: new ViewCanvas({
      root: document.getElementById('game5'),
      assets: assetsGames56,
      blockSize: 32,
      animationSpeed: 100,
      animationBlocks: animationBlocksGames56
    }),
    input: new InputKeyboard(),
    tetrominos: tetrominosGames56
  });

  var game6 = new Game({
    rows: 11,
    cells: 5,
    view: new ViewCanvas({
      root: document.getElementById('game6'),
      assets: assetsGames56,
      blockSize: 32,
      animationSpeed: 100,
      animationBlocks: animationBlocksGames56
    }),
    input: new InputKeyboard(),
    tetrominos: tetrominosGames56
  });

  var game7 = new Game({
    rows: 10,
    cells: 8,
    view: new ViewPixi({
      root: document.getElementById('game7')
    }),
    input: new InputKeyboard()
  });

  var game8 = new Game({
    rows: 12,
    cells: 8,
    view: new ViewPixi({
      root: document.getElementById('game8')
    }),
    input: new InputKeyboard()
  });

  var assetsGame9 = {
    path: './assets/',
    files: {
      blocks: {
        dropped: 'O_1-2-3-4.png',
        custom: 'O_1-2-3-4.png'
      }
    }
  };

  var tetrominosGame9 = Object.keys(tetrominos).reduce(function (modified, tetromino) {
    modified[tetromino].tile = 'custom';
    return modified;
  }, JSON.parse(JSON.stringify(tetrominos)));

  var game9 = new Game({
    rows: 12,
    cells: 8,
    view: new ViewPixi({
      root: document.getElementById('game9'),
      assets: assetsGame9,
      blockSize: 32
    }),
    input: new InputKeyboard(),
    tetrominos: tetrominosGame9
  });
};
