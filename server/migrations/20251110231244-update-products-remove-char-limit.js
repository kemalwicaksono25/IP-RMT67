"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Ubah kolom name, imageUrl, dan link dari VARCHAR(255) menjadi TEXT
    await queryInterface.changeColumn("Products", "name", {
      type: Sequelize.TEXT,
      allowNull: false,
    });

    await queryInterface.changeColumn("Products", "imageUrl", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.changeColumn("Products", "link", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // Rollback: ubah kembali ke STRING (VARCHAR(255))
    await queryInterface.changeColumn("Products", "name", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn("Products", "imageUrl", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn("Products", "link", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
