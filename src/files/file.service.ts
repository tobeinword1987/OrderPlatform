import { User } from 'src/users/user.entity';
import { Status, Visibility } from './file.dto';
import { randomUUID, UUID } from 'node:crypto';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { UploadFile } from './file.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { S3Service } from './s3.service';
import { ContentType } from './s3.types';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(UploadFile)
    private fileRepository: Repository<UploadFile>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    private dataSource: DataSource,
    private s3Service: S3Service,
  ) {}

  async getFileById(user: User, fileId: UUID) {
    const file = await this.fileRepository.findOneBy({ id: fileId });
    if (!file) {
      throw new HttpException('File not found', HttpStatus.NOT_FOUND);
    }

    if (user.id !== file.userId) {
      throw new HttpException(
        'User is not the owner of this file',
        HttpStatus.FORBIDDEN,
      );
    }

    return {
      id: file.id,
      ownerUserId: file.userId,
      status: file.status,
      contentType: file.contentType,
      ...(file.size ? { sizeBytes: file.size } : {}),
      objectKey: file.key,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
      publicUrl: this.s3Service.buildPublicUrl(file.key),
    };
  }

  async completeUpload(user: User, fileId: UUID) {
    const file = await this.fileRepository.findOneBy({ id: fileId });

    if (file?.userId !== user.id) {
      throw new HttpException(
        'User is not the owner of the file',
        HttpStatus.FORBIDDEN,
      );
    }

    if (!file) {
      throw new HttpException('File not found', HttpStatus.NOT_FOUND);
    }

    const doesObjectExists = await this.s3Service.doesObjectExixts(file.key);
    if (doesObjectExists) {
      await this.dataSource.transaction(async (manager: EntityManager) => {
        await manager
          .getRepository(User)
          .update({ id: user.id }, { avatarId: fileId });
        await manager
          .getRepository(UploadFile)
          .update({ id: fileId }, { status: Status.READY });
      });
      const fileCompleted = await this.fileRepository.findOneBy({ id: fileId });
      if (fileCompleted) {
        return {
          id: fileCompleted.id,
          ownerUserId: fileCompleted.userId,
          status: fileCompleted.status,
          contentType: file.contentType,
          ...(fileCompleted.size ? { sizeBytes: fileCompleted.size } : {}),
          objectKey: fileCompleted.key,
          createdAt: fileCompleted.createdAt,
          updatedAt: fileCompleted.updatedAt,
          publicUrl: this.s3Service.buildPublicUrl(fileCompleted.key),
        };
      } else {
        throw new Error('Complete upload failed');
      }
    } else {
      throw new HttpException(
        'File was not uploaded to the bitbucket',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async getPresignedUrl(
    user: User,
    contentType: ContentType,
    visibility: Visibility,
    size?: number,
  ) {
    const key = `users/${user.id}/avatars/${randomUUID()}.jpg`;
    const fileMetadata = this.fileRepository.create({
      userId: user.id,
      key,
      contentType,
      visibility,
      status: Status.PENDING,
      ...(size ? { size } : {}),
    });

    const fileSaved = await this.fileRepository.save(fileMetadata);

    const presignedData = await this.s3Service.generatePresignedUrl(
      key,
      contentType,
    );

    return {
      id: fileSaved.id,
      status: fileSaved.status,
      key: fileSaved.key,
      uploadKey: presignedData.presigned,
      uploadMethod: 'PUT',
      uploadHeaders: {
        'Content-Type': fileSaved.contentType,
      },
      expiresInSec: presignedData.expiresInSec,
      publicUrl: this.s3Service.buildPublicUrl(fileSaved.key),
    };
  }
}
