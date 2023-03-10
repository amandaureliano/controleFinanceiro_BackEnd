require("dotenv").config();
const knex = require("../connection");
const isBefore = require("date-fns/isBefore");

const calculateStatus = (paid, due_date) => {
	return paid ? "paid" : due_date < new Date() ? "overdue" : "pending";
}

class Debts {
	list = async (req,res) => {
		let { order } = req.query;
		if (req.query.id) {
			req.query["debts.id"] = req.query.id;
			delete req.query.id;
		}
		
		delete req.query.order;

		try {
			let listDebts = [];

			let orderDirection = order ? order.substr(0,1) === "-" ? "desc" : "asc" : "asc";
			let orderColumn = order ? order.substr(0,1) === "-" ? order.substr(1) : order : "debts.id";

			listDebts = await knex("debts")
				.select("debts.*", "name")
				.leftJoin("customers", "customers.id", "debts.customer_id")
				.where(req.query)
				.orderBy(orderColumn, orderDirection)
				.debug();

			listDebts.forEach((debt) => {
				debt.status = calculateStatus(debt.paid, debt.due_date);
			});

			return res.status(200).json(listDebts);
		} catch (error) {
			if (error.code === "42703") {
				return res.status(400).json({ mensagem: "A coluna informada não existe! Por favor, verifique o filtro inserido" });
			}
			return res.status(400).json({ mensagem: error.message });
		}
	}

	detail = async (req,res) => {
		let { id } = req.params;

		try {
			id = parseInt(id);
			let listDebt = await knex("debts").select("debts.*", "name").leftJoin("customers", "debts.customer_id", "=", "customers.id").where("debts.id", id).debug();

			listDebt.forEach((debt) => {
				debt.status = calculateStatus(debt.paid, debt.due_date);
			});

			return res.json(listDebt[0]);
		} catch (error) {
			return res.status(400).json({ mensagem: error.message });
		}
	}

	register = async (req, res) => {
		try {
			let registeredDebt = await knex("debts").insert(req.body).returning("*").debug();
			registeredDebt = registeredDebt[0];
			registeredDebt.status = calculateStatus(registeredDebt.paid, registeredDebt.due_date);
			return res.status(201).json(registeredDebt);
		} catch (error) {
			return res.status(400).json({ mensagem: error.message });
		}
	}

	edition = async (req,res) => {
		try {
			await knex("debts").update(req.body).where(req.params).debug();

			return res.status(200).json({ mensagem: "Cobrança editada com sucesso!"});
		} catch (error) {
			return res.status(400).json({ mensagem: error.message });
		}
	}

	delete = async (req, res) => {
		const { id } = req.params;

    try {
      const charge = await knex("debts").where({ id }).first();

			if (charge.paid === false && isBefore(charge.due_date, new Date())) {
				return res.status(404).json("Não foi possível deletar a cobrança");
			}

			const chargeToBeDeleted = await knex("debts").del().where({ id });

			if (!chargeToBeDeleted) {
					return res.status(400).json("Não foi possível deletar a cobrança");
			}

      return res.status(200).json("Cobrança excluída com sucesso");
    } catch (error) {
      return res.status(400).json({ mensagem: error.message });
    }
	}
}

module.exports = new Debts();