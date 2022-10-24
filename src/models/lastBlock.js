import db from "./db";

const LastBlock = db.sequelize.define("lastBlock", {
  block: {
    type: db.Sequelize.NUMBER,
  },
});

export default LastBlock;
