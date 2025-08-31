import { Component, OnInit } from '@angular/core';
import { GameHubService } from '../SharedService/game-hub.service';
import { BingoCell, JoinGameResponse } from './bingo.model';
import { SoundService } from '../SharedService/sound.service';
import { GameState } from '../SharedService/game-state.enum';

@Component({
  selector: 'app-bingo',
  templateUrl: './bingo.component.html',
  styleUrls: ['./bingo.component.css']
})
export class BingoComponent implements OnInit {

  grid: BingoCell[][] = [];
  cells: BingoCell[] = [];

  username: string = '';
  currentUser: string = '';
  opponentName: string = '';
  sessionId: string = '';  

  gameState: GameState = GameState.Idle;
  isWinner = false;
  isSoundOn = false;
  enabledToPlay = false;
  gameOver = false;
  showMessage = '';
  gameOverMessage = '';

  bingoLetters = [
    { letter: 'B', crossed: false },
    { letter: 'I', crossed: false },
    { letter: 'N', crossed: false },
    { letter: 'G', crossed: false },
    { letter: 'O', crossed: false }
  ];

  GameState = GameState;

  constructor(
    private readonly gameHub: GameHubService,
    private readonly soundService: SoundService
  ) { }

  ngOnInit(): void {
    this.gameHub.connection$.subscribe(connectionEstablished => {
      if (connectionEstablished) {
        this.gameHub.onReceiveMove((username, selectedValue) => {
          this.updateGrid(username, selectedValue);
        });
        this.gameHub.AnnounceWinner((username) => {
          this.enabledToPlay = false;
          this.gameOver = true;
          this.soundService.stopBackgroundMusic();

          if (username == this.currentUser) {
            this.isWinner = true;
            this.soundService.playWin();
            this.gameOverMessage = 'Bingo! You Won!';
          } else {
            this.isWinner = false;
            this.soundService.playLost();
            this.gameOverMessage = 'Bingo! Game over. ' + username + ' Won!'
          }
          this.gameHub.disconnect();
        });
      }
    });
  }

  restartGame() {
    this.grid = [];
    this.username = '';
    this.opponentName = '';
    this.isWinner = false;
    this.isSoundOn = false;
    this.gameOver = false;
    this.soundService.stopBackgroundMusic();
    this.bingoLetters.forEach(letter => letter.crossed = false);
    this.gameState = GameState.Idle;
  }

  joinGame() {
    if (this.username.trim() === '') {
      this.showMessage = 'Enter username';
      return;
    }

    this.gameState = GameState.Loading;

    this.gameHub.joinGame(this.username).then(success => {
      if (success) {
        this.showMessage = 'Waiting for another player';
        this.gameHub.onReceiveGrid(bingo => {
          this.currentUser = bingo.userName;
          this.opponentName = bingo.opponents[0];
          this.createGrid(bingo);
          this.enabledToPlay = bingo.enabledToPlay;
          this.showMessage = bingo.enabledToPlay ? 'Make a move' : this.opponentName + ' is making the move!';
          this.gameState = GameState.Playing;
        });
      }
    });
  }

  createGrid(values: JoinGameResponse) {
    this.sessionId = values.sessionId;
    const cells: BingoCell[] = [];
    let index = 0;
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        cells.push({
          row,
          col,
          value: values.cell[index],
          marked: false,
          markedBy: null,
          highlight: false
        });
        index++;
      }
    }
    this.cells = cells;
    this.grid = this.build2DGrid(cells);
  }

  private build2DGrid(cells: BingoCell[]): BingoCell[][] {
    const grid: BingoCell[][] = [];
    for (let r = 0; r < 5; r++) {
      grid[r] = cells.filter(c => c.row === r);
      grid[r].sort((a, b) => a.col - b.col);
    }
    return grid;
  }

  getCellClass(cell: BingoCell): string {
    if (!cell.marked) return 'default';
    return cell.markedBy === this.currentUser ? 'green' : 'red';
  }

  onCellClick(cell: BingoCell) {
    if (this.gameState !== GameState.Playing) return;
    if (cell.marked) return;
    this.enabledToPlay = false;

    this.soundService.playClick();
    cell.marked = true;
    cell.markedBy = this.currentUser;
    this.gameHub.makeMove(cell.value, cell.markedBy, this.sessionId);
    this.showMessage = this.opponentName + ' is making the move!';
  }

  updateGrid(username: string, selectedValue: number) {
    if (username !== this.currentUser) {
      this.enabledToPlay = true;
    }
    for (const row of this.grid) {
      for (const cell of row) {
        if (cell.value === selectedValue) {
          cell.marked = true;
          cell.markedBy = username;
          if (username !== this.currentUser) {
            cell.highlight = true;
            setTimeout(() => cell.highlight = false, 500);
          }
        }
      }
    }
    this.grid = [...this.grid];

    if (username !== this.currentUser) {
      this.showMessage = 'Make a move!';
    } else {
      this.showMessage = this.opponentName + ' is making the move!';
    }

    const size = this.grid.length;
    let completedLines  = 0;

    // Check rows
    for (let r = 0; r < size; r++) {
      if (this.grid[r].every(cell => cell.marked)) completedLines++;
    }

    // Check columns
    for (let c = 0; c < size; c++) {
      if (this.grid.every(row => row[c].marked)) completedLines++;
    }

    // Check diagonals
    if (this.grid.every((row, idx) => row[idx].marked)) completedLines++;
    if (this.grid.every((row, idx) => row[size - 1 - idx].marked)) completedLines++;


    for (let i = 0; i < this.bingoLetters.length; i++) {
      this.bingoLetters[i].crossed = i < completedLines;
    }

    if (completedLines >= 5) {
      this.gameHub.gameOver(this.currentUser, this.sessionId);
    }
  }

  toggleSound() {
    this.isSoundOn = !this.isSoundOn;
    this.isSoundOn
      ? this.soundService.startBackgroundMusic()
      : this.soundService.stopBackgroundMusic();
  }

  get gameResultClass() {
    return this.isWinner ? 'win-message' : 'lose-message';
  }
  get gameResultText() {
    return this.isWinner ? 'You Won 🎉' : 'You Lost 😢';
  }
}
