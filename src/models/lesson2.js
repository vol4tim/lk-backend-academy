import db from "./db";
import { checkCorrectAnswers } from "../utils/tools";
import correct_ans_lesson2 from "../../lesson-2-correct-answers.json";

const Lesson2 = db.sequelize.define("lesson2", {
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
  corrects: {
    type: db.Sequelize.NUMBER,
  },
});

export default Lesson2;

export async function createLesson2(item) {
  const row = await Lesson2.findOne({
    where: { block: item.block, index: item.index },
  });
  if (!row) {
    await Lesson2.create({
      block: item.block,
      index: item.index,
      account: item.AccountId,
      time: item.Moment,
      data: JSON.stringify(item.Record),
      corrects: checkCorrectAnswers(item.Record.data, correct_ans_lesson2),
    });
  }
}
