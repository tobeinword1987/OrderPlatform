import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { Order } from "./order.entity";
import { ORDER_STATUS } from "./order.dto";

@InputType()
export class OrdersFilterInput {
    @Field(() => ORDER_STATUS!)
    status?: ORDER_STATUS;

    @Field({ nullable: true })
    dateFrom?: Date;

    @Field({ nullable: true })
    dateTo?: Date;
}

@InputType()
export class OrdersPaginationInput {
    @Field()
    limit: number;

    @Field({ nullable: true })
    createdAt?: Date;

    @Field({ nullable: true })
    idTieBreaker?: string;
}

@ObjectType()
export class Cursor {
    @Field(() => Date)
    createdAt: Date;

    @Field(() => String)
    idTieBreaker: string
}

@ObjectType()
export class PageResult {

    @Field(() => [Order])
    orders: Order[];

    @Field()
    countOfPages: number;

    @Field(() => Cursor)
    cursor: {
        createdAt: Date,
        idTieBreaker: string
    }
}
