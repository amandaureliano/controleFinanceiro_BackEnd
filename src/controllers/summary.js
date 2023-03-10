require("dotenv").config()
const knex = require("../connection");

class summary {
  list = async (req, res) => {
    try {
      let summary = {};

      summary.totalPaid = (await knex("debts").sum("value").whereRaw("paid").first().debug()).sum;

      summary.totalOverdue = (await knex("debts").sum("value").whereRaw("not paid and due_date < now()").first().debug()).sum;

      summary.totalPending = (await knex("debts").sum("value").whereRaw("not paid and due_date >= now()").first().debug()).sum;

      summary.paidDebts = await knex("debts").select("name","debts.id","debts.value")
        .leftJoin("customers","customers.id","debts.customer_id").whereRaw("paid").orderBy("debts.value", "desc").limit(4).debug();

      summary.overdueDebts = await knex("debts").select("name","debts.id","debts.value")
        .leftJoin("customers","customers.id","debts.customer_id").whereRaw("not paid and due_date < now()").orderBy("debts.value", "desc").limit(4).debug();
      
      summary.pendingDebts = await knex("debts").select("name","debts.id","debts.value")
        .leftJoin("customers","customers.id","debts.customer_id").whereRaw("not paid and due_date >= now()").orderBy("debts.value", "desc").limit(4).debug();
      
      summary.defaulterCustomers = await knex("customers").select("name","customers.id","cpf")
        .join("debts","debts.customer_id","customers.id").whereRaw("not paid and due_date < now()").distinct().limit(4).debug();
      
      summary.upToDateCustomers = await knex("customers").select("name","customers.id","cpf")
        .leftJoin("debts",function () {
        this
          .on(knex.raw("debts.customer_id = customers.id and not paid and due_date < now()"))
      }).whereRaw("debts.id is null").distinct().limit(4).debug();
      
      let summaryTotals = ["totalPaid","totalOverdue","totalPending"];

      for (let field of summaryTotals) {
        if (!summary[field]) {
          summary[field] = 0;
        }
      }

      return res.status(200).json(summary);
    } catch (error) {
      return res.status(400).json({ mensagem: error.message });
    }
  }
}

module.exports = new summary();