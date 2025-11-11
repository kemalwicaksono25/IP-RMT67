"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Briefs", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      ProductId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Products",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      UserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
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
      funnelStage: {
        type: Sequelize.ENUM(
          "awareness",
          "consideration",
          "retargeting_visitor",
          "retargeting_atc_not_purchase",
          "after_purchase",
          "revenue",
          "loyalty"
        ),
        allowNull: false,
      },
      briefType: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      toneOfVoice: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      targetMarket: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM(
          "draft",
          "pending_approval",
          "approved",
          "rejected"
        ),
        defaultValue: "draft",
      },
      rejectionReason: {
        type: Sequelize.TEXT,
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
    await queryInterface.dropTable("Briefs");
  },
};

