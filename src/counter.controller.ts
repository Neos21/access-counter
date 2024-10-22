import { Controller, Get, HttpStatus, Logger, Query, Res } from '@nestjs/common';
import type { Response } from 'express';

import { CanvasService } from './canvas.service';
import { DbService } from './db.service';

@Controller('ct')
export class CounterController {
  private readonly logger: Logger = new Logger(CounterController.name);
  
  constructor(
    private readonly canvasService: CanvasService,
    private readonly dbService: DbService
  ) { }
  
  @Get('pv')
  public async updatePv(@Query('id') id: string, @Query('referrer') referrer: string, @Query('landing') landing: string, @Query('title') title: string, @Res() response: Response): Promise<Response> {
    const [idError, numberId] = this.validateNumber(id, 'ID');
    if(idError != null) return response.status(HttpStatus.BAD_REQUEST).json({ error: idError });
    const site = await this.dbService.findOne(numberId);
    if(site == null) return response.status(HttpStatus.BAD_REQUEST).json({ error: 'The Site Of The ID Does Not Exist' });
    
    if(!this.isEmpty(referrer)) this.logger.log(`ID [${site.id}] [${site.siteName}] : Referrer [${referrer}] Landing [${landing ?? ''}] Title [${title ?? ''}]`);
    
    const updatedSite = await this.dbService.updatePv(numberId);
    if(updatedSite == null) return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Failed To Update PV' });
    return response.status(HttpStatus.OK).json(updatedSite);
  }
  
  @Get('total')
  public async totalImage(@Query('id') id: string, @Query('digit') digit: string, @Res() response: Response): Promise<void | Response> {
    const [idError, numberId] = this.validateNumber(id, 'ID');
    if(idError != null) return response.status(HttpStatus.BAD_REQUEST).json({ error: idError });
    const [digitError, numberDigit] = this.validateNumber(digit, 'Digit');
    if(digitError != null) return response.status(HttpStatus.BAD_REQUEST).json({ error: digitError });
    const site = await this.dbService.findOne(numberId);
    if(site == null) return response.status(HttpStatus.BAD_REQUEST).json({ error: 'The Site Of The ID Does Not Exist' });
    
    const fileStream = this.canvasService.createRedCounter(site.total, numberDigit);
    fileStream.pipe(response.status(HttpStatus.OK));
  }
  
  @Get('today')
  public async todayImage(@Query('id') id: string, @Query('digit') digit: string, @Res() response: Response): Promise<void | Response> {
    const [idError, numberId] = this.validateNumber(id, 'ID');
    if(idError != null) return response.status(HttpStatus.BAD_REQUEST).json({ error: idError });
    const [digitError, numberDigit] = this.validateNumber(digit, 'Digit');
    if(digitError != null) return response.status(HttpStatus.BAD_REQUEST).json({ error: digitError });
    const site = await this.dbService.findOne(numberId);
    if(site == null) return response.status(HttpStatus.BAD_REQUEST).json({ error: 'The Site Of The ID Does Not Exist' });
    
    const fileStream = this.canvasService.createGreenCounter(site.today, numberDigit);
    fileStream.pipe(response.status(HttpStatus.OK));
  }
  
  @Get('yesterday')
  public async yesterdayImage(@Query('id') id: string, @Query('digit') digit: string, @Res() response: Response): Promise<void | Response> {
    const [idError, numberId] = this.validateNumber(id, 'ID');
    if(idError != null) return response.status(HttpStatus.BAD_REQUEST).json({ error: idError });
    const [digitError, numberDigit] = this.validateNumber(digit, 'Digit');
    if(digitError != null) return response.status(HttpStatus.BAD_REQUEST).json({ error: digitError });
    const site = await this.dbService.findOne(numberId);
    if(site == null) return response.status(HttpStatus.BAD_REQUEST).json({ error: 'The Site Of The ID Does Not Exist' });
    
    const fileStream = this.canvasService.createYellowCounter(site.yesterday, numberDigit);
    fileStream.pipe(response.status(HttpStatus.OK));
  }
  
  private isEmpty(value: any): boolean {
    return value == null || String(value).trim() === '';
  }
  
  private validateNumber(value: any, name: string): [string | null, number?] {
    if(this.isEmpty(value)) return [`The Query ${name} Is Emtpy`];
    const number = Number(value);
    if(Number.isNaN(number)) return [`The Query ${name} Is NaN`];
    return [null, number];
  }
}
