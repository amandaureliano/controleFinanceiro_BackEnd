require("dotenv").config()
const knex = require("../connection");

class Customers {
  list = async (req,res) => {
    let { order } = req.query;
    delete req.query.order;

    if (req.query.id) {
			req.query["customers.id"] = req.query.id;
			delete req.query.id;
		}

    try {
      let orderDirection = order ? order.substr(0,1) === "-" ? "desc" : "asc" : "asc";
			let orderColumn = order ? order.substr(0,1) === "-" ? order.substr(1) : order : "customers.id";

      let listCustomers = await knex("customers")
        .select("customers.id","name","cpf","email","telephone")
        .count("debts.id")
        .leftJoin("debts", function() {
          this
            .on("debts.customer_id","=","customers.id")
            .on(knex.raw("due_date<now() and not paid"))
        })
        .groupByRaw("1,2,3,4,5")
        .where(req.query)
        .orderBy(orderColumn, orderDirection)
        .debug();
      
      listCustomers.forEach((customer) => {
        customer.status = parseInt(customer.count) ? "defaulter" : "up_to_date";
        delete customer.count;
      });

      return res.status(200).json(listCustomers);
    } catch (error) {
      if (error.code === "42703") {
				return res.status(400).json({ mensagem: "A coluna informada não existe! Por favor, verifique o filtro inserido" });
			}
      return res.status(400).json({ mensagem: error.message });
    }
  }

  detail = async (req, res) => {
    let { id } = req.params;

    try {
      const calculateStatus = (paid, due_date) => {
        return paid ? "paid" : due_date < new Date() ? "overdue" : "pending";
      }

      let customer = await knex("customers").select("").where("id", id).first().debug();
      customer.debts = await knex("debts").select("").where("customer_id", id).orderBy("id", "asc").debug();

      customer.debts.forEach((debt) => {
        debt.status = calculateStatus(debt.paid, debt.due_date);
      });

      return res.status(200).json(customer);
    } catch (error) {
      let column = error.constraint === "customers_email_key" ? "email" : error.constraint === "customers_cpf_key" ? "cpf" : "telefone";

      if (error.code === "23505") {
        return res.status(400).json({ mensagem: `Já existe um usuário cadastrado com o ${column} informado!`});
      }

      return res.status(400).json({ mensagem: error.message });
    }
  }

  register = async (req, res) => {
    try {
      let registeredCustomer = await knex("customers").insert(req.body).returning("*").debug();

      return res.status(201).json(registeredCustomer);
    } catch (error) {
      let column = error.constraint === "customers_email_key" ? "email" : error.constraint === "customers_cpf_key" ? "cpf" : "telefone";

      if (error.code === "23505") {
        return res.status(400).json({ mensagem: `Já existe um usuário cadastrado com o ${column} informado!` });
      }

      return res.status(400).json({ mensagem: error.message });
    }
  }

  edition = async (req, res) => {
    let { id } = req.params;

    try {
      let editionCustomer = await knex("customers").update(req.body).where("id", id).returning("*").debug();

      return res.status(200).json(editionCustomer[0]);
    } catch (error) {
      console.log(error);
      let column = error.constraint === "customers_email_key" ? "email" : error.constraint === "customers_cpf_key" ? "cpf" : "telefone";

    if (error.code === "23505") {
      return res.status(400).json({
        mensagem: `Já existe um usuário cadastrado com o ${column} informado!`
      });
    }
      return res.status(400).json({ mensagem: error.message });
    }
  }
}

module.exports = new Customers();