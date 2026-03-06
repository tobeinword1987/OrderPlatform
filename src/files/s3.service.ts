import { S3Client, PutObjectCommand, S3ClientConfig, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "../config-service";
import { ContentType } from "./s3.types";

@Injectable()
export class S3Service {

    private region: string;
    private readonly awsSdkClient: S3Client;
    private readonly bucket: string;
    private readonly expiresInSec: number;
    private readonly awsEndpoint: string;
    private readonly cloudFrontUrl: string;
    private readonly forcePathStyle: boolean;
    private readonly accessKeyId: string;
    private readonly secretAccessKey: string;

    constructor(
        private readonly configService: ConfigService,
    ) {
        this.region = this.configService.get('AWS_REGION') ?? 'eu-central-1';
        this.bucket = this.configService.get('AWS_S3_BUCKET') ?? 'files-private';
        this.expiresInSec = Number(this.configService.get('FILES_PRESIGN_EXPIRES_IN_SEC')) ?? 900;
        this.awsEndpoint = this.configService.get('AWS_S3_ENDPOINT') ?? 'http://localhost:9000';
        this.forcePathStyle = Boolean(this.configService.get('AWS_S3_FORCE_PATH_STYLE')) ?? true;
        this.cloudFrontUrl = this.configService.get('AWS_CLOUDFRONT_URL') ?? 'http://localhost:9000';
        this.accessKeyId = this.configService.get('AWS_ACCESS_KEY_ID') ?? 'minioadmin';
        this.secretAccessKey = this.configService.get('AWS_SECRET_ACCESS_KEY') ?? 'minioadmin';

        const clientConfig: S3ClientConfig = {
            region: this.region,
            forcePathStyle: this.forcePathStyle,
        };

        if (this.awsEndpoint) {
            clientConfig.endpoint = this.awsEndpoint;
        }

        if (this.accessKeyId && this.secretAccessKey) {
            clientConfig.credentials = { accessKeyId: this.accessKeyId, secretAccessKey: this.secretAccessKey };
        }

        this.awsSdkClient = new S3Client(clientConfig);
    }

    async generatePresignedUrl(key: string, contentType: ContentType) {
        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            ContentType: contentType,
        });

        const presigned = await getSignedUrl(this.awsSdkClient, command, {
            expiresIn: this.expiresInSec,
        });

        return { presigned, expiresInSec: this.expiresInSec };
    }

    async doesObjectExixts(key: string) {
        console.log(key, this.bucket);
        try {
            const fileMetadata = await this.awsSdkClient.send(new HeadObjectCommand({
                Bucket: this.bucket,
                Key: key
            }));
            if(fileMetadata) {
                return true;
            } else {
                return false
            }
        } catch (error) {
            console.log(error);
            throw new HttpException('Request to bucket failed', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    buildPublicUrl(key: string): string {
        if (this.cloudFrontUrl) {
            return `${this.cloudFrontUrl}/${key}`;
        }

        if (this.awsEndpoint) {
            const endpoint = this.trimTrailingSlash(this.awsEndpoint) ?? this.awsEndpoint;

            if (this.forcePathStyle) {
                return `${endpoint}/${this.bucket}/${key}`;
            }

            return `${endpoint}/${key}`;
        }

        return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
    }

    private trimTrailingSlash(input?: string): string | undefined {
        if (!input) {
            return input;
        }

        return input.replace(/\/+$/, '');
    }
}
