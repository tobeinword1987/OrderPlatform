import { Global, Module } from '@nestjs/common';
import { RabbitmqService } from './rabbitmq.service';
import { ConfigService } from '../../src/config-service';

@Global()
@Module({
  providers: [RabbitmqService, ConfigService],
  exports: [RabbitmqService],
})
export class RabbitmqModule { }
