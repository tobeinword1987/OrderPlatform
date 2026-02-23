import { ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GqlExecutionContext } from "@nestjs/graphql";
import { AuthGuard } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { IS_PUBLIC_KEY } from "src/decorators/public";
import { Roles } from "src/decorators/roles.decorator";
import { UsersRoles } from "src/users/usersRoles.entity";
import { In, Repository } from "typeorm";

@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {

  constructor (
    private reflector: Reflector,
    @InjectRepository(UsersRoles) private userRolesRepository: Repository<UsersRoles>,
  ) {
    super();
  }
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
          const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
              context.getHandler(),
              context.getClass(),
          ]);
          if (isPublic) {
              return true;
          }

          const baseGuardResult = await super.canActivate(context);
          if(!baseGuardResult){
              return false;
          }

          const { user } = this.getRequest(context);

          const roles = this.reflector.get(Roles, context.getHandler());
          if (!roles) {
              return true;
          }
          if(user) {
              return await this.matchRoles(roles, user.user.id);
          }
          return true;
      }

      async matchRoles(roles: string[], userId: string) {
          const uRoles = await this.userRolesRepository.find({
              where: {
                  userId,
                  roles: { role: In(roles)}
              },
              relations: ['roles'],
          })

          return uRoles.length > 0 ? true : false;;
      }

}
