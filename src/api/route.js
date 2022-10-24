import express from "express";
import controller from "./controller";
import basicAuth from "express-basic-auth";
import { signatureVerify } from "@polkadot/util-crypto";
import config from "../config";

const router = express.Router();

export function authorizer(address, signature) {
  address = address.split("-");
  if (address[0] !== "academy") {
    return {
      type: "user",
      isValid: false,
    };
  }
  let isValid = false;
  try {
    isValid = signatureVerify(address[1], signature, address[1]).isValid;
    // eslint-disable-next-line no-empty
  } catch (_) {}
  return {
    type: config.admins.includes(address[1]) ? "admin" : "user",
    isValid: isValid,
  };
}
function userAuthorizer(address, signature) {
  const res = authorizer(address, signature);
  return res.isValid;
}
function adminAuthorizer(address, signature) {
  const res = authorizer(address, signature);
  return res.type === "admin" && res.isValid;
}
var isLoggedIn = basicAuth({
  authorizer: userAuthorizer,
});
var isLoggedAdminIn = basicAuth({
  authorizer: adminAuthorizer,
});

router.post("/auth", controller.auth);
router.get("/users", isLoggedAdminIn, controller.users);
router.get(
  "/user/:account",
  [
    isLoggedIn,
    (req, res, next) => {
      const result = authorizer(req.auth.user, req.auth.password);
      if (
        result.type !== "admin" &&
        req.params.account !== req.auth.user.split("-")[1]
      ) {
        return res.status(401).json({ error: "No access" });
      }
      return next();
    },
  ],
  controller.user
);

export default router;
