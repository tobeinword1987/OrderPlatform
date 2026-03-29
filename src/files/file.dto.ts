import { ContentType } from './s3.types';

export enum Status {
  PENDING = 'pending',
  READY = 'ready',
}

export enum Visibility {
  PRIVATE = 'private',
  PUBLIC = 'public',
}

export type PresignedBody = {
  contentType: ContentType;
  visibility: Visibility;
  size: number;
};
