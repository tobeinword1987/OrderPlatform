import { MigrationInterface, QueryRunner } from 'typeorm';

export class GenerateDb1776456806625 implements MigrationInterface {
  name = 'GenerateDb1776456806625';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "Index_created_at_order_status" ON "order" ("created_at", "order_status") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."Index_created_at_order_status"`,
    );
  }
}
