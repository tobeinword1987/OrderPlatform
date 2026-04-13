import { MigrationInterface, QueryRunner } from "typeorm";

export class GenerateDb1776107886939 implements MigrationInterface {
    name = 'GenerateDb1776107886939'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "audit_log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "actor_id" uuid NOT NULL, "target_id" uuid, "action" character varying NOT NULL, "target_type" character varying NOT NULL, "outcome" character varying NOT NULL, "correlation_id" character varying NOT NULL, "reason" character varying NOT NULL, "error_code" character varying NOT NULL, "log" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_07fefa57f7f5ab8fc3f52b3ed0b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "Index_audit_log_created_at" ON "audit_log" ("created_at") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."Index_audit_log_created_at"`);
        await queryRunner.query(`DROP TABLE "audit_log"`);
    }

}
