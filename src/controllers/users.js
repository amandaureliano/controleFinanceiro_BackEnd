require("dotenv").config();
const knex = require("../connection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class User {
	list = async (req, res) => {
		try {
			let detailUser = await knex("users").orderBy("id", "asc");

			return res.status(200).json(detailUser);
		} catch (error) {
			return res.status(400).json({ mensagem: error.message });
		}
	}

	detail = async (req, res) => {
		let { id } = req.params;

		try {
			id = parseInt(id);
			let listDebt = await knex("users").select("*").where("id", id).debug();

			return res.json(listDebt[0]);
		} catch (error) {
			return res.status(400).json({ mensagem: error.message });
		}
	}

	detailUserLogged = async (req, res) => {
		try {
			const { password: _, ...user } = req.user;
      
      return res.status(200).json(user);
		} catch (error) {
			return res.status(400).json({ mensagem: error.message });
		}
	}

	register = async (req, res) => {
		let { name, email, password } = req.body;

		try {
			let passwordEncrypted = await bcrypt.hash(password, 10);
			let registeredUser = await knex("users").insert({ name, email, password: passwordEncrypted }).returning("*");

			return res.status(201).json(registeredUser[0]);
		} catch (error) {
			if (error.code === "23505") {
				return res.status(400).json({ mensagem: "Já existe um usuário cadastrado com o e-mail informado!" });
			}

			return res.status(400).json({ mensagem: error.message });
		}
	}

	edition = async (req, res) => {
		let idUserLogged = req.id;
		let { name,email,password,cpf,telephone } = req.body;

		try {
			if (password) {
				password = await bcrypt.hash(password,10);
			}

			let editionUser = await knex("users").update({ name, email, password, cpf, telephone }).where("id", idUserLogged).returning("*");
			return res.status(200).json(editionUser[0]);
		} catch (error) {
			let column = error.constraint === "users_email_key" ? "email" : error.constraint === "users_cpf_key" ? "cpf" : "telefone";
			if (error.code === "23505") {
				return res.status(400).json({ mensagem: `Já existe um usuário cadastrado com o ${column} informado!` });
			}
			
			return res.status(400).json({ mensagem: error.message });
		}
	}

	login = async (req, res) => {
		let { email, password } = req.body;

		try {
			let user = await knex("users").where({ email }).first();
			if (!user) return res.status(404).json({ mensagem: "O Email informado não existe!" });

			let validPassword = await bcrypt.compare(password,user.password);
			if (!validPassword) return res.status(400).json({ mensagem: "A senha informada é inválida!" });

			const token = jwt.sign({ id: user.id },process.env.SECRET,{ expiresIn: "8h" });
			user.token = token;
			
			return res.status(200).json(user);
		} catch (error) {
			return res.status(400).json({ mensagem: error.message });
		}
	}
}

module.exports = new User();