const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Product = sequelize.define(
    "Product",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      imageUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      imageUrls: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        defaultValue: [],
        allowNull: true,
      },
      link: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      pains: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },
      gains: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },
      goals: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },
      ProjectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Projects",
          key: "id",
        },
      },
    },
    {
      tableName: "Products",
      timestamps: true,
    }
  );

  return Product;
};

