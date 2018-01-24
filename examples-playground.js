'use strict';

/* eslint-disable no-unused-vars */

window.onload = function () {
  // simplest possible
  new Game({
    id: 'game0'
  });

  // custom rows and cells numbers
  new Game({
    id: 'game1',
    rows: 10,
    cells: 8
  });

  // custom initial grid
  new Game({
    id: 'game2',
    rows: 15,
    cells: 5,
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

  // custom tetrominos shapes
  new Game({
    id: 'game3',
    rows: 20,
    cells: 6,
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

  // custom tetrominos shapes
  new Game({
    id: 'game4',
    rows: 6,
    cells: 3,
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

  // custom assets and animation
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
  }, JSON.parse(JSON.stringify(tetrominos)));

  new Game({
    rows: 11,
    cells: 5,
    view: new ViewCanvas({
      root: document.getElementById('game5'),
      assets: assetsGames56,
      blockSize: 32,
      animationSpeed: 100,
      animationBlocks: animationBlocksGames56
    }),
    tetrominos: tetrominosGames56
  });

  // custom assets, animation and styling
  new Game({
    rows: 11,
    cells: 5,
    view: new ViewCanvas({
      root: document.getElementById('game6'),
      assets: assetsGames56,
      blockSize: 32,
      animationSpeed: 100,
      animationBlocks: animationBlocksGames56
    }),
    tetrominos: tetrominosGames56
  });

  // custom view layer using the PIXI lib
  new Game({
    rows: 10,
    cells: 8,
    view: new ViewPixi({
      root: document.getElementById('game7')
    })
  });

  // custom assets
  var assetsGame8 = {
    path: './assets/',
    files: {
      blocks: {
        dropped: 'O_1-2-3-4.png',
        custom: 'O_1-2-3-4.png'
      }
    }
  };

  var tetrominosGame8 = Object.keys(tetrominos).reduce(function (modified, tetromino) {
    modified[tetromino].tile = 'custom';
    return modified;
  }, JSON.parse(JSON.stringify(tetrominos)));

  new Game({
    rows: 12,
    cells: 8,
    view: new ViewPixi({
      root: document.getElementById('game8'),
      assets: assetsGame8,
      blockSize: 32
    }),
    tetrominos: tetrominosGame8
  });

  // custom messages
  new Game({
    id: 'game9',
    rows: 10,
    cells: 8,
    messages: {
      title: 'Tetris',
      startScreenPressToPlay: 'Wciśnij [space] aby zagrać',
      endScreenPressToPlay: 'Wciśnij [space] i spróbuj ponownie',
      loadingProgress: 'Wczytane obrazki: %d1/%d2',
      gameProgress: {
        level: 'Poziom: %d',
        lines: 'Linie: %d',
        score: 'Punkty: %d',
        speed: 'Prędkość: %d%',
        points: '+%d punktów',
        removedLinesInfo: {
          1: '1 linia',
          2: '2 linie',
          3: '3 linie',
          4: '4 linie'
        }
      }
    }
  });
};
