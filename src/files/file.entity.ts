import { User } from '../users/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Status, Visibility } from './file.dto';

@Entity()
@Index('Index_file_user_id', ['userId'])
@Index('Index_file_created_at', ['createdAt'])
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({ name: 'key' })
  key: string;

  @Column({ name: 'content_type' })
  contentType: string;

  @Column({ name: 'size' })
  size: number;

  @Column({ type: 'enum', enum: Status, enumName: 'file_status', default: Status.PENDING, name: 'status' })
  status: Status;

  @Column({ type: 'enum', enum: Visibility, enumName: 'file_visibility', default: Visibility.PRIVATE, name: 'visibility' })
  visibility: Status;

  @ManyToOne(() => User, (user) => user.files, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
