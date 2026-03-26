import { MigrationInterface, QueryRunner } from "typeorm";

export class GenerateDb1773305383352 implements MigrationInterface {
    name = 'GenerateDb1773305383352'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "processed_message" ADD "message_id" uuid NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "processed_message" DROP COLUMN "message_id"`);
    }

}
