import Sequelize from "sequelize";
import path from "path";

export const PATH_DB = path.join(__dirname, "/../../files/database.sqlite");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: PATH_DB,
  logging: false,
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.model = {};

export default db;
