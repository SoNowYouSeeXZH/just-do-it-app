/** 每次猜测中单个字的状态 */
export type LetterStatus = 'correct' | 'present' | 'absent' | 'empty';

/** 一行猜测结果 */
export interface GuessRow {
  chars: string[];
  statuses: LetterStatus[];
  isRevealed: boolean;
}

/** 游戏状态 */
export type GameStatus = 'playing' | 'won' | 'lost';

export interface GameState {
  answer: string;         // 今日答案
  guesses: GuessRow[];    // 所有猜测历史（最多 6 行）
  currentInput: string;   // 当前输入
  currentRow: number;     // 当前行索引
  status: GameStatus;
  streak: number;         // 连胜数
  totalPlayed: number;
  totalWon: number;
}

export interface GameActions {
  inputChar: (char: string) => void;
  deleteChar: () => void;
  submitGuess: () => 'ok' | 'invalid_format' | 'not_in_list' | 'already_won' | 'no_more_rows';
  resetForNewDay: () => void;
}
