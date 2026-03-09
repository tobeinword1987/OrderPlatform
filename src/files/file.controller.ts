import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { Roles } from 'src/decorators/roles.decorator';
import { FileService } from './file.service';
import { User } from 'src/users/user.entity';
import type { PresignedBody } from './file.dto';
import type { UUID } from 'crypto';

@Controller('files')
export class FileController {
    constructor(private fileService: FileService) { }

    @Roles(['user', 'admin'])
    @Post('presign')
    async getPresignedUrl(@Req() request: Request & { user?: User }, @Body() presignedBody: PresignedBody) {
        console.log('***', request.user);
        const { contentType, visibility, size } = presignedBody;
        return await this.fileService.getPresignedUrl(request.user as User, contentType, visibility, size);
    }

    @Roles(['user', 'admin'])
    @Post('complete')
    async completeUpload(@Req() request: Request & { user?: User }, @Body('fileId') fileId: UUID) {
        return await this.fileService.completeUpload(request.user as User, fileId);
    }

    @Roles(['user', 'admin'])
    @Get(':id')
    async getFileById(@Req() request: Request & { user?: User }, @Body('fileId') fileId: UUID) {
        return await this.fileService.getFileById(request.user as User, fileId);
    }
}
