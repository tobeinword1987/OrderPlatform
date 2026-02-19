import { MigrationInterface, QueryRunner } from "typeorm";

export class GenerateDb1771499809074 implements MigrationInterface {
    name = 'GenerateDb1771499809074'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_token" ADD "user_id" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_token" DROP COLUMN "user_id"`);
    }

}
