const { DataTypes } = require("sequelize");
const { BRIEF_DETAIL_STATUS, CONTENT_TAG } = require("../helpers/enums");

module.exports = (sequelize) => {
  const BriefDetail = sequelize.define(
    "BriefDetail",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      BriefId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Briefs",
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
      platform: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      tag: {
        type: DataTypes.ENUM(
          CONTENT_TAG.VIDEO,
          CONTENT_TAG.CAROUSEL,
          CONTENT_TAG.IMAGE
        ),
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      funnel: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      cta: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      detail: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      caption: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      hashtags: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },
      status: {
        type: DataTypes.ENUM(
          BRIEF_DETAIL_STATUS.DRAFT,
          BRIEF_DETAIL_STATUS.READY,
          BRIEF_DETAIL_STATUS.PENDING_APPROVAL,
          BRIEF_DETAIL_STATUS.APPROVED,
          BRIEF_DETAIL_STATUS.REJECTED,
          BRIEF_DETAIL_STATUS.SCHEDULED
        ),
        defaultValue: BRIEF_DETAIL_STATUS.DRAFT,
      },
      scheduledAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      rejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "BriefDetails",
      timestamps: true,
    }
  );

  return BriefDetail;
};

