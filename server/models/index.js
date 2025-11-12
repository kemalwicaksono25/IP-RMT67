const { Sequelize } = require("sequelize");
require("dotenv").config();

// Use config.js for development, DATABASE_URL for production
const config = require("../config/config.js");
const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];

let sequelize;
if (dbConfig.use_env_variable) {
  sequelize = new Sequelize(process.env[dbConfig.use_env_variable], {
    dialect: "postgres",
    logging: env === "development" ? console.log : false,
  });
} else {
  sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
      host: dbConfig.host,
      dialect: "postgres",
      logging: env === "development" ? console.log : false,
    }
  );
}

const db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Import models
db.Project = require("./project")(sequelize, Sequelize);
db.User = require("./user")(sequelize, Sequelize);
db.Product = require("./product")(sequelize, Sequelize);
db.Brief = require("./brief")(sequelize, Sequelize);
db.BriefDetail = require("./briefDetail")(sequelize, Sequelize);
db.Comment = require("./comment")(sequelize, Sequelize);

// Define associations
// Project associations
db.Project.hasMany(db.User, { foreignKey: "ProjectId", as: "users" });
db.Project.hasMany(db.Product, { foreignKey: "ProjectId", as: "products" });
db.Project.hasMany(db.Brief, { foreignKey: "ProjectId", as: "briefs" });
db.Project.hasMany(db.BriefDetail, {
  foreignKey: "ProjectId",
  as: "briefDetails",
});
db.Project.hasMany(db.Comment, { foreignKey: "ProjectId", as: "comments" });

// User associations
db.User.belongsTo(db.Project, { foreignKey: "ProjectId", as: "project" });
db.User.hasMany(db.Brief, { foreignKey: "UserId", as: "briefs" });
db.User.hasMany(db.Comment, { foreignKey: "UserId", as: "comments" });

// Product associations
db.Product.belongsTo(db.Project, { foreignKey: "ProjectId", as: "project" });
db.Product.hasMany(db.Brief, { foreignKey: "ProductId", as: "briefs" });

// Brief associations
db.Brief.belongsTo(db.Project, { foreignKey: "ProjectId", as: "project" });
db.Brief.belongsTo(db.Product, { foreignKey: "ProductId", as: "product" });
db.Brief.belongsTo(db.User, { foreignKey: "UserId", as: "user" });
db.Brief.hasMany(db.BriefDetail, { foreignKey: "BriefId", as: "details" });
db.Brief.hasMany(db.Comment, { foreignKey: "BriefId", as: "comments" });

// BriefDetail associations
db.BriefDetail.belongsTo(db.Brief, { foreignKey: "BriefId", as: "brief" });
db.BriefDetail.belongsTo(db.Project, {
  foreignKey: "ProjectId",
  as: "project",
});

// Comment associations
db.Comment.belongsTo(db.Brief, { foreignKey: "BriefId", as: "brief" });
db.Comment.belongsTo(db.User, { foreignKey: "UserId", as: "user" });
db.Comment.belongsTo(db.Project, { foreignKey: "ProjectId", as: "project" });

module.exports = db;

