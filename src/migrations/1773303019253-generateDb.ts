import { MigrationInterface, QueryRunner } from 'typeorm';

export class GenerateDb1773303019253 implements MigrationInterface {
  name = 'GenerateDb1773303019253';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "processed_message" ALTER COLUMN "handler" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "processed_message" ALTER COLUMN "handler" SET NOT NULL`,
    );
  }
}
