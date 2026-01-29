import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Migration: Simplify User Roles
 * 
 * Changes:
 * 1. Add 'roles' column (array of enums) to users table
 * 2. Add 'activeRole' column (enum) to users table
 * 3. Migrate data from user_roles + roles tables to users.roles
 * 4. Drop user_roles and roles tables
 * 5. Remove defaultRole column
 */
export class SimplifyUserRoles1234567890123 implements MigrationInterface {
    name = 'SimplifyUserRoles1234567890123'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Step 1: Create enum type if not exists
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE "user_role_enum" AS ENUM ('ADMIN', 'CLIENT', 'FREELANCER');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        // Step 2: Add new columns to users table
        await queryRunner.query(`
            ALTER TABLE "users" 
            ADD COLUMN IF NOT EXISTS "roles" "user_role_enum"[] DEFAULT '{}',
            ADD COLUMN IF NOT EXISTS "activeRole" "user_role_enum"
        `);

        // Step 3: Migrate data from old structure (if tables exist)
        // This assumes you have existing data in user_roles and roles tables
        const hasOldTables = await queryRunner.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'user_roles'
            );
        `);

        if (hasOldTables[0].exists) {
            // Migrate roles data
            await queryRunner.query(`
                UPDATE "users" u
                SET "roles" = ARRAY(
                    SELECT r.code::user_role_enum
                    FROM "user_roles" ur 
                    JOIN "roles" r ON ur."roleId" = r.id 
                    WHERE ur."userId" = u.id
                )
                WHERE EXISTS (
                    SELECT 1 FROM "user_roles" ur WHERE ur."userId" = u.id
                );
            `);

            // Set activeRole to first role or from defaultRole
            await queryRunner.query(`
                UPDATE "users" 
                SET "activeRole" = "roles"[1]
                WHERE array_length("roles", 1) > 0 AND "activeRole" IS NULL;
            `);

            // Drop old tables
            await queryRunner.query(`DROP TABLE IF EXISTS "user_roles" CASCADE`);
            await queryRunner.query(`DROP TABLE IF EXISTS "roles" CASCADE`);
        }

        // Step 4: Remove defaultRole column if exists
        await queryRunner.query(`
            ALTER TABLE "users" 
            DROP COLUMN IF EXISTS "defaultRole"
        `);

        // Step 5: Add check constraint (optional but recommended)
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "check_active_role_in_roles"
            CHECK (
                "activeRole" IS NULL OR 
                "activeRole" = ANY("roles")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert changes (recreate old structure)
        
        // Step 1: Remove check constraint
        await queryRunner.query(`
            ALTER TABLE "users"
            DROP CONSTRAINT IF EXISTS "check_active_role_in_roles"
        `);

        // Step 2: Recreate roles table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "roles" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "code" character varying(50) NOT NULL,
                "name" character varying(100) NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_roles" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_roles_code" UNIQUE ("code")
            )
        `);

        // Step 3: Recreate user_roles table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "user_roles" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userId" uuid NOT NULL,
                "roleId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_user_roles" PRIMARY KEY ("id"),
                CONSTRAINT "FK_user_roles_user" FOREIGN KEY ("userId") 
                    REFERENCES "users"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_user_roles_role" FOREIGN KEY ("roleId") 
                    REFERENCES "roles"("id") ON DELETE CASCADE
            )
        `);

        // Step 4: Insert default roles
        await queryRunner.query(`
            INSERT INTO "roles" ("code", "name") VALUES
                ('ADMIN', 'Administrator'),
                ('CLIENT', 'Client'),
                ('FREELANCER', 'Freelancer')
            ON CONFLICT ("code") DO NOTHING
        `);

        // Step 5: Migrate data back (if needed)
        await queryRunner.query(`
            INSERT INTO "user_roles" ("userId", "roleId")
            SELECT 
                u.id,
                r.id
            FROM "users" u
            CROSS JOIN LATERAL unnest(u.roles) AS role_code
            JOIN "roles" r ON r.code = role_code::text
            WHERE array_length(u.roles, 1) > 0
        `);

        // Step 6: Add defaultRole column back
        await queryRunner.query(`
            ALTER TABLE "users" 
            ADD COLUMN IF NOT EXISTS "defaultRole" character varying
        `);

        // Set defaultRole from activeRole
        await queryRunner.query(`
            UPDATE "users" 
            SET "defaultRole" = "activeRole"::text
            WHERE "activeRole" IS NOT NULL
        `);

        // Step 7: Remove new columns
        await queryRunner.query(`
            ALTER TABLE "users" 
            DROP COLUMN IF EXISTS "roles",
            DROP COLUMN IF EXISTS "activeRole"
        `);

        // Step 8: Drop enum type
        await queryRunner.query(`
            DROP TYPE IF EXISTS "user_role_enum"
        `);
    }
}
