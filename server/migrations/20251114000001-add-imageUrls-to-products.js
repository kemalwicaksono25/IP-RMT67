"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Products", "imageUrls", {
      type: Sequelize.ARRAY(Sequelize.TEXT),
      allowNull: true,
      defaultValue: [],
    });
    
    // Migrate existing imageUrl to imageUrls array
    await queryInterface.sequelize.query(`
      UPDATE "Products"
      SET "imageUrls" = CASE 
        WHEN "imageUrl" IS NOT NULL AND "imageUrl" != '' 
        THEN ARRAY["imageUrl"]
        ELSE ARRAY[]::TEXT[]
      END
      WHERE "imageUrls" IS NULL;
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Products", "imageUrls");
  },
};

