const joi = require("joi");

let dicionary = {
	name: "nome",
	email: "email",
	password: "senha",
	cpf: "cpf",
	telephone: "telefone",
	address: "endereço",
	complement: "complemento",
	cep: "cep",
	district: "bairro",
	city: "cidade",
	uf: "uf",
	description: "descricao",
	due_date: "vencimento",
	value: "valor",
	paid: "pago",
	customer_id: "id do cliente"
}

class Messages {
	constructor(column) {
		const translatedColumn = dicionary[column];
		const genre = translatedColumn.slice(-1) === "a" ? "a" : "o";

		this.messages = {
			"any.required": `O campo ${translatedColumn} é obrigatório. Por favor, insira ${genre} ${translatedColumn}.`,
			"string.empty": `O campo ${translatedColumn} está vazio. Por favor, insira ${genre} ${translatedColumn}.`,
			"string.email": `Os dados foram inseridos incorretamente! Por favor, verifique ${genre} ${translatedColumn} inserid${genre}.`,
			"string.base": `Os dados foram inseridos incorretamente! Por favor, verifique ${genre} ${translatedColumn} inserid${genre}.`,
			"string.min": `O campo ${translatedColumn} precisa conter, no mínimo, 3 caracteres.`,
			"string.trim": `O campo ${translatedColumn} precisa ter um formato válido.`,
			"string.pattern.base": `Os dados foram inseridos incorretamente! Por favor, verifique ${genre} ${translatedColumn} inserid${genre}.`,
			"date.base": `Os dados foram inseridos incorretamente! Por favor, verifique ${genre} ${translatedColumn} inserid${genre}.`,
			"date.strict": `Os dados foram inseridos incorretamente! Por favor, verifique ${genre} ${translatedColumn} inserid${genre}.`,
			"date.format": `Os dados foram inseridos incorretamente! Por favor, verifique ${genre} ${translatedColumn} inserid${genre}.`,
			"date.greater": `Os dados foram inseridos incorretamente! Por favor, verifique ${genre} ${translatedColumn} inserid${genre}.`,
			"date.strict": `Os dados foram inseridos incorretamente! Por favor, verifique ${genre} ${translatedColumn} inserid${genre}.`,
			"boolean.base": `Os dados foram inseridos incorretamente! Por favor, verifique ${genre} ${translatedColumn} inserid${genre}.`,
			"date.less": `Os dados foram inseridos incorretamente! Por favor, verifique ${genre} ${translatedColumn} inserid${genre}.`
		}
	}
}

class Validate {
	constructor() {
		this.tables = {
			users: ["name", "email", "password", "cpf", "telephone"],
			customers: ["name", "email", "password", "cpf", "telephone", "address", "complement", "cep", "district", "city", "uf"],
			debts: ["customer_id", "description", "due_date", "value", "paid"]
		}

		this.validateRegex = {
			name: "^\\S[a-zA-Z]\\D{3,}$",
			password: "^(?=.*\\d)(?=.*[A-Z])(?=.*[a-z]).{8,}$",
			cpf: "^\\d{11}$",
			telephone: "^\\d{10,14}$",
			address: "^\\S[a-zA-Z]\\D{3,}$",
			complement: "^\\S[a-zA-Z]\\D{3,}$",
			cep: "^\\d{8}$",
			district: "^\\S[a-zA-Z]\\D{3,}$",
			city: "^\\S[a-zA-Z]\\D{3,}$",
			uf: "^\\S[A-Z]$",
			description: "^\\S[a-zA-Z]\\D{3,}$",
			value: "^\\d{2,}$",
			customer_id: "^\\d{1,}$"
		}
	}

	createSchema = (table, requireds) => {
		let schema = {}

		for (const column of this.tables[table]) {
			column === "email" ? (schema[column] = joi.string().email())
				: column === "due_date" ? (schema[column] = joi.date())
					: column === "paid" ? (schema[column] = joi.boolean())
						: column === "value" ? (schema[column] = joi.number())
							: (schema[column] = joi.string().pattern(new RegExp(this.validateRegex[column])));

			schema[column] = schema[column].messages(new Messages(column).messages);

			if (requireds.includes(column)) {
				schema[column] = schema[column].required();
			}
		}
		return joi.object(schema);
	}
}

module.exports = new Validate().createSchema;