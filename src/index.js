const express = require("express");
const morgan = require("morgan");

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
  payment: process.env.PAYMENT_SERVICE,
};

// LOGGING
app.use(morgan("combined"));

// USER
app.post("/api/users/login", createProxy(SERVICES.user));
app.post("/api/users/register", createProxy(SERVICES.user));
app.post(
  "/api/admin/register",
  createProxy(SERVICES.user, { "^/api": "/users" })
);

app.get("/api/users", authorize(["admin"]), createProxy(SERVICES.user));

app.use(
  "/api/users",
  authorize(["user", "admin"]),
  createProxy(SERVICES.user, { "": "/users" })
);

app.delete("/api/users/:id", authorize(["admin"]), createProxy(SERVICES.user));

// ORDER

app.get("/api/order", authorize(["admin"]), createProxy(SERVICES.order));

app.use(
  "/api/order",
  authorize(["user", "admin"]),
  createProxy(SERVICES.order, { "": "/order" })
);

app.post(
  "/api/order/status/:id",
  authorize(["admin"]),
  createProxy(SERVICES.order)
);

// PAYMENT

app.post(
  "/api/payment/:orderId",
  authorize(["admin", "user"]),
  createProxy(SERVICES.payment)
);

app.get("/api/payment", authorize(["admin"]), createProxy(SERVICES.payment));

app.get(
  "/api/payment/:paymentId",
  authorize(["admin", "user"]),
  createProxy(SERVICES.payment)
);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Gateway listening on port ${PORT}`);
});
