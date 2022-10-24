import db from "./db";

const Lesson1 = db.sequelize.define("lesson1", {
  block: {
    type: db.Sequelize.NUMBER,
  },
  index: {
    type: db.Sequelize.NUMBER,
  },
  account: {
    type: db.Sequelize.STRING,
  },
  time: {
    type: db.Sequelize.STRING,
  },
  data: {
    type: db.Sequelize.STRING,
  },
});

export default Lesson1;

export async function createLesson1(item) {
  const row = await Lesson1.findOne({
    where: { block: item.block, index: item.index },
  });
  if (!row) {
    await Lesson1.create({
      block: item.block,
      index: item.index,
      account: item.AccountId,
      time: item.Moment,
      data: JSON.stringify(item.Record),
    });
  }
}
