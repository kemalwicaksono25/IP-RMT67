const { DataTypes } = require("sequelize");
const { USER_ROLE } = require("../helpers/enums");

module.exports = (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM(USER_ROLE.ADMIN, USER_ROLE.STAFF),
        allowNull: false,
        defaultValue: USER_ROLE.STAFF,
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
      tableName: "Users",
      timestamps: true,
    }
  );

  return User;
};

