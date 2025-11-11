const { DataTypes } = require("sequelize");
const {
  BRIEF_STATUS,
  FUNNEL_STAGE,
} = require("../helpers/enums");

module.exports = (sequelize) => {
  const Brief = sequelize.define(
    "Brief",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      ProductId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Products",
          key: "id",
        },
      },
      UserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      ProjectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Projects",
          key: "id",
        },
      },
      funnelStage: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      briefType: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      toneOfVoice: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      targetMarket: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(
          BRIEF_STATUS.DRAFT,
          BRIEF_STATUS.READY,
          BRIEF_STATUS.PENDING_APPROVAL,
          BRIEF_STATUS.APPROVED,
          BRIEF_STATUS.REJECTED,
          BRIEF_STATUS.SCHEDULED
        ),
        defaultValue: BRIEF_STATUS.DRAFT,
      },
      rejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "Briefs",
      timestamps: true,
    }
  );

  return Brief;
};

