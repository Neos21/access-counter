import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

import { Site } from './entities/site';

@Injectable()
export class DbService {
  private readonly logger: Logger = new Logger(DbService.name);
  
  constructor(
    @InjectRepository(Site) private readonly sitesRepository: Repository<Site>
  ) {
    // 初期データを登録する
    const neosWorld = new Site({ id: 1, siteName: 'Neo\'s World', siteUrl: 'https://neos21.net' });
    this.sitesRepository.insert(neosWorld).catch(error => this.logger.log(`The Site Data Probably Already Exists : ${error.toString()}`));
  }
  
  public async findOne(id: number): Promise<Site | null> {
    return await this.sitesRepository.findOneBy({ id: id }).catch(_error => null);
  }
  
  public async updatePv(id: number): Promise<Site | null> {
    const site = await this.findOne(id);
    site.total++;
    site.today++;
    return await this.sitesRepository.save(site).catch(_error => null);
  }
  
  /**
   * Cron Job スケジュールを定義する
   * 
   * - Seconds Minutes Hours Dates Months Days(0:Sunday - 6:Saturday) の順
   * - JST で指定できる : 毎日0時0分0秒にカウンタをリセットする
   * - 関数内でエラーが発生しても異常終了にはならない
   */
  @Cron('0 0 0 * * *', { timeZone: 'Asia/Tokyo' })
  private async handleCron(): Promise<void> {
    this.logger.log('#handleCron() : Start');
    const sites = await this.sitesRepository.find();
    for(const site of sites) {
      site.yesterday = site.today;
      site.today     = 0;
      await this.sitesRepository.save(site).catch(error => this.logger.warn(`  Failed To Save : ${error.toString()}`));
    }
    this.logger.log('#handleCron() : Finished');
  }
}
