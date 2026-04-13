import { MigrationInterface, QueryRunner } from 'typeorm';

export class GenerateDb1772098907075 implements MigrationInterface {
  name = 'GenerateDb1772098907075';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "scope" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "scope" character varying NOT NULL, CONSTRAINT "PK_d3425631cbb370861a58c3e88c7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "Index_scope_unique" ON "scope" ("scope") `,
    );
    await queryRunner.query(
      `CREATE TABLE "category" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "product" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "category_id" uuid NOT NULL, "price" double precision NOT NULL, "quantity" integer NOT NULL, CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "Index_product_category_id" ON "product" ("category_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "Index_product_price" ON "product" ("price") `,
    );
    await queryRunner.query(
      `CREATE TABLE "order_item" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "quantity" integer NOT NULL, "price_at_purchase" double precision NOT NULL, "order_id" uuid NOT NULL, "product_id" uuid NOT NULL, CONSTRAINT "PK_d01158fe15b1ead5c26fd7f4e90" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "Index_order_item_product_id" ON "order_item" ("product_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "Index_order_item_order_id" ON "order_item" ("order_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."order_status_enum" AS ENUM('created', 'updated', 'in_progress', 'closed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "order" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "idempotency_key" character varying NOT NULL, "delivery_address" character varying NOT NULL, "order_status" "public"."order_status_enum" NOT NULL DEFAULT 'created', "user_id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_1031171c13130102495201e3e20" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "Index_idempotency_key_unique" ON "order" ("idempotency_key") `,
    );
    await queryRunner.query(
      `CREATE INDEX "Index_order_created_at" ON "order" ("created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "Index_order_user_id" ON "order" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."file_status" AS ENUM('pending', 'ready')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."file_visibility" AS ENUM('private', 'public')`,
    );
    await queryRunner.query(
      `CREATE TABLE "file" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "key" character varying NOT NULL, "content_type" character varying NOT NULL, "size" integer, "status" "public"."file_status" NOT NULL DEFAULT 'pending', "visibility" "public"."file_visibility" NOT NULL DEFAULT 'private', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_e4a453ce0a609a5f94c66afb6ca" UNIQUE ("key"), CONSTRAINT "PK_36b46d232307066b3a2c9ea3a1d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "Index_file_created_at" ON "file" ("created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "Index_file_user_id" ON "file" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "login" character varying NOT NULL, "password" character varying NOT NULL, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "email" character varying NOT NULL, "address" character varying NOT NULL, "phone_number" character varying NOT NULL, "post_code" character varying NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "avatar_id" uuid, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "REL_b777e56620c3f1ac0308514fc4" UNIQUE ("avatar_id"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "Index_users_login_password_unique" ON "user" ("login", "password") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "Index_users_login_unique" ON "user" ("email") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "Index_users_email_unique" ON "user" ("email") `,
    );
    await queryRunner.query(
      `CREATE TABLE "role" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "role" character varying NOT NULL, CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "Index_role_unique" ON "role" ("role") `,
    );
    await queryRunner.query(
      `CREATE TABLE "user_role" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "role_id" uuid NOT NULL, CONSTRAINT "PK_fb2e442d14add3cefbdf33c4561" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "role_to_scope" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "role_id" uuid NOT NULL, "scope_id" uuid NOT NULL, CONSTRAINT "PK_5ed81971bf751473fa5ec8120fb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "Index_role_scope_unique" ON "role_to_scope" ("role_id", "scope_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "refresh_token" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" character varying NOT NULL, "token" character varying NOT NULL, "is_active" boolean NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_b575dd3c21fb0831013c909e7fe" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "Index_token_unique" ON "refresh_token" ("token") `,
    );
    await queryRunner.query(
      `CREATE TABLE "user_roles_role" ("userId" uuid NOT NULL, "roleId" uuid NOT NULL, CONSTRAINT "PK_b47cd6c84ee205ac5a713718292" PRIMARY KEY ("userId", "roleId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5f9286e6c25594c6b88c108db7" ON "user_roles_role" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4be2f7adf862634f5f803d246b" ON "user_roles_role" ("roleId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "role_scopes_scope" ("roleId" uuid NOT NULL, "scopeId" uuid NOT NULL, CONSTRAINT "PK_696ec3bec6b38875b26b1f0f44f" PRIMARY KEY ("roleId", "scopeId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9891f07b0cac0cd80fb0694d31" ON "role_scopes_scope" ("roleId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e9df80f734de6a00462f6d516b" ON "role_scopes_scope" ("scopeId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "FK_0dce9bc93c2d2c399982d04bef1" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" ADD CONSTRAINT "FK_e9674a6053adbaa1057848cddfa" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" ADD CONSTRAINT "FK_5e17c017aa3f5164cb2da5b1c6b" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ADD CONSTRAINT "FK_199e32a02ddc0f47cd93181d8fd" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "file" ADD CONSTRAINT "FK_516f1cf15166fd07b732b4b6ab0" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_b777e56620c3f1ac0308514fc4c" FOREIGN KEY ("avatar_id") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role" ADD CONSTRAINT "FK_d0e5815877f7395a198a4cb0a46" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role" ADD CONSTRAINT "FK_32a6fc2fcb019d8e3a8ace0f55f" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_to_scope" ADD CONSTRAINT "FK_68cd07c817f2082a69d768b5a79" FOREIGN KEY ("scope_id") REFERENCES "scope"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_to_scope" ADD CONSTRAINT "FK_462460162c40f3277e7cdef419a" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles_role" ADD CONSTRAINT "FK_5f9286e6c25594c6b88c108db77" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles_role" ADD CONSTRAINT "FK_4be2f7adf862634f5f803d246b8" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_scopes_scope" ADD CONSTRAINT "FK_9891f07b0cac0cd80fb0694d311" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_scopes_scope" ADD CONSTRAINT "FK_e9df80f734de6a00462f6d516b1" FOREIGN KEY ("scopeId") REFERENCES "scope"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE TABLE "configurable-table-query-result-cache" ("id" SERIAL NOT NULL, "identifier" character varying, "time" bigint NOT NULL, "duration" integer NOT NULL, "query" text NOT NULL, "result" text NOT NULL, CONSTRAINT "PK_21a78ca157d92cebb96c8ff9f01" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TABLE "configurable-table-query-result-cache"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_scopes_scope" DROP CONSTRAINT "FK_e9df80f734de6a00462f6d516b1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_scopes_scope" DROP CONSTRAINT "FK_9891f07b0cac0cd80fb0694d311"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles_role" DROP CONSTRAINT "FK_4be2f7adf862634f5f803d246b8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles_role" DROP CONSTRAINT "FK_5f9286e6c25594c6b88c108db77"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_to_scope" DROP CONSTRAINT "FK_462460162c40f3277e7cdef419a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_to_scope" DROP CONSTRAINT "FK_68cd07c817f2082a69d768b5a79"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role" DROP CONSTRAINT "FK_32a6fc2fcb019d8e3a8ace0f55f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role" DROP CONSTRAINT "FK_d0e5815877f7395a198a4cb0a46"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_b777e56620c3f1ac0308514fc4c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "file" DROP CONSTRAINT "FK_516f1cf15166fd07b732b4b6ab0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" DROP CONSTRAINT "FK_199e32a02ddc0f47cd93181d8fd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" DROP CONSTRAINT "FK_5e17c017aa3f5164cb2da5b1c6b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" DROP CONSTRAINT "FK_e9674a6053adbaa1057848cddfa"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP CONSTRAINT "FK_0dce9bc93c2d2c399982d04bef1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e9df80f734de6a00462f6d516b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9891f07b0cac0cd80fb0694d31"`,
    );
    await queryRunner.query(`DROP TABLE "role_scopes_scope"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4be2f7adf862634f5f803d246b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5f9286e6c25594c6b88c108db7"`,
    );
    await queryRunner.query(`DROP TABLE "user_roles_role"`);
    await queryRunner.query(`DROP INDEX "public"."Index_token_unique"`);
    await queryRunner.query(`DROP TABLE "refresh_token"`);
    await queryRunner.query(`DROP INDEX "public"."Index_role_scope_unique"`);
    await queryRunner.query(`DROP TABLE "role_to_scope"`);
    await queryRunner.query(`DROP TABLE "user_role"`);
    await queryRunner.query(`DROP INDEX "public"."Index_role_unique"`);
    await queryRunner.query(`DROP TABLE "role"`);
    await queryRunner.query(`DROP INDEX "public"."Index_users_email_unique"`);
    await queryRunner.query(`DROP INDEX "public"."Index_users_login_unique"`);
    await queryRunner.query(
      `DROP INDEX "public"."Index_users_login_password_unique"`,
    );
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP INDEX "public"."Index_file_user_id"`);
    await queryRunner.query(`DROP INDEX "public"."Index_file_created_at"`);
    await queryRunner.query(`DROP TABLE "file"`);
    await queryRunner.query(`DROP TYPE "public"."file_visibility"`);
    await queryRunner.query(`DROP TYPE "public"."file_status"`);
    await queryRunner.query(`DROP INDEX "public"."Index_order_user_id"`);
    await queryRunner.query(`DROP INDEX "public"."Index_order_created_at"`);
    await queryRunner.query(
      `DROP INDEX "public"."Index_idempotency_key_unique"`,
    );
    await queryRunner.query(`DROP TABLE "order"`);
    await queryRunner.query(`DROP TYPE "public"."order_status_enum"`);
    await queryRunner.query(`DROP INDEX "public"."Index_order_item_order_id"`);
    await queryRunner.query(
      `DROP INDEX "public"."Index_order_item_product_id"`,
    );
    await queryRunner.query(`DROP TABLE "order_item"`);
    await queryRunner.query(`DROP INDEX "public"."Index_product_price"`);
    await queryRunner.query(`DROP INDEX "public"."Index_product_category_id"`);
    await queryRunner.query(`DROP TABLE "product"`);
    await queryRunner.query(`DROP TABLE "category"`);
    await queryRunner.query(`DROP INDEX "public"."Index_scope_unique"`);
    await queryRunner.query(`DROP TABLE "scope"`);
  }
}
