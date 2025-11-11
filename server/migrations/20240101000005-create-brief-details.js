"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("BriefDetails", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      BriefId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Briefs",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      ProjectId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Projects",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      platform: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      tag: {
        type: Sequelize.ENUM("video", "carousel", "image"),
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      funnel: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      cta: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      detail: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      caption: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      hashtags: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: [],
      },
      status: {
        type: Sequelize.ENUM("draft", "ready", "approved", "scheduled"),
        defaultValue: "draft",
      },
      scheduledAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("BriefDetails");
  },
};

