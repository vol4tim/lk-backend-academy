import db from "./db";
import { checkCorrectAnswers } from "../utils/tools";
import correct_ans_lesson4 from "../../lesson-4-correct-answers.json";

const Lesson4 = db.sequelize.define("lesson4", {
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

export default Lesson4;

export async function createLesson4(item) {
  const row = await Lesson4.findOne({
    where: { block: item.block, index: item.index },
  });
  if (!row) {
    await Lesson4.create({
      block: item.block,
      index: item.index,
      account: item.AccountId,
      time: item.Moment,
      data: JSON.stringify(item.Record),
      corrects: checkCorrectAnswers(item.Record.data, correct_ans_lesson4),
    });
  }
}
