import { ContentType } from './s3.types';
import { UUID } from 'crypto';

export enum Status {
  PENDING = 'pending',
  READY = 'ready',
}

export enum Visibility {
  PRIVATE = 'private',
  PUBLIC = 'public',
}

export class PresignedBody {
  contentType: ContentType;
  visibility: Visibility;
  size: number;
}

export class FileIdDto {
  fileId: UUID;
}

export class GetPresignedUrlResponseDto {
  id: string;
  status: Status;
  key: string;
  uploadKey: string;
  uploadMethod: string;
  uploadHeaders: {
    'Content-Type': string;
  };
  expiresInSec: number;
  publicUrl: string;
}

export class CompleteUploadResponse {
  objectKey: string;
  createdAt: Date;
  updatedAt: Date;
  publicUrl: string;
  sizeBytes?: number | undefined;
  id: string;
  ownerUserId: string;
  status: Status;
  contentType: string;
}
