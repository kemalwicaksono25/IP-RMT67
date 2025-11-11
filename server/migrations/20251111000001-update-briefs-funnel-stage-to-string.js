"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // For PostgreSQL: Change funnelStage from ENUM to STRING to support multiple values (comma-separated)
    // PostgreSQL requires casting ENUM to TEXT/VARCHAR
    await queryInterface.sequelize.query(`
      ALTER TABLE "Briefs" 
      ALTER COLUMN "funnelStage" TYPE VARCHAR(255) 
      USING "funnelStage"::text;
    `);
  },

  async down(queryInterface, Sequelize) {
    // Revert back to ENUM - need to recreate the ENUM type first
    // Note: This will fail if there are values that don't match the ENUM
    await queryInterface.sequelize.query(`
      DO $$ 
      BEGIN
        -- Create ENUM type if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_Briefs_funnelStage') THEN
          CREATE TYPE "enum_Briefs_funnelStage" AS ENUM (
            'awareness',
            'consideration',
            'retargeting_visitor',
            'retargeting_atc_not_purchase',
            'after_purchase',
            'revenue',
            'loyalty'
          );
        END IF;
      END $$;
    `);
    
    await queryInterface.sequelize.query(`
      ALTER TABLE "Briefs" 
      ALTER COLUMN "funnelStage" TYPE "enum_Briefs_funnelStage" 
      USING "funnelStage"::text::"enum_Briefs_funnelStage";
    `);
  },
};

