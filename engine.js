const indexForCoords = (x, y) => {
  return y * 8 + x;
}

const relativeIndex = (index, dx, dy) => {
  const coords = coordsForIndex(index);
  const x = coords.x + dx;
  const y = coords.y + dy;
  if ((x < 0 || x > 7) || (y < 0 || y > 7)) {
    return null;
  }
  return indexForCoords(x, y);
}

const movesForPiece = (state, piece) => {
  const { pieces } = state;
  const pArray = [...new Array(64)].map(() => null);
  for (const p of pieces) {
    if (!p.dead) {
      pArray[p.index] = p;
    }
  }
  const color = piece.type[0];
  const type = piece.type[1];
  const moves = [];

  const r = (x, y) => relativeIndex(piece.index, x, y);

  const add = (i, moves, mode) => {
    if (pArray[i]) {
      if (pArray[i].type[0] !== color && (mode === 'both' || mode === 'take')) {
        moves.push(i);
      }
      return false;
    } else if (mode === 'both' || mode === 'move') {
      moves.push(i);
      return true;
    }
  }

  const directional = (dx = 1, dy = 1, limit = 7, mode = 'both') => {
    const moves = [];
    for (let i = 1; i <= limit; i++) {
      const ix = r(i * dx, i * dy);
      if (ix === null || !add(ix, moves, mode)) {
        break;
      }
    }
    return moves;
  }

  if (type === 'p') { // pawn
    const limit = piece.moveCount === 0 ? 2 : 1;
    const dir = color === 'w' ? -1 : 1;
    moves.push(...directional(0, dir, limit, 'move'));
    moves.push(...directional(1, dir, 1, 'take'));
    moves.push(...directional(-1, dir, 1, 'take'));

    // en passant
    const {y} = coordsForIndex(piece.index);
    const dy = color === 'w' ? -1 : 1;
    const row = color === 'w' ? 3 : 4;
    if (y === row) {
      const p1 = pArray[r(1, 0)];
      const p2 = pArray[r(-1, 0)];
      const valid = (p) => p && p.type[1] === 'p' && p.type[0] !== color && p.moveCount === 1 && state.lastPid === getPid(state, p);
      if (valid(p1)) {
        moves.push(...directional(1, dy, 1, 'move'));
      }
      if (valid(p2)) {
        moves.push(...directional(-1, dy, 1, 'move'));
      }
    }
  } else if (type === 'r') { // rook
    moves.push(...directional(1, 0));
    moves.push(...directional(-1, 0));
    moves.push(...directional(0, 1));
    moves.push(...directional(0, -1));
  } else if (type === 'b') { // bishop
    moves.push(...directional(-1, -1));
    moves.push(...directional(1, 1));
    moves.push(...directional(1, -1));
    moves.push(...directional(-1, 1));
  } else if (type === 'q') { // queen
    moves.push(...directional(1, 0));
    moves.push(...directional(-1, 0));
    moves.push(...directional(0, 1));
    moves.push(...directional(0, -1));
    moves.push(...directional(-1, -1));
    moves.push(...directional(1, 1));
    moves.push(...directional(1, -1));
    moves.push(...directional(-1, 1));
  } else if (type === 'n') { // knight
    moves.push(...directional(-1, -2, 1));
    moves.push(...directional(1, -2, 1));
    moves.push(...directional(2, -1, 1));
    moves.push(...directional(2, 1, 1));
    moves.push(...directional(-1, 2, 1));
    moves.push(...directional(1, 2, 1));
    moves.push(...directional(-2, -1, 1));
    moves.push(...directional(-2, 1, 1));
  } else if (type === 'k') { // king
    moves.push(...directional(1, 0, 1));
    moves.push(...directional(-1, 0, 1));
    moves.push(...directional(0, 1, 1));
    moves.push(...directional(0, -1, 1));
    moves.push(...directional(-1, -1, 1));
    moves.push(...directional(1, 1, 1));
    moves.push(...directional(1, -1, 1));
    moves.push(...directional(-1, 1, 1));
    if (piece.moveCount === 0) { // castling
      const clearRight = !pArray[r(1, 0)] && !pArray[r(2, 0)];
      if (clearRight && pArray[r(3, 0)] && pArray[r(3, 0)].moveCount === 0) {
        moves.push(...directional(2, 0, 2));
      }
      const clearLeft = !pArray[r(-1, 0)] && !pArray[r(-2, 0)] && !pArray[r(-3, 0)];
      if (clearLeft && pArray[r(-4, 0)] && pArray[r(-4, 0)].moveCount === 0) {
        moves.push(...directional(-2, 0, 2));
      }
    }
  }
  return moves;
};

const getPid = (state, piece) => state.pieces.indexOf(piece);

export const validMovesForColor = (state, color) => {
  const moves = [];
  const pieces = alivePieces(state).filter((p) => p.type[0] === color);
  for (const piece of pieces) {
    const pid = getPid(state, piece);
    moves.push({pid, piece, moves: validMoves(state, pid)});
  }
  return moves;
}

const initialState = () => ({
  lastPid: null,
  pieces: [
    {type: 'br', index: 0, dead: false, moveCount: 0},
    {type: 'bn', index: 1, dead: false, moveCount: 0},
    {type: 'bb', index: 2, dead: false, moveCount: 0},
    {type: 'bq', index: 3, dead: false, moveCount: 0},
    {type: 'bk', index: 4, dead: false, moveCount: 0},
    {type: 'bb', index: 5, dead: false, moveCount: 0},
    {type: 'bn', index: 6, dead: false, moveCount: 0},
    {type: 'br', index: 7, dead: false, moveCount: 0},
    {type: 'bp', index: 8, dead: false, moveCount: 0},
    {type: 'bp', index: 9, dead: false, moveCount: 0},
    {type: 'bp', index: 10, dead: false, moveCount: 0},
    {type: 'bp', index: 11, dead: false, moveCount: 0},
    {type: 'bp', index: 12, dead: false, moveCount: 0},
    {type: 'bp', index: 13, dead: false, moveCount: 0},
    {type: 'bp', index: 14, dead: false, moveCount: 0},
    {type: 'bp', index: 15, dead: false, moveCount: 0},
    {type: 'wr', index: 56, dead: false, moveCount: 0},
    {type: 'wn', index: 57, dead: false, moveCount: 0},
    {type: 'wb', index: 58, dead: false, moveCount: 0},
    {type: 'wq', index: 59, dead: false, moveCount: 0},
    {type: 'wk', index: 60, dead: false, moveCount: 0},
    {type: 'wb', index: 61, dead: false, moveCount: 0},
    {type: 'wn', index: 62, dead: false, moveCount: 0},
    {type: 'wr', index: 63, dead: false, moveCount: 0},
    {type: 'wp', index: 48, dead: false, moveCount: 0},
    {type: 'wp', index: 49, dead: false, moveCount: 0},
    {type: 'wp', index: 50, dead: false, moveCount: 0},
    {type: 'wp', index: 51, dead: false, moveCount: 0},
    {type: 'wp', index: 52, dead: false, moveCount: 0},
    {type: 'wp', index: 53, dead: false, moveCount: 0},
    {type: 'wp', index: 54, dead: false, moveCount: 0},
    {type: 'wp', index: 55, dead: false, moveCount: 0}
  ]
});

const cloneState = (state) => {
  const pieces = state.pieces.map((p) => ({...p}));
  return { lastPid: state.lastPid, pieces };
}

// ----

export const alivePieces = (state) => state.pieces.filter((p) => !p.dead);

export const coordsForIndex = (index) => {
  const y = Math.floor(index / 8);
  const x = Math.floor(index % 8);
  if ((x < 0 || x > 7) || (y < 0 || y > 7)) {
    return null;
  }
  return {x, y}
}

export const validMoves = (state, pid) => {
  const piece = state.pieces[pid];
  const moves = movesForPiece(state, piece);
  const invalid = [];
  for (const move of moves) {
    const tmpState = makeMove(state, pid, move);
    const king = alivePieces(tmpState).find((pp) => pp.type === `${piece.type[0]}k`);
    const opponentPieces = alivePieces(tmpState).filter((p) => p.type[0] !== piece.type[0]);
    const opponentMoves = opponentPieces.map((op) => movesForPiece(tmpState, op)).flat();
    if (opponentMoves.includes(king.index)) {
      invalid.push(move);
    }
  }
  return moves.filter((m) => !invalid.includes(m));
};

export const makeMove = (state, pid, toIndex, callback) => {
  const newState = cloneState(state);
  const pieces = alivePieces(newState);
  const piece = newState.pieces[pid];
  const target = pieces.find((p) => p.index === toIndex);
  if (target) { // kill
    target.dead = true;
  } else if (piece.type[1] === 'p') {
    const coords = coordsForIndex(piece.index);
    const newCoords = coordsForIndex(toIndex);
    if (newCoords.x !== coords.x) { // en passant
      const offset = newCoords.y < coords.y ? 8 : -8;
      const t = pieces.find((p) => p.index === toIndex + offset);
      if (t && t.type[0] !== piece.type[0] && t.type[1] === 'p') {
        t.dead = true;
      }
    }
  }

  if (piece.type[1] === 'k') { // castling
    const delta = toIndex - piece.index;
    if (delta === 2) {
      const rook = pieces.find((p) => p.index === piece.index + 3);
      rook.index = piece.index + 1;
      rook.moveCount += 1;
    } else if (delta === -2) {
      const rook = pieces.find((p) => p.index === piece.index - 4);
      rook.index = piece.index - 1;
      rook.moveCount += 1;
    }
  }

  piece.index = toIndex;
  newState.lastPid = pid;
  piece.moveCount++;

  const willPromote = () => {
    if (piece.type[1] !== 'p') {
      return false;
    }
    const {y} = coordsForIndex(piece.index);
    if ((piece.type[0] === 'w' && y === 0) || (piece.type[0] === 'b' && y === 7)) {
      return true;
    }
    return false;
  }

  if (willPromote()) {
    if (callback) {
      return new Promise(async (resolve) => {
        const newType = await callback(newState);
        piece.type = `${piece.type[0]}${newType}`;
        resolve(newState);
      });
    } else {
      piece.type = `${piece.type[0]}q`;
    }
  }
  return newState;
};

export const gameStatus = (state) => {
  const ap = alivePieces(state);
  const statusForColor = (color) => {
    const oposite = color === 'w' ? 'b' : 'w';
    const moves = validMovesForColor(state, color);
    const threats = validMovesForColor(state, oposite);
    const movesList = moves.map((m) => m.moves).flat();
    const threatsList = threats.map((m) => m.moves).flat();
    const king = ap.find((p) => p.type === `${color}k`);
    const check = !!(king && threatsList.includes(king.index));
    const checkmate = check && movesList.length === 0;
    const stalemate = !check && movesList.length === 0;
    return { checkmate, check, stalemate }
  }

  if (ap.length === 2 && ap.every((p) => p.type[1] === 'k')) {
    return 'd';
  }

  const white = statusForColor('w');
  if (white.checkmate) {
    return 'wcm';
  } else if (white.check) {
    return 'wc';
  } else if (white.stalemate) {
    return 'sm';
  }

  const black = statusForColor('b');
  if (black.checkmate) {
    return 'bcm';
  } else if (black.check) {
    return 'bc';
  } else if (black.stalemate) {
    return 'sm';
  }
  return null;
}

export const init = () => {
  const state = initialState();
  return state;
};
