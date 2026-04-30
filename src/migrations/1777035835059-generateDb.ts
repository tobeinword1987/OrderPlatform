import { MigrationInterface, QueryRunner } from 'typeorm';

export class GenerateDb1777035835059 implements MigrationInterface {
  name = 'GenerateDb1777035835059';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "processed_message" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."Index_created_at_order_status"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."order_status_enum" RENAME TO "order_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."order_status_enum" AS ENUM('created', 'proceed', 'updated', 'in_progress', 'closed', 'failed')`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ALTER COLUMN "order_status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ALTER COLUMN "order_status" TYPE "public"."order_status_enum" USING "order_status"::"text"::"public"."order_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ALTER COLUMN "order_status" SET DEFAULT 'created'`,
    );
    await queryRunner.query(`DROP TYPE "public"."order_status_enum_old"`);
    await queryRunner.query(
      `CREATE INDEX "Index_created_at_order_status" ON "order" ("created_at", "order_status") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."Index_created_at_order_status"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."order_status_enum_old" AS ENUM('created', 'proceed', 'updated', 'in_progress', 'closed')`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ALTER COLUMN "order_status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ALTER COLUMN "order_status" TYPE "public"."order_status_enum_old" USING "order_status"::"text"::"public"."order_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ALTER COLUMN "order_status" SET DEFAULT 'created'`,
    );
    await queryRunner.query(`DROP TYPE "public"."order_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."order_status_enum_old" RENAME TO "order_status_enum"`,
    );
    await queryRunner.query(
      `CREATE INDEX "Index_created_at_order_status" ON "order" ("created_at", "order_status") `,
    );
    await queryRunner.query(
      `ALTER TABLE "processed_message" DROP COLUMN "updated_at"`,
    );
  }
}
