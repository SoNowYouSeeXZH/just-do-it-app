import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameState, GameActions, GuessRow, LetterStatus } from './types';
import { getTodayIdiom, isValidFormat, isValidIdiom } from '../data/idioms';

const MAX_ROWS = 6;
const IDIOM_LENGTH = 4;

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function buildEmptyRows(): GuessRow[] {
  return Array.from({ length: MAX_ROWS }, () => ({
    chars: Array(IDIOM_LENGTH).fill(''),
    statuses: Array(IDIOM_LENGTH).fill('empty' as LetterStatus),
    isRevealed: false,
  }));
}

/** 计算每个字的状态（仿 Wordle 逻辑） */
function evaluateGuess(guess: string, answer: string): LetterStatus[] {
  const statuses: LetterStatus[] = Array(IDIOM_LENGTH).fill('absent');
  const answerChars = answer.split('');
  const guessChars = guess.split('');
  const answerUsed = Array(IDIOM_LENGTH).fill(false);

  // 先标记完全正确
  for (let i = 0; i < IDIOM_LENGTH; i++) {
    if (guessChars[i] === answerChars[i]) {
      statuses[i] = 'correct';
      answerUsed[i] = true;
    }
  }

  // 再标记位置不对但存在
  for (let i = 0; i < IDIOM_LENGTH; i++) {
    if (statuses[i] === 'correct') continue;
    for (let j = 0; j < IDIOM_LENGTH; j++) {
      if (!answerUsed[j] && guessChars[i] === answerChars[j]) {
        statuses[i] = 'present';
        answerUsed[j] = true;
        break;
      }
    }
  }

  return statuses;
}

type StoreState = GameState & GameActions & { lastPlayedDate: string };

export const useGameStore = create<StoreState>()(
  persist(
    (set, get) => ({
      answer: getTodayIdiom(),
      guesses: buildEmptyRows(),
      currentInput: '',
      currentRow: 0,
      status: 'playing',
      streak: 0,
      totalPlayed: 0,
      totalWon: 0,
      lastPlayedDate: '',

      inputChar: (char: string) => {
        const { currentInput, status } = get();
        if (status !== 'playing') return;
        if (currentInput.length < IDIOM_LENGTH) {
          set({ currentInput: currentInput + char });
        }
      },

      deleteChar: () => {
        const { currentInput } = get();
        set({ currentInput: currentInput.slice(0, -1) });
      },

      submitGuess: () => {
        const { currentInput, currentRow, guesses, answer, status, streak, totalPlayed, totalWon } = get();

        if (status !== 'playing') return 'already_won';
        if (currentRow >= MAX_ROWS) return 'no_more_rows';
        if (!isValidFormat(currentInput)) return 'invalid_format';
        if (!isValidIdiom(currentInput)) return 'not_in_list';

        const statuses = evaluateGuess(currentInput, answer);
        const newGuesses = [...guesses];
        newGuesses[currentRow] = {
          chars: currentInput.split(''),
          statuses,
          isRevealed: false,
        };

        const won = currentInput === answer;
        const nextRow = currentRow + 1;
        const lost = !won && nextRow >= MAX_ROWS;

        set({
          guesses: newGuesses,
          currentInput: '',
          currentRow: nextRow,
          status: won ? 'won' : lost ? 'lost' : 'playing',
          streak: won ? streak + 1 : lost ? 0 : streak,
          totalPlayed: won || lost ? totalPlayed + 1 : totalPlayed,
          totalWon: won ? totalWon + 1 : totalWon,
          lastPlayedDate: getTodayKey(),
        });

        return 'ok';
      },

      resetForNewDay: () => {
        set({
          answer: getTodayIdiom(),
          guesses: buildEmptyRows(),
          currentInput: '',
          currentRow: 0,
          status: 'playing',
        });
      },
    }),
    {
      name: 'wordle-idiom-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        streak: state.streak,
        totalPlayed: state.totalPlayed,
        totalWon: state.totalWon,
        lastPlayedDate: state.lastPlayedDate,
        guesses: state.guesses,
        currentRow: state.currentRow,
        status: state.status,
        answer: state.answer,
        currentInput: state.currentInput,
      }),
    }
  )
);
