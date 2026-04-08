import { MigrationInterface, QueryRunner } from 'typeorm';

export class GenerateDb1772700924643 implements MigrationInterface {
  name = 'GenerateDb1772700924643';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."order_status_enum" RENAME TO "order_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."order_status_enum" AS ENUM('created', 'proceed', 'updated', 'in_progress', 'closed')`,
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."order_status_enum_old" AS ENUM('created', 'updated', 'in_progress', 'closed')`,
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
  }
}
