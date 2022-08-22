import { validMovesForColor } from '../engine.js';

export default (color) => {
  const makeMove = async (gameState) => {
    const pieces = validMovesForColor(gameState.board, color).filter((p) => p.moves.length > 0);
    const p = pieces[Math.floor(Math.random() * pieces.length)];
    const m = p.moves[Math.floor(Math.random() * p.moves.length)];
    return {pid: p.pid, toIndex: m};
  };

  const promote = async (pid, gameState) => {
    return 'q';
  }

  return {makeMove, promote};
}
