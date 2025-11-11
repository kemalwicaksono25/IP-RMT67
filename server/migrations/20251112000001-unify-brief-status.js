"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Step 1: Alter ENUM for Briefs table
    // PostgreSQL requires dropping and recreating the ENUM type
    await queryInterface.sequelize.query(`
      -- Create new ENUM type
      CREATE TYPE "enum_Briefs_status_new" AS ENUM ('draft', 'ready', 'pending_approval', 'approved', 'rejected', 'scheduled');
      
      -- Remove default constraint temporarily
      ALTER TABLE "Briefs" ALTER COLUMN status DROP DEFAULT;
      
      -- Alter table to use new type
      ALTER TABLE "Briefs" 
      ALTER COLUMN status TYPE "enum_Briefs_status_new" 
      USING status::text::"enum_Briefs_status_new";
      
      -- Set new default
      ALTER TABLE "Briefs" ALTER COLUMN status SET DEFAULT 'draft'::"enum_Briefs_status_new";
      
      -- Drop old ENUM type
      DROP TYPE IF EXISTS "enum_Briefs_status";
      
      -- Rename new type to old name
      ALTER TYPE "enum_Briefs_status_new" RENAME TO "enum_Briefs_status";
    `);

    // Step 3: Alter ENUM for BriefDetails table
    await queryInterface.sequelize.query(`
      -- Create new ENUM type
      CREATE TYPE "enum_BriefDetails_status_new" AS ENUM ('draft', 'ready', 'pending_approval', 'approved', 'rejected', 'scheduled');
      
      -- Remove default constraint temporarily
      ALTER TABLE "BriefDetails" ALTER COLUMN status DROP DEFAULT;
      
      -- Alter table to use new type
      ALTER TABLE "BriefDetails" 
      ALTER COLUMN status TYPE "enum_BriefDetails_status_new" 
      USING status::text::"enum_BriefDetails_status_new";
      
      -- Set new default
      ALTER TABLE "BriefDetails" ALTER COLUMN status SET DEFAULT 'draft'::"enum_BriefDetails_status_new";
      
      -- Drop old ENUM type
      DROP TYPE IF EXISTS "enum_BriefDetails_status";
      
      -- Rename new type to old name
      ALTER TYPE "enum_BriefDetails_status_new" RENAME TO "enum_BriefDetails_status";
    `);
  },

  async down(queryInterface, Sequelize) {
    // Revert Briefs ENUM
    await queryInterface.sequelize.query(`
      -- Update data back
      UPDATE "Briefs" 
      SET status = 'pending_approval' 
      WHERE status = 'ready';
      
      -- Revert ENUM type
      CREATE TYPE "enum_Briefs_status_old" AS ENUM ('draft', 'pending_approval', 'approved', 'rejected');
      
      ALTER TABLE "Briefs" 
      ALTER COLUMN status TYPE "enum_Briefs_status_old" 
      USING status::text::"enum_Briefs_status_old";
      
      DROP TYPE IF EXISTS "enum_Briefs_status";
      ALTER TYPE "enum_Briefs_status_old" RENAME TO "enum_Briefs_status";
    `);

    // Revert BriefDetails ENUM
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_BriefDetails_status_old" AS ENUM ('draft', 'ready', 'approved', 'scheduled');
      
      ALTER TABLE "BriefDetails" 
      ALTER COLUMN status TYPE "enum_BriefDetails_status_old" 
      USING status::text::"enum_BriefDetails_status_old";
      
      DROP TYPE IF EXISTS "enum_BriefDetails_status";
      ALTER TYPE "enum_BriefDetails_status_old" RENAME TO "enum_BriefDetails_status";
    `);
  },
};

