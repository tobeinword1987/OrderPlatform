import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): { msg: string } {
    return { msg: 'Ecommerce Order Platform' };
  }

  getHealth() {
    return { msg: 'OK' };
  }
}
