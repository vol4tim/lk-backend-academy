import express from "express";
import cors from "cors";
import createServer from "./server";
import api from "./api/route";
import config from "./config";
import logger from "./utils/logger";
import db from "./models/db";

const app = express();
const server = createServer(app);
app.use(cors());
app.use(express.json());

app.use("/api", api);

(async function () {
  await db.sequelize.sync();
  await server.listen(config.SERVER.PORT, config.SERVER.HOST);
  logger.info(
    "Web listening " + config.SERVER.HOST + " on port " + config.SERVER.PORT
  );
})();
