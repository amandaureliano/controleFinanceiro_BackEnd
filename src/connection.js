const knex = require("knex")({
	client: process.env.CONNECTION_CLIENT,
	connection: {
		host: process.env.CONNECTION_HOST,
		port: process.env.CONNECTION_PORT,
		user: process.env.CONNECTION_USER,
		password: process.env.CONNECTION_PASSWORD,
		database: process.env.CONNECTION_DATABASE,
	}
});

module.exports = knex;