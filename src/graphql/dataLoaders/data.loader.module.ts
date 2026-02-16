import { Module } from '@nestjs/common';
import { DtLoader } from './data.loader';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItem } from 'src/orders/order.item.entity';
import { User } from 'src/users/user.entity';
import { Product } from 'src/products/product.entity';

@Module({
    imports: [TypeOrmModule.forFeature([OrderItem, User, Product])],
    providers: [DtLoader],
    exports: [DataLoaderModule, DtLoader]
})
export class DataLoaderModule {}
