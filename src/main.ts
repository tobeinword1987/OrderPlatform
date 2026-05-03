import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './http.exception.filter';
import helmet from 'helmet';
import { GlobalInterceptor } from './global.interceptor';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Order Platform')
    .setDescription('Order platform API description')
    .setVersion('1.0')
    .addGlobalResponse({
      status: 500,
      description: 'Internal server error',
    })
    .addGlobalResponse({
      status: 401,
      description: 'Unauthorized error',
    })
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  app.use(helmet());
  app.useGlobalInterceptors(new GlobalInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
