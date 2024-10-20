import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';

// Imports
import { configuration } from './core/configs/configuration';
import { AccessLogMiddleware } from './core/middlewares/access-log.middleware';
// TypeORM
import { Site } from './entities/site';
// Providers
import { CanvasService } from './canvas.service';
import { DbService } from './db.service';
// Controllers
import { AppController } from './app.controller';
import { AdminController } from './admin.controller';
import { CounterController } from './counter.controller';

@Module({
  imports: [
    // 環境変数を注入する
    ConfigModule.forRoot({
      isGlobal: true,  // 各 Module での `imports` を不要にする
      load: [configuration]  // 環境変数を読み取り適宜デフォルト値を割り当てるオブジェクトをロードする
    }),
    // Cron 定期実行機能用
    ScheduleModule.forRoot(),
    // TypeORM
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite',
        database: configService.get<string>('dbFilePath'),
        entities: [
          Site
        ],
        synchronize: true
      })
    }),
    TypeOrmModule.forFeature([
      Site
    ])
  ],
  providers: [
    CanvasService,
    DbService
  ],
  controllers: [
    AppController,
    AdminController,
    CounterController
  ]
})
export class AppModule {
  /** 独自のアクセスログ出力ミドルウェアを適用する */
  public configure(middlewareConsumer: MiddlewareConsumer): void {
    middlewareConsumer.apply(AccessLogMiddleware).forRoutes('*');
  }
}
