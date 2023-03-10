const express = require("express");
const routes = express();
const customers = require("./controllers/customers");
const users = require("./controllers/users");
const debts = require("./controllers/debts");
const summary = require("./controllers/summary");
const validateSchema = require("./middlewares/validateSchema");
const validateToken = require("./middlewares/validateToken");

routes.post("/users", validateSchema("users", ["name", "email", "password"]), users.register);
routes.post("/login", validateSchema("users", ["email", "password"]), users.login);

routes.use(validateToken);

routes.get("/user", users.detailUserLogged);
routes.get("/users", users.list);
routes.get("/users/:id", users.detail);
routes.put("/users", validateSchema("users", ["name", "email"]), users.edition);
routes.get("/customers/:id", customers.detail);
routes.get("/customers", customers.list);
routes.post("/customers", validateSchema("customers", ["name", "email", "cpf", "telephone"]), customers.register);
routes.put("/customers/:id", validateSchema("customers", ["name", "email", "cpf", "telephone"]), customers.edition);
routes.get("/debts", debts.list);
routes.get("/debts/:id", debts.detail);
routes.post("/debts", validateSchema("debts", ["customer_id", "description", "due_date", "value", "paid"]), debts.register);
routes.put("/debts/:id", validateSchema("debts", ["description", "due_date", "value", "paid"]), debts.edition);
routes.delete("/debts/:id",debts.delete);
routes.get("/summary", summary.list);

module.exports = routes;