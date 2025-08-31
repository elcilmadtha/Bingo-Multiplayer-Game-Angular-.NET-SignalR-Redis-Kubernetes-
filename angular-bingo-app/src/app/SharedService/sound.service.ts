import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SoundService {
  private bgMusic: HTMLAudioElement | null = null;

  playClick() {
    this.playSound('assets/sounds/click.wav');
  }

  playWin() {
    this.playSound('assets/sounds/win.mp3');
  }
  playLost() {
    this.playSound('assets/sounds/lost-v3.mp3');
  }

  startBackgroundMusic() {
    if (!this.bgMusic) {
      this.bgMusic = new Audio('assets/sounds/background.mp3');
      this.bgMusic.loop = true;  
      this.bgMusic.volume = 0.05; 
    }
    this.bgMusic.play();
  }

  stopBackgroundMusic() {
    this.bgMusic?.pause();
    this.bgMusic = null;
  }

  private playSound(path: string) {
    const audio = new Audio(path);
    audio.play();
  }
}
