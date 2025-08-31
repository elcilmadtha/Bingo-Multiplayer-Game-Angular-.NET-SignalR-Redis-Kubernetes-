export interface BingoCell {
  row: number;
  col: number;
  value: number;
  marked: boolean;
  markedBy: string | null;
  highlight: boolean;
}

export interface BingoGrid {
  sessionId: string;
  userName: string;
  cells: BingoCell[];
}
export interface JoinGameResponse {
  sessionId: string;
  userName: string;
  cell: number[];
  enabledToPlay: boolean;
  opponents: string[];
}
