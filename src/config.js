import fs from "fs";
import path from "path";

const file_config = `../config${
  process.env.ENV ? "." + process.env.ENV : ""
}.json`;
if (!fs.existsSync(path.resolve(__dirname, file_config))) {
  console.log("config not found", path.resolve(__dirname, file_config));
  process.exit(0);
}

console.log(file_config);
const config = require(file_config);

export default {
  SERVER: config.server,
  parachain: config.parachain,
  subscan_api: config.subscan_api,
  admins: config.admins,
  subscription: config.subscription,
};
