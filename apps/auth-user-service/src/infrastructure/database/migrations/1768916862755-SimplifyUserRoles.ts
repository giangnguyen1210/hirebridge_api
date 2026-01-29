import { MigrationInterface, QueryRunner } from "typeorm";

export class SimplifyUserRoles1768916862755 implements MigrationInterface {
    name = 'SimplifyUserRoles1768916862755'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Step 1: Drop old tables (if exist)
        await queryRunner.query(`DROP TABLE IF EXISTS "user_roles" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "roles" CASCADE`);
        
        // Step 2: Create enum types
        await queryRunner.query(`CREATE TYPE "public"."users_roles_enum" AS ENUM('ADMIN', 'CLIENT', 'FREELANCER')`)
;
        await queryRunner.query(`CREATE TYPE "public"."users_activerole_enum" AS ENUM('ADMIN', 'CLIENT', 'FREELANCER')`);
        
        // Step 3: Add new columns
        await queryRunner.query(`ALTER TABLE "users" ADD "roles" "public"."users_roles_enum" array NOT NULL DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "users" ADD "activeRole" "public"."users_activerole_enum"`);
        
        // Step 4: Set default role for existing users (if any)
        await queryRunner.query(`UPDATE "users" SET "roles" = ARRAY['CLIENT']::"public"."users_roles_enum"[] WHERE "roles" = '{}'`);
        await queryRunner.query(`UPDATE "users" SET "activeRole" = 'CLIENT'::"public"."users_activerole_enum" WHERE "activeRole" IS NULL AND array_length("roles", 1) > 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert changes
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "activeRole"`);
        await queryRunner.query(`DROP TYPE "public"."users_activerole_enum"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "roles"`);
        await queryRunner.query(`DROP TYPE "public"."users_roles_enum"`);
        
        // Recreate old tables (optional - for full rollback)
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "roles" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "code" character varying(50) NOT NULL,
                "name" character varying(100) NOT NULL,
                CONSTRAINT "PK_roles" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_roles_code" UNIQUE ("code")
            )
        `);
        
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "user_roles" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "userId" uuid NOT NULL,
                "roleId" uuid NOT NULL,
                CONSTRAINT "PK_user_roles" PRIMARY KEY ("id"),
                CONSTRAINT "FK_472b25323af01488f1f66a06b67" FOREIGN KEY ("userId") 
                    REFERENCES "users"("id") ON DELETE CASCADE
            )
        `);
        
        // Insert default roles
        await queryRunner.query(`
            INSERT INTO "roles" ("code", "name") VALUES
                ('ADMIN', 'Administrator'),
                ('CLIENT', 'Client'),
                ('FREELANCER', 'Freelancer')
            ON CONFLICT ("code") DO NOTHING
        `);
    }

}
