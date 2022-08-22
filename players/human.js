import { validMoves } from '../engine.js';
import { positionFromIndex } from '../helpers.js';

export default (color) => {
  const makeMove = async (gameState) => {

    const clearMoves = () => {
      Array.from(gameState.ui.board.querySelectorAll('.move')).forEach((el) => gameState.ui.board.removeChild(el));
    }

    const clearSelection = () => {
      Array.from(gameState.ui.board.querySelectorAll('.piece')).forEach((el) => el.classList.remove('selected'));
    }

    const selectPiece = (el) => {
      clearSelection(gameState);
      el.classList.add('selected');
    }

    const renderMove = (move) => {
      const el = document.createElement('div');
      el.className = 'move';
      Object.assign(el.style, positionFromIndex(move));
      gameState.ui.board.appendChild(el);
      return el;
    };

    const clickPiece = async (el) => {
      const pid = gameState.ui.pieces.indexOf(el);
      clearMoves(gameState);
      return new Promise((resolve, reject) => {
        selectPiece(el, gameState);
        const cancelClick = (e) => {
          el.parentElement.removeEventListener('click', cancelClick);
          reject();
        };
        el.parentElement.addEventListener('click', cancelClick);
        const moves = validMoves(gameState.board, pid);
        moves.forEach((move) => {
          const moveEl = renderMove(move);
          moveEl.addEventListener('click', (e) => {
            e.stopPropagation();
            clearMoves(gameState);
            clearSelection(gameState);
            el.parentElement.removeEventListener('click', cancelClick);
            resolve({pid, toIndex: move});
          });
        });
      });
    }

    return new Promise((resolveMove) => {
      const clickBoard = async (e) => {
        if (e.target.classList.contains(`piece-${color}`)) {
          if (e.target.classList.contains('selected')) {
            clearMoves(gameState);
            clearSelection(gameState);
            return;
          }
          try {
            const m = await clickPiece(e.target);
            gameState.ui.board.removeEventListener('click', clickBoard);
            resolveMove(m);
          } catch (_) {
            // move canceled
          }
        }
      }
      gameState.ui.board.addEventListener('click', clickBoard);
    });
  };

  const promote = async (pid, gameState) => {
    const promoteElement = gameState.ui.board.querySelector('.promote');
    promoteElement.classList.remove('white');
    promoteElement.classList.remove('black');
    promoteElement.classList.add('show');
    promoteElement.classList.add(color === 'w' ? 'white' : 'black');
    return new Promise((resolve) => {
      const clickOption = (e) => {
        if (e.target.classList.contains('option')) {
          const newType = e.target.classList[1];
          promoteElement.removeEventListener('click', clickOption);
          promoteElement.classList.remove('show');
          resolve(newType);
        }
      };
      promoteElement.addEventListener('click', clickOption);
    });
  }

  return {makeMove, promote};
}
