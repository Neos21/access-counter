import { Controller, Get, HttpStatus, Logger, Query, Res } from '@nestjs/common';
import type { Response } from 'express';

import { CanvasService } from './canvas.service';
import { DbService } from './db.service';
import type { Site } from './entities/site';

@Controller('ct')
export class CounterController {
  private readonly logger: Logger = new Logger(CounterController.name);
  
  constructor(
    private readonly canvasService: CanvasService,
    private readonly dbService: DbService
  ) { }
  
  @Get('pv')
  public async updatePv(@Query('id') id: string, @Query('referrer') referrer: string, @Query('landing') landing: string, @Res() response: Response): Promise<Response> {
    const numberId = this.validateNumber(id, 'ID', response);
    if(numberId == null) return;
    const site = await this.findOne(numberId, response);
    if(site == null) return;
    
    if(!this.isEmpty(referrer)) this.logger.log(`ID [${site.id}] [${site.siteName}] : Referrer [${referrer}] Landing [${landing}]`);
    
    const updatedSite = await this.dbService.updatePv(numberId);
    if(updatedSite == null) return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Failed To Update PV' });
    return response.status(HttpStatus.OK).json(updatedSite);
  }
  
  @Get('total')
  public async totalImage(@Query('id') id: string, @Query('digit') digit: string, @Res() response: Response): Promise<void | Response> {
    const numberId = this.validateNumber(id, 'ID', response);
    if(numberId == null) return;
    const numberDigit = this.validateNumber(digit, 'Digit', response);
    if(numberDigit == null) return;
    const site = await this.findOne(numberId, response);
    if(site == null) return;
    
    const fileStream = this.canvasService.createRedCounter(site.total, numberDigit);
    fileStream.pipe(response.status(HttpStatus.OK));
  }
  
  @Get('today')
  public async todayImage(@Query('id') id: string, @Query('digit') digit: string, @Res() response: Response): Promise<void | Response> {
    const numberId = this.validateNumber(id, 'ID', response);
    if(numberId == null) return;
    const numberDigit = this.validateNumber(digit, 'Digit', response);
    if(numberDigit == null) return;
    const site = await this.findOne(numberId, response);
    if(site == null) return;
    
    const fileStream = this.canvasService.createGreenCounter(site.today, numberDigit);
    fileStream.pipe(response.status(HttpStatus.OK));
  }
  
  @Get('yesterday')
  public async yesterdayImage(@Query('id') id: string, @Query('digit') digit: string, @Res() response: Response): Promise<void | Response> {
    const numberId = this.validateNumber(id, 'ID', response);
    if(numberId == null) return;
    const numberDigit = this.validateNumber(digit, 'Digit', response);
    if(numberDigit == null) return;
    const site = await this.findOne(numberId, response);
    if(site == null) return;
    
    const fileStream = this.canvasService.createYellowCounter(site.yesterday, numberDigit);
    fileStream.pipe(response.status(HttpStatus.OK));
  }
  
  private isEmpty(value: any): boolean {
    return value == null || String(value).trim() === '';
  }
  
  private validateNumber(value: any, name: string, response: Response): number | null {
    if(this.isEmpty(value)) {
      response.status(HttpStatus.BAD_REQUEST).json({ error: `The Query ${name} Is Emtpy` });
      return null;
    }
    const number = Number(value);
    if(Number.isNaN(number)) {
      response.status(HttpStatus.BAD_REQUEST).json({ error: `The Query ${name} Is NaN` });
      return null;
    }
    return number;
  }
  
  private async findOne(id: number, response: Response): Promise<Site | null> {
    const site = await this.dbService.findOne(id);
    if(site == null) {
      response.status(HttpStatus.BAD_REQUEST).json({ error: 'The Site Of The ID Does Not Exist' });
      return null;
    }
    return site;
  }
}
