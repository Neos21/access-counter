import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { cyan, yellow } from './core/utils/colour-logger';
import { listRoutes } from './core/utils/list-routes';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // CORS を有効にする
  app.enableCors({
    origin: (/localhost/u),  // `localhost` を全て許可するため正規表現を使う
    methods: 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD',
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Headers, Access-Control-Allow-Credentials',
    credentials: true  // `Access-Control-Allow-Credentials` を許可する
  });
  // サーバを起動する
  const port = app.get<ConfigService>(ConfigService).get<number>('port')!;
  await app.listen(port);
  // ログ出力する
  const logger = new Logger(bootstrap.name);
  logger.log(cyan(`Server Started At Port [`) + yellow(`${port}`) + cyan(']'));
  // ルーティング一覧を出力する
  logger.log(listRoutes(app.getHttpServer()._events.request._router));
}
void bootstrap();
