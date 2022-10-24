import { robonomics } from "../utils/parachain";
import Users from "../models/users";
import Lesson5 from "../models/lesson5";

async function checkSubscription(owner) {
  const ledger = await robonomics.rws.getLedger(owner);
  if (ledger.isEmpty) {
    return {
      ledger: false,
      devices: false,
    };
  }
  const devices = await robonomics.rws.getDevices(owner);
  if (devices.isEmpty) {
    return {
      ledger: true,
      devices: false,
    };
  }
  return {
    ledger: true,
    devices: true,
  };
}

async function fill(subscription) {
  const user = await Lesson5.findOne({
    where: { account: subscription.account },
  });
  if (!user) {
    await Lesson5.create({
      account: subscription.account,
      ledger: subscription.ledger,
      devices: subscription.devices,
    });
  } else {
    await user.update({
      account: subscription.account,
      ledger: subscription.ledger,
      devices: subscription.devices,
    });
  }
}

export default async function () {
  await robonomics.run();
  const users = await Users.findAll({
    attributes: ["account"],
  });
  const accounts = users.map((item) => item.account);
  for (const account of accounts) {
    const subscription = await checkSubscription(account);
    await fill({ account, ...subscription });
  }
}
