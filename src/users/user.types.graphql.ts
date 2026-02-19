import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class Credentials {
    @Field()
    username: String;

    @Field()
    password?: String;
}
