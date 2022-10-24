import db from "./db";

const Lesson3 = db.sequelize.define("lesson3", {
  block: {
    type: db.Sequelize.NUMBER,
  },
  index: {
    type: db.Sequelize.NUMBER,
  },
  account: {
    type: db.Sequelize.STRING,
  },
  robot: {
    type: db.Sequelize.STRING,
  },
  data: {
    type: db.Sequelize.STRING,
  },
});

export default Lesson3;

export async function createLesson3(item) {
  const row = await Lesson3.findOne({
    where: { block: item.block, index: item.index },
  });
  if (!row) {
    await Lesson3.create({
      block: item.block,
      index: item.index,
      account: item.AccountId,
      robot: item.RobotId,
      data: item.Record,
    });
  }
}
