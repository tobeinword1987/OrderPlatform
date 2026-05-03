import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { Roles } from '../../src/decorators/roles.decorator';
import { FileService } from './file.service';
import { User } from '../../src/users/user.entity';
import {
  PresignedBody,
  FileIdDto,
  GetPresignedUrlResponseDto,
  CompleteUploadResponse,
} from './file.dto';
import type { UUID } from 'crypto';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('files')
export class FileController {
  constructor(private fileService: FileService) {}

  @Roles(['user', 'admin'])
  @Post('presign')
  @ApiResponse({
    description: 'Get the presigned url',
    status: 201,
    type: GetPresignedUrlResponseDto,
  })
  async getPresignedUrl(
    @Req() request: Request & { user?: User },
    @Body() presignedBody: PresignedBody,
  ) {
    const { contentType, visibility, size } = presignedBody;
    return await this.fileService.getPresignedUrl(
      request.user as User,
      contentType,
      visibility,
      size,
    );
  }

  @Roles(['user', 'admin'])
  @Post('complete')
  @ApiResponse({
    description: 'File upload completed',
    status: 201,
    type: CompleteUploadResponse,
  })
  async completeUpload(
    @Req() request: Request & { user?: User },
    @Body() body: FileIdDto,
  ) {
    return await this.fileService.completeUpload(
      request.user as User,
      body.fileId,
    );
  }

  @Roles(['user', 'admin'])
  @Get(':id')
  @ApiResponse({
    description: 'Getting the file by Id',
    status: 200,
    type: CompleteUploadResponse,
  })
  async getFileById(
    @Req() request: Request & { user?: User },
    @Param('id') fileId: UUID,
  ) {
    return await this.fileService.getFileById(request.user as User, fileId);
  }
}
