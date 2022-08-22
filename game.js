import { init, makeMove, gameStatus } from './engine.js';
import { positionFromIndex } from './helpers.js';

const timeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const updateStatus = (state) => {
  state.status = gameStatus(state.board);
  if (state.board.lastPid) {
    const lp = state.board.pieces[state.board.lastPid];
    state.turn = lp.type[0] === 'w' ? 'b' : 'w';
  } else {
    state.turn = 'w';
  }
  const statusElement = document.querySelector('.status');
  if (state.status === 'wcm') {
    statusElement.innerHTML = 'White is checkmate!';
  } else if (state.status === 'wc') {
    statusElement.innerHTML = 'White is check!';
  } else if (state.status === 'bcm') {
    statusElement.innerHTML = 'Black is checkmate!';
  } else if (state.status === 'bc') {
    statusElement.innerHTML = 'Black is check!';
  } else if (state.status === 'sm') {
    statusElement.innerHTML = 'Stalemate!';
  } else if (state.status === 'd') {
    statusElement.innerHTML = 'Draw!';
  } else {
    statusElement.innerHTML = `${state.turn === 'w' ? 'White\'s' : 'Black\'s'} turn`
  }
}

const styleForPiece = (piece) => ({
  ...positionFromIndex(piece.index),
  display: piece.dead ? 'none' : 'block',
  backgroundImage: `url(img/${piece.type}.png)`
});

const renderBoard = (state) => {
  for (let i = 0; i < state.board.pieces.length; i++) {
    const piece = state.board.pieces[i];
    const el = state.ui.pieces[i];
    Object.assign(el.style, styleForPiece(piece));
  }
};

const generateBoard = (state) => {
  return state.board.pieces.map((piece) => {
    const el = document.createElement('div');
    el.className = `piece piece-${piece.type[0]}`;
    state.ui.board.appendChild(el);
    Object.assign(el.style, styleForPiece(piece));
    return el;
  })
}

export default async (white, black, wait = 200) => {
  document.documentElement.style.setProperty('--animation-speed', `${Math.max(Math.min(wait, 200), 40) / 1000}s`);

  const gameState = {
    ui: {
      board: document.querySelector('.board'),
      pieces: [],
    },
    turn: 'w',
    status: null,
    board: init()
  };
  gameState.ui.pieces = generateBoard(gameState);

  await timeout(100);

  let ended = false
  let turns = 0;

  while (!ended) {
    turns++;
    const player = gameState.turn === 'w' ? white : black;
    const move = await player.makeMove(gameState);

    gameState.board = await makeMove(gameState.board, move.pid, move.toIndex, (board) => {
      const gs = { ...gameState, board };
      renderBoard(gs);
      return player.promote(move.pid, gs);
    })

    renderBoard(gameState);
    updateStatus(gameState);
    ended = ['wcm', 'bcm', 'sm', 'd'].includes(gameState.status);
    await timeout(wait);
  }
  console.log('Game ended');
}
