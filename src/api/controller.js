import Lesson1 from "../models/lesson1";
import Lesson2 from "../models/lesson2";
import Lesson3 from "../models/lesson3";
import Lesson4 from "../models/lesson4";
import Lesson5 from "../models/lesson5";
import Users from "../models/users";
import { authorizer } from "./route";

export default {
  async auth(req, res) {
    const address = req.body.address;
    const signature = req.body.signature;

    const result = authorizer(address, signature);

    res.send({
      ...result,
    });
  },
  async users(req, res) {
    let users = await Users.findAll({
      attributes: ["account"],
    });

    let lesson1 = await Lesson1.findAll({
      attributes: ["account"],
      group: ["account"],
    });
    lesson1 = lesson1.map((item) => item.account);

    const lesson2 = await Lesson2.findAll({
      attributes: ["account", "corrects"],
      order: [["block", "ASC"]],
    });
    const accounts2 = {};
    for (const lesson of lesson2) {
      if (!accounts2[lesson.account]) {
        accounts2[lesson.account] = {
          count: 0,
          passed: false,
        };
      }
      if (lesson.corrects >= 10) {
        accounts2[lesson.account].passed = true;
      }
      accounts2[lesson.account].count += 1;
    }

    let lesson3 = await Lesson3.findAll({
      attributes: ["account"],
      group: ["account"],
    });
    lesson3 = lesson3.map((item) => item.account);

    const lesson4 = await Lesson4.findAll({
      attributes: ["account", "corrects"],
      order: [["block", "ASC"]],
    });
    const accounts4 = {};
    for (const lesson of lesson4) {
      if (!accounts4[lesson.account]) {
        accounts4[lesson.account] = {
          count: 0,
          passed: false,
        };
      }
      if (lesson.corrects >= 7) {
        accounts4[lesson.account].passed = true;
      }
      accounts4[lesson.account].count += 1;
    }

    const lesson5 = await Lesson5.findAll({
      attributes: ["account", "ledger", "devices"],
    });
    const accounts5 = {};
    for (const lesson of lesson5) {
      accounts5[lesson.account] =
        Boolean(lesson.ledger) && Boolean(lesson.devices);
    }

    users = users.map((item) => {
      return {
        account: item.account,
        lesson1: Boolean(lesson1.includes(item.account)),
        lesson2: accounts2[item.account] || {
          count: 0,
          passed: false,
        },
        lesson3: Boolean(lesson3.includes(item.account)),
        lesson4: accounts4[item.account] || {
          count: 0,
          passed: false,
        },
        lesson5: Boolean(accounts5[item.account]),
      };
    });

    res.send({
      result: {
        users,
      },
    });
  },
  async user(req, res) {
    const account = String(req.params.account);

    const lesson1 = await Lesson1.findAll({
      attributes: ["block", "index", "time", "data"],
      where: { account },
      order: [["block", "ASC"]],
      raw: true,
    });
    const lesson2 = await Lesson2.findAll({
      attributes: ["block", "index", "time", "data", "corrects"],
      where: { account },
      order: [["block", "ASC"]],
      raw: true,
    });
    const lesson3 = await Lesson3.findAll({
      attributes: ["block", "index", "data"],
      where: { account },
      order: [["block", "ASC"]],
      raw: true,
    });
    const lesson4 = await Lesson4.findAll({
      attributes: ["block", "index", "time", "data", "corrects"],
      where: { account },
      order: [["block", "ASC"]],
      raw: true,
    });
    const lesson5 = await Lesson5.findOne({
      attributes: ["ledger", "devices"],
      where: { account },
      order: [["block", "ASC"]],
      raw: true,
    });
    res.send({
      result: {
        lesson1,
        lesson2: { list: lesson2, count: lesson2.length },
        lesson3,
        lesson4: { list: lesson4, count: lesson4.length },
        lesson5,
      },
    });
  },
};
