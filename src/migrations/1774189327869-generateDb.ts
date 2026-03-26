import { MigrationInterface, QueryRunner } from "typeorm";

export class GenerateDb1774189327869 implements MigrationInterface {
    name = 'GenerateDb1774189327869'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" ADD "total_price_at_purchase" double precision NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "total_price_at_purchase"`);
    }

}
