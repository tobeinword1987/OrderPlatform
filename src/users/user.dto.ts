import { Entity } from 'typeorm';

@Entity()
export class User {
  firstName: string;
  lastName: string;
}
