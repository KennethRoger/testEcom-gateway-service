const express = require("express");
require("dotenv").config();

const createProxy = require("./proxy/createProxy");
const SERVICES = require("./SERVICES");
const { authorize } = require("./middlewares/authMiddleware");


const app = express();
const PORT = process.env.PORT;

// USER
app.use("/api/users/login", createProxy(SERVICES.user));
app.use("/api/users/register", createProxy(SERVICES.user));
app.use("/api/admin/register", createProxy(SERVICES.user));

app.use("/api/users", authorize(["admin"]), createProxy(SERVICES.user));
app.use(
  "/api/users/",
  authorize(["user", "admin"]),
  createProxy(SERVICES.user)
);

// ORDER
app.use(
  "/api/order/",
  authorize(["user", "admin"]),
  createProxy(SERVICES.order)
);

app.listen(PORT, () => {
  console.log(`Gateway listening on port ${PORT}`);
});
