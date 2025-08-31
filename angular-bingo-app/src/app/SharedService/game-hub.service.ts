import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { JoinGameResponse } from '../bingo/bingo.model';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class GameHubService {
  private hubConnection!: signalR.HubConnection;
  connection$ = new BehaviorSubject<boolean>(false);

  constructor() {}

  public async joinGame(username: string): Promise<boolean | null> {
    try {
      this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl('https://<use-ur-backend-url>/gamehub?username=' + username, { withCredentials: false }) // 
        .withAutomaticReconnect().build();

      await this.startConnection();
      return await this.hubConnection.invoke<boolean>('JoinGame', username);
    } catch (err) {
      console.error('Error joining game: ', err);
      return null;
    }
  }

  private async startConnection(): Promise<void> {
    try {
      await this.hubConnection.start();
      this.connection$.next(true);
      console.log('SignalR connected');
    } catch (err) {
      console.error('SignalR connection error: ', err);
      throw err;
    }
  }

  onReceiveGrid(callback: (bingo: JoinGameResponse) => void): void {
    this.hubConnection.on('ReceiveGrid', callback);
  }

  async disconnect(): Promise<void> {
    await this.hubConnection.stop();
  }

  makeMove(selectedValue: number, username: string, sessionId: string) {
    console.log('MakeMove');
    return this.hubConnection.invoke('MakeMove', selectedValue, username, sessionId);
  }

  onReceiveMove(callback: (username: string, selectedValue: number) => void) {
    console.log('ReceiveMove1');
    if (this.hubConnection) {
      console.log('ReceiveMove2');
      this.hubConnection.on('ReceiveMove', (username: string, selectedValue: number) => {
        callback(username, selectedValue);
      });
    }
  }
  gameOver(currentUser: string, sessionId: string) {
    return this.hubConnection.invoke('GameOver', currentUser, sessionId);
  }

  AnnounceWinner(callback: (username: string) => void) {
      this.hubConnection.on('AnnounceWinner', (username: string) => {
        callback(username);
      });
  }
}
