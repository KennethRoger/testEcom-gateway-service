const express = require("express");
require("dotenv").config({
  path: `.env.${process.env.NODE_ENV || "development"}`,
});

const createProxy = require("./proxy/createProxy");
const { authorize } = require("./middlewares/authMiddleware");
const { rateLimit } = require("express-rate-limit");
const errorHandler = require("./middlewares/errorHandler");

const app = express();
const PORT = process.env.PORT;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
});

app.use(limiter);

// SERVICES
const SERVICES = {
  user: process.env.USER_SERVICE,
  order: process.env.ORDER_SERVICE,
};

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
  "/api/order",
  (req, res, next) => {
    if (req.method === "GET") {
      return authorize(["admin"])(req, res, next);
    }
    return authorize(["user", "admin"])(req, res, next);
  },
  createProxy(SERVICES.order)
);

app.use(
  "/api/order/",
  authorize(["user", "admin"]),
  createProxy(SERVICES.order)
);

app.use(
  "/api/order/status/",
  authorize(["admin"]),
  createProxy(SERVICES.order)
);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Gateway listening on port ${PORT}`);
});
