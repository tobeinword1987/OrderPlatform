import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
  get(secret: string) {
    return process.env[secret];
  }
}
