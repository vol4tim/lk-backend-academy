import { robonomics } from "../utils/parachain";
import { createUser } from "../models/users";

async function getDevices(owner) {
  const result = await robonomics.rws.getDevices(owner);
  if (result.isEmpty) {
    return [];
  }
  return result.map((item) => item.toHuman());
}

async function fillUsers() {
  const devices = await getDevices(
    "4GgRRojuoQwKCZP9wkB69ZxJY4JprmHtpzEzqJLjnqu4jk1r"
  );
  for (const account of devices) {
    await createUser(account);
  }
}

export default async function () {
  await robonomics.run();
  await fillUsers();
}
