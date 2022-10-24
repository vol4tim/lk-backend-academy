import axios from "axios";
import rateLimit from "axios-rate-limit";
import { robonomics } from "../utils/parachain";
import Users from "../models/users";
import { createLesson1 } from "../models/lesson1";
import { createLesson2 } from "../models/lesson2";
import { createLesson3 } from "../models/lesson3";
import { createLesson4 } from "../models/lesson4";
import logger from "../utils/logger";
import { encodeAddress } from "@polkadot/util-crypto";
import config from "../config";

const COUNT = config.subscan_api.COUNT;
const ROBOT_ID = config.subscan_api.ROBOT_ID;
const API_TOKEN = config.subscan_api.TOKEN;

const http = rateLimit(axios.create(), {
  maxRequests: 5,
  perMilliseconds: 1000,
});

function sleep(sec) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, sec);
  });
}

async function api(type, data, page = 0) {
  if (page >= 4) {
    logger.warn(
      JSON.stringify({
        type,
        page,
        ...data,
      })
    );
    return {
      count: 0,
    };
  }
  const result = await http.post(
    `https://robonomics.api.subscan.io/api/scan/${type}`,
    {
      row: COUNT,
      page: page,
      ...data,
    },
    {
      header: {
        "X-API-Key": API_TOKEN,
      },
    }
  );
  console.log({
    limit: result.headers["ratelimit-limit"],
    remaining: result.headers["ratelimit-remaining"],
    reset: result.headers["ratelimit-reset"],
  });
  if (Number(result.headers["ratelimit-remaining"]) === 0) {
    console.log("sleep");
    await sleep(result.headers["ratelimit-reset"] * 1000);
    console.log("go");
  }

  // process.exit(0);
  return result.data.data;
}

async function getLessonDatalog(account, page = 0) {
  const result = await api(
    "events",
    {
      address: account,
      module: "datalog",
      call: "newrecord",
      finalized: true,
    },
    page
  );
  let rows = [];
  if (result.count > 0) {
    for (const event of result.events) {
      try {
        const params = {
          block: event.block_num,
          index: event.extrinsic_idx,
        };

        const data = JSON.parse(event.params);
        params.AccountId = encodeAddress(data[0].value, 32);
        params.Moment = String(data[1].value);
        params.Record = JSON.parse(data[2].value);
        if (params.Record.blackmirror || params.Record.lesson) {
          rows.push(params);
        }
      } catch (error) {
        logger.error(
          `Parse datalog events ${account} ${event.block_num}-${event.extrinsic_idx}`
        );
      }
    }

    if (page === 0 && result.events.length === COUNT) {
      const pages = Math.ceil(result.count / COUNT) - 1;
      for (let page = 1; page <= pages; page++) {
        rows = [...rows, ...(await getLessonDatalog(account, page))];
      }
    }
  }
  return rows;
}
async function getLessonLaunch(account, page = 0) {
  const result = await api(
    "events",
    {
      address: account,
      module: "launch",
      call: "newlaunch",
      finalized: true,
    },
    page
  );
  let rows = [];
  if (result.count > 0) {
    for (const event of result.events) {
      try {
        const params = {
          block: event.block_num,
          index: event.extrinsic_idx,
        };
        const data = JSON.parse(event.params);
        params.AccountId = encodeAddress(data[0].value, 32);
        params.RobotId = encodeAddress(data[1].value, 32);
        params.Record = data[2].value;
        if (
          params.RobotId === ROBOT_ID &&
          (params.Record ===
            "0x0000000000000000000000000000000000000000000000000000000000000001" ||
            params.Record ===
              "0x0000000000000000000000000000000000000000000000000000000000000000")
        ) {
          rows.push(params);
        }
      } catch (error) {
        logger.error(`Parse datalog events ${account}`, error);
      }
    }

    if (page === 0 && result.events.length === COUNT) {
      const pages = Math.ceil(result.count / COUNT) - 1;
      for (let page = 1; page <= pages; page++) {
        rows = [...rows, ...(await getLessonLaunch(account, page))];
      }
    }
  }
  return rows;
}

export default async function () {
  await robonomics.run();
  const users = await Users.findAll();
  for (const user of users) {
    logger.info(user.account);
    const resultDatalog = await getLessonDatalog(user.account);
    for (const item of resultDatalog) {
      if (item.Record.blackmirror) {
        await createLesson1(item);
      }
      if (item.Record.lesson && item.Record.lesson === 2) {
        await createLesson2(item);
      }
      if (item.Record.lesson && item.Record.lesson === 4) {
        await createLesson4(item);
      }
    }
    const resultLaunch = await getLessonLaunch(user.account);
    for (const item of resultLaunch) {
      await createLesson3(item);
    }
  }
}
