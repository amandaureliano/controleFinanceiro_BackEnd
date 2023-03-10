require("dotenv").config();
const jwt = require("jsonwebtoken");
const knex = require("../connection");

let validateToken = async (req, res, next) => {
	let { authorization } = req.headers;

	try {
		if (!authorization) return res.status(401).json({ mensagem: "Não autorizado!" });

		const token = authorization.split(" ")[1];
		const id = jwt.verify(token,process.env.SECRET).id;
		let user = await knex("users").select("*").where({ id }).first();
		
		req.id = id;
		req.user = user;

		next()
	} catch (error) {
		return res.status(401).json({ mensagem: "Token inválido!" });
	}
}

module.exports = validateToken;