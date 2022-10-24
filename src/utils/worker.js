import { getInstance, disconnect } from "./chainApi";
import LastBlock from "../models/lastBlock";
import Users, { createUser } from "../models/users";
import { createLesson1 } from "../models/lesson1";
import { createLesson2 } from "../models/lesson2";
import { createLesson3 } from "../models/lesson3";
import { createLesson4 } from "../models/lesson4";
import logger from "./logger";
import config from "../config";

let accounts = [];
async function parseBlock(api, number) {
  const blockHash = await api.rpc.chain.getBlockHash(number);
  const allRecords = await api.query.system.events.at(blockHash);

  const success = [];
  const record = {};
  for (const event of allRecords) {
    if (
      (event.event.section === "datalog" &&
        event.event.method === "NewRecord") ||
      (event.event.section === "launch" &&
        event.event.method === "NewLaunch") ||
      (event.event.section === "rws" && event.event.method === "NewDevices")
    ) {
      if (
        event.event.section === "rws" &&
        event.event.method === "NewDevices" &&
        event.event.data[0].toString() === config.subscription
      ) {
        record[event.phase.asApplyExtrinsic.toNumber()] = {
          section: event.event.section,
          block: number,
          index: event.phase.asApplyExtrinsic.toNumber(),
          ...event.event.data,
        };
      } else if (accounts.includes(event.event.data[0].toString())) {
        record[event.phase.asApplyExtrinsic.toNumber()] = {
          section: event.event.section,
          block: number,
          index: event.phase.asApplyExtrinsic.toNumber(),
          ...event.event.data,
        };
      }
    } else if (
      event.event.section === "system" &&
      event.event.method === "ExtrinsicSuccess"
    ) {
      success.push(event.phase.asApplyExtrinsic.toNumber());
    }
  }
  const records = [];
  for (const index in record) {
    if (success.includes(Number(index))) {
      records.push(record[index]);
    }
  }
  return records;
}

async function getLastBlock() {
  const row = await LastBlock.findOne({});
  if (row) {
    return row.block + 1;
  }
  await LastBlock.create({ block: 1 });
  return 1;
}

async function worker(api, startBlock = null) {
  try {
    const lastBlock = startBlock || (await getLastBlock());
    const currentBlock = Number(
      (await api.rpc.chain.getBlock()).block.header.number
    );
    for (let block = lastBlock; block < currentBlock; block++) {
      const users = await Users.findAll({ attributes: ["account"] });
      accounts = users.map((item) => item.account);
      const records = await parseBlock(api, block);
      for (const record of records) {
        if (record.section === "datalog") {
          try {
            const item = {
              block: record.block,
              index: record.index,
              AccountId: record[0].toHuman(),
              Moment: record[1].toString(),
              Record: JSON.parse(record[2].toHuman()),
            };
            if (item.Record.blackmirror) {
              await createLesson1(item);
            }
            if (item.Record.lesson && item.Record.lesson === 2) {
              await createLesson2(item);
            }
            if (item.Record.lesson && item.Record.lesson === 4) {
              await createLesson4(item);
            }
            // eslint-disable-next-line no-empty
          } catch (_) {}
        } else if (record.section === "launch") {
          try {
            const item = {
              block: record.block,
              index: record.index,
              AccountId: record[0].toHuman(),
              RobotId: record[1].toHuman(),
              Record: record[2].toString(),
            };
            if (
              item.RobotId === config.subscan_api.ROBOT_ID &&
              (item.Record ===
                "0x0000000000000000000000000000000000000000000000000000000000000001" ||
                item.Record ===
                  "0x0000000000000000000000000000000000000000000000000000000000000000")
            ) {
              await createLesson3(item);
            }
            // eslint-disable-next-line no-empty
          } catch (_) {}
        } else if (record.section === "rws") {
          try {
            for (const item of record[1].toHuman()) {
              await createUser(item);
            }
            // eslint-disable-next-line no-empty
          } catch (_) {}
        }
      }
      await LastBlock.update({ block: block }, { where: { id: 1 } });
    }
  } catch (error) {
    logger.error(`worker ${api.isConnected} | ${error.message}`);
    await disconnect();
    setTimeout(() => {
      logger.info("Restart worker");
      main();
    }, 15000);
    return;
  }

  setTimeout(() => {
    worker(api);
  }, 15000);
}

export default async function main() {
  try {
    const api = await getInstance();

    let startBlock = null;
    if (process.env.START_BLOCK) {
      startBlock = Number(process.env.START_BLOCK);
    } else {
      startBlock = await getLastBlock();
    }
    logger.info(`Start block: ${startBlock}`);

    worker(api, startBlock);
  } catch (error) {
    logger.error(`worker init ${error.message}`);
  }
}
