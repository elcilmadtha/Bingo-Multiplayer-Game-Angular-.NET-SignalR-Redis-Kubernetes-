import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BingoComponent } from './bingo.component';
import { FormsModule } from '@angular/forms';
import { TitleCasePipe } from '../SharedService/Pipes/title-case.pipe';

@NgModule({
  declarations: [BingoComponent, TitleCasePipe],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [BingoComponent]
})
export class BingoModule { }
