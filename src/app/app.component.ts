import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {DrawBoardComponent} from "../components/draw-board/draw-board.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, DrawBoardComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {}
