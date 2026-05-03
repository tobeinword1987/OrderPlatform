import { OmitType } from '@nestjs/swagger';
import { User } from 'src/users/user.entity';

export class LoginDto {
  username: string;
  password: string;
}

export class RefreshTokenDto {
  refreshToken: string;
}

export class AuthResponseDto {
  accessToken: string;
  refreshToken?: string;
}

export class AuthorizedDto extends OmitType(User, [
  'orders',
  'files',
  'avatar',
  'roles',
] as const) {
  accessToken: string;
  refresh_token: string;
}
