import {Component, ElementRef, inject, OnInit, ViewChild} from '@angular/core';
import {HttpClient, HttpClientModule} from "@angular/common/http";

import SvgDimensionsModel from "../../models/SvgDimensions.model";

@Component({
  selector: 'app-draw-board',
  standalone: true,
  imports: [HttpClientModule],
  templateUrl: './draw-board.component.html',
  styleUrl: './draw-board.component.css'
})
export class DrawBoardComponent implements OnInit {
  @ViewChild('svg') svg!: ElementRef<SVGSVGElement>;
  @ViewChild('rect') rect!: ElementRef<SVGRectElement>;

  private readonly http = inject(HttpClient);

  private readonly apiUrl: string = "https://localhost:44350/svg-json";

  perimeter = 0;
  strokeWidth = 5;
  x = 50;
  y = 50;

  startX = 0;
  startY = 0;

  isDrawing = false;
  resizeDirection = '';

  dimensions: SvgDimensionsModel = {height: 0, width: 0};

  ngOnInit() {
    this.http.get<SvgDimensionsModel>(this.apiUrl).subscribe({
      next: (dimensions) => {
        this.dimensions = dimensions;
        this.perimeter = 2 * (dimensions.height + dimensions.width);
      }
    })
  }

  startDrawing(event: MouseEvent) {
    this.startX = event.offsetX;
    this.startY = event.offsetY;
    this.dimensions.height = this.rect.nativeElement.height.animVal.value;
    this.dimensions.width = this.rect.nativeElement.width.animVal.value;

    const rectX = this.rect.nativeElement.x.animVal.value;
    const rectY = this.rect.nativeElement.y.animVal.value;
    const rectRight = rectX + this.dimensions.width;
    const rectBottom = rectY + this.dimensions.height;

    if (event.offsetX > rectRight - this.strokeWidth) {
      this.resizeDirection += 'right';
    } else if (event.offsetX < rectX + this.strokeWidth) {
      this.resizeDirection += 'left';
    }

    if (event.offsetY > rectBottom - this.strokeWidth) {
      this.resizeDirection += 'down';
    } else if (event.offsetY < rectY + this.strokeWidth) {
      this.resizeDirection += 'up';
    }

    this.isDrawing = true;
  }

  resizing(event: MouseEvent) {
    if (this.isDrawing) {
      let newHeight = this.dimensions.height + (event.offsetY - this.startY);
      let newWidth = this.dimensions.width + (event.offsetX - this.startX);
      let newX = this.rect.nativeElement.x.animVal.value;
      let newY = this.rect.nativeElement.y.animVal.value;

      if (this.resizeDirection.includes('right')) {
        if (event.offsetX < newX + this.strokeWidth)
          return;

        newWidth = this.dimensions.width + (event.offsetX - this.startX);

        this.setWidth(newX, newWidth);
      }

      if (this.resizeDirection.includes('left')) {
        if (event.offsetX > this.dimensions.width + this.startX - this.strokeWidth)
          return;

        newX = event.offsetX;
        newWidth = this.dimensions.width - (event.offsetX - this.startX);

        this.setWidth(newX, newWidth);
      }

      if (this.resizeDirection.includes('down')) {
        if (event.offsetY < newY + this.strokeWidth)
          return;

        newHeight = this.dimensions.height + (event.offsetY - this.startY);

        this.setHeight(newY, newHeight);
      }

      if (this.resizeDirection.includes('up')) {
        if (event.offsetY > this.dimensions.height + this.startY - this.strokeWidth)
          return;

        newY = event.offsetY;
        newHeight = this.dimensions.height - (event.offsetY - this.startY);

        this.setHeight(newY, newHeight);
      }
    }
  }

  endDrawing() {
    if (this.isDrawing) {
      this.isDrawing = false;
      this.resizeDirection = '';

      const dimensions: SvgDimensionsModel = {
        height: this.rect.nativeElement.height.animVal.value,
        width: this.rect.nativeElement.width.animVal.value
      };

      this.http.put(this.apiUrl, dimensions).subscribe({
        next: () => {
          console.log("Update was successful.");

          this.dimensions.height = dimensions.height;
          this.dimensions.width = dimensions.width;
          this.perimeter = 2 * (this.dimensions.height + this.dimensions.width);
        },
        error: () => {
          this.setHeight(this.y, this.dimensions.height);
          this.setWidth(this.x, this.dimensions.width);
        }
      })
    }
  }

  private setHeight(y: number, height: number) {
    this.rect.nativeElement.setAttribute('y', y.toString());
    this.rect.nativeElement.setAttribute('height', height.toString());
  }

  private setWidth(x: number, width: number) {
    this.rect.nativeElement.setAttribute('x', x.toString());
    this.rect.nativeElement.setAttribute('width', width.toString());
  }
}
