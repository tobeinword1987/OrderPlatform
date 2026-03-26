import { MigrationInterface, QueryRunner } from "typeorm";

export class GenerateDb1773266008382 implements MigrationInterface {
    name = 'GenerateDb1773266008382'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "processed_message" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order_id" uuid NOT NULL, "processed_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_8e3fd5041a92cfd8614379458c3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "Index_message_procesed_at" ON "processed_message" ("processed_at") `);
        await queryRunner.query(`CREATE INDEX "Index_message_order_id" ON "processed_message" ("order_id") `);
        await queryRunner.query(`ALTER TABLE "processed_message" ADD CONSTRAINT "FK_c81e75762ece05b91bfecc6cf07" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "processed_message" DROP CONSTRAINT "FK_c81e75762ece05b91bfecc6cf07"`);
        await queryRunner.query(`DROP INDEX "public"."Index_message_order_id"`);
        await queryRunner.query(`DROP INDEX "public"."Index_message_procesed_at"`);
        await queryRunner.query(`DROP TABLE "processed_message"`);
    }

}
