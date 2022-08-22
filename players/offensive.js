import { validMovesForColor, alivePieces } from '../engine.js';

const VALUE_MAP = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 10
};

const getRandom = (pieces) => {
  const p = pieces[Math.floor(Math.random() * pieces.length)];
  const m = p.moves[Math.floor(Math.random() * p.moves.length)];;
  return {pid: p.pid, toIndex: m};
}

export default (color) => {
  const makeMove = async (gameState) => {
    const pieces = validMovesForColor(gameState.board, color).filter((p) => p.moves.length > 0);
    const attacks = [];
    for (const p of pieces) {
      for (const m of p.moves) {
        const p2 = alivePieces(gameState.board).find((p3) => p3.index === m && p3.type[0] !== color);
        if (p2) {
          attacks.push({m: {pid: p.pid , toIndex: m}, score: VALUE_MAP[p2.type[1]]});
        }
      }
    }
    if (attacks.length) {
      const best = attacks.sort((a, b) => a.score - b.score).pop();
      return best.m;
    }
    return getRandom(pieces);
  };

  const promote = async (pid, gameState) => {
    return 'q';
  }

  return {makeMove, promote};
}
