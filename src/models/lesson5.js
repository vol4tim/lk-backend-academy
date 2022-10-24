import db from "./db";

const Lesson5 = db.sequelize.define("lesson5", {
  block: {
    type: db.Sequelize.NUMBER,
  },
  index: {
    type: db.Sequelize.NUMBER,
  },
  account: {
    type: db.Sequelize.STRING,
  },
  ledger: {
    type: db.Sequelize.BOOLEAN,
  },
  devices: {
    type: db.Sequelize.BOOLEAN,
  },
});

export default Lesson5;
