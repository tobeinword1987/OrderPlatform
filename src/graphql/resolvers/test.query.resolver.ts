import { Query, Resolver } from "@nestjs/graphql";

@Resolver(() => String)
export class TestResolver {
    @Query(() => String)
    test() {
        return `Hello, Kyryl`;
    }
}
