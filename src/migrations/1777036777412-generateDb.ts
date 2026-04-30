import { MigrationInterface, QueryRunner } from 'typeorm';

export class GenerateDb1777036777412 implements MigrationInterface {
  name = 'GenerateDb1777036777412';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX "Index_order_id_Unique" ON "processed_message" ("order_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."Index_order_id_Unique"`);
  }
}
