const createSchema = require("./schemas");

const removeEmptyStrings = (body) => {
	Object.entries(body).forEach(([key,value]) => {
		if (value === "") {
			body[key] = null;
		}
	});
	return body;
}

const validateSchema = (table, requireds) => async (req, res, next) => {
	try {
		req.body = removeEmptyStrings(req.body);

		const joiSchema = createSchema(table, requireds);
		await joiSchema.validateAsync(req.body);

		next();
	} catch (error) {
		return res.status(400).json({ mensagem: error.message });
	}
}

module.exports = validateSchema;