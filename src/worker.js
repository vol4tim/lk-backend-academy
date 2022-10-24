import db from "./models/db";
import logger from "./utils/logger";
import worker from "./utils/worker";

(async function () {
  await db.sequelize.sync();
  logger.info("start");
  worker();
})();
