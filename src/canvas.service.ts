import * as path from 'node:path';
import * as stream from 'node:stream';

import { Injectable } from '@nestjs/common';
import { createCanvas, registerFont } from 'canvas';

@Injectable()
export class CanvasService {
  private readonly fontSizePx        = 30;    // フォントサイズ (px)
  private readonly characterWidthPx  = 16.5;  // フォントサイズから手計算する
  private readonly paddingHorizontal =  3;    // 左右パディング
  private readonly paddingVertical   = 29;    // 上下パディング
  private readonly height            = 32;    // 高さ (px)
  
  constructor() {
    registerFont(path.join(__dirname, '../assets/clockicons.ttf'), { family: 'clockicons' });
  }
  
  public createRedCounter(count: number, digit: number): stream.Readable {
    return this.createCounterImage(count, digit, '255, 0, 0');
  }
  
  public createGreenCounter(count: number, digit: number): stream.Readable {
    return this.createCounterImage(count, digit, '0, 255, 0');
  }
  
  public createYellowCounter(count: number, digit: number): stream.Readable {
    return this.createCounterImage(count, digit, '255, 255, 0');
  }
  
  private createCounterImage(count: number, digit: number, rgb: string): stream.Readable {
    if(count <  0) count = 0;  // 負数は 0 扱いにする
    if(digit <= 0) digit = 1;  // 0・負数は 1 扱いにする
    
    const width  = this.paddingHorizontal + (this.characterWidthPx * digit) + this.paddingHorizontal;  // 幅 (px)
    
    const canvas = createCanvas(width, this.height);
    const context = canvas.getContext('2d');
    context.font = `${this.fontSizePx}px clockicons`;
    
    // Background
    context.rect(0, 0, width, this.height);
    context.fillStyle = '#000';
    context.fill();
    
    // Shadow Text
    context.fillStyle = `rgba(${rgb}, .25)`;
    context.fillText('8'.repeat(digit), this.paddingHorizontal, this.paddingVertical);
    
    // Counter Text
    context.fillStyle = `rgb(${rgb})`;
    context.fillText(String(count).padStart(digit, '0').slice(-digit), this.paddingHorizontal, this.paddingVertical);
    
    const fileBuffer = canvas.toBuffer('image/png');
    const fileStream = stream.Readable.from(fileBuffer);
    return fileStream;
  }
}
