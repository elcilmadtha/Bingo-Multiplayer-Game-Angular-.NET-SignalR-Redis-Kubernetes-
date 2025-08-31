import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { BingoModule } from './bingo/bingo.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BingoModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
