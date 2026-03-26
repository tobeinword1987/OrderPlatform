import { MigrationInterface, QueryRunner } from "typeorm";

export class GenerateDb1773302901552 implements MigrationInterface {
    name = 'GenerateDb1773302901552'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."Index_message_procesed_at"`);
        await queryRunner.query(`ALTER TABLE "processed_message" ADD "handler" character varying NOT NULL`);
        await queryRunner.query(`CREATE INDEX "Index_order_procesed_at" ON "processed_message" ("processed_at") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."Index_order_procesed_at"`);
        await queryRunner.query(`ALTER TABLE "processed_message" DROP COLUMN "handler"`);
        await queryRunner.query(`CREATE INDEX "Index_message_procesed_at" ON "processed_message" ("processed_at") `);
    }

}
