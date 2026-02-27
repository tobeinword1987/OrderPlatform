import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileService } from './file.service';
import { S3Service } from './s3.service';
import { Repository } from 'typeorm';
import { ConfigService } from 'src/config-service';
import { FileController } from './file.controller';
import { UploadFile } from './file.entity';

@Module({
    imports: [TypeOrmModule.forFeature([UploadFile])],
    providers: [FileService, S3Service, Repository<UploadFile>, ConfigService],
    controllers: [FileController],
    exports: [ S3Service ]
})
export class FileModule { }
