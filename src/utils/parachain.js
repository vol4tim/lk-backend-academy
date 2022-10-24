import { Robonomics } from "robonomics-interface";
import config from "../config";

export const robonomics = new Robonomics(config.parachain);
