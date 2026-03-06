import { Args, Query } from "@nestjs/graphql";
import { Resolver } from "@nestjs/graphql";
import { User } from "src/users/user.entity";
import { UsersService } from "src/users/users.service";
import { AuthService } from "src/auth/auth.service";

@Resolver(() => User)
export class UserResolver {

    constructor(
        private usersService: UsersService,
    ) { }

    @Query(() => [User])
    async users(): Promise<User[]> {
        const users = await this.usersService.listUsers()
        return users;
    }

    @Query(() => User)
    async userByLogin(@Args('login') login: string): Promise<User | null> {
        const user = await this.usersService.findUserByLogin(login)
        return user;
    }

    // @Mutation(() => UserWithTokens)
    // @UseGuards(GqlLocalAuthGuard)
    // async signIn(@CurrentUser() user: User, @Args('username') username: string, @Args('password') pass: string): Promise<{ user: { login: string, id: string }, accessToken: string, refresh_token: string }> {
    //     console.log('###################', user);
    //     return this.authService.login(user);
    // }
}
