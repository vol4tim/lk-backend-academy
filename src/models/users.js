import db from "./db";

const Users = db.sequelize.define("users", {
  account: {
    type: db.Sequelize.NUMBER,
  },
});

export default Users;

export async function createUser(account) {
  const row = await Users.findOne({
    where: { account },
  });
  if (!row) {
    await Users.create({
      account: account,
    });
  }
}
