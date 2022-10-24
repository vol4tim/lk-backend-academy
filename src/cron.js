import fs from "fs";
import path from "path";
import db from "./models/db";
import logger from "./utils/logger";

(async function () {
  logger.info("start");
  if (process.argv[2]) {
    const file = `./cron/${process.argv[2]}.js`;
    if (!fs.existsSync(path.resolve(__dirname, file))) {
      logger.error(`command not found ${path.resolve(__dirname, file)}`);
      process.exit(0);
    }
    await db.sequelize.sync();
    const command = require(file);
    await command.default();
  }
  logger.info("end");
  process.exit(0);
})();
