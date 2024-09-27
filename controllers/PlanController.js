const models = require("../models");
const Plan = models.Plan;
const Subscription = models.Subscription;
const moment = require("moment");
const constant = require("../configs/constant");
const { SECRET_KEY, PRODUCT_STRIPE } = process.env;
const stripe = require("stripe")(SECRET_KEY);

module.exports = class PlanController {
  /**** Create New Plan Data **************/
  async create(req, res) {
    console.log("PRODUCT_STRIPE", PRODUCT_STRIPE);
    if (req.user.role !== 1) {
      return res.status(200).send({
        type: "error",
        message: "You are not authorized for this operation",
      });
    }
    try {
      const price = await stripe.prices.create({
        unit_amount: parseFloat(req.body.unit_amount) * 100,
        currency: req.body.currency,
        recurring: { interval: req.body.interval },
        product: PRODUCT_STRIPE,
      });
      if (price.id) {
        req.body.created_by = req.user.user_id;
        req.body.updated_by = req.user.user_id;
        req.body.plan_id = price.id;
        req.body.recurring = JSON.stringify(price.recurring);
        req.body.type = price.type;
        let plan = new Plan(req.body);
        return plan
          .save()
          .then(function (result, error) {
            if (result) {
              res.status(200).send({
                type: "success",
                message: "Plan has been created successfully",
                data: result,
              });
            } else {
              res.status(200).send({ type: "error", message: error.message });
            }
          })
          .catch((error) =>
            res.status(200).send({ type: "error", message: error.message })
          );
      }
    } catch (error) {
      res.status(200).send({ type: "error", message: error.message });
    }
  }

  /****Get List Of Plans**************/
  async listData(req, res) {
    var query = {};
    var condition_arr = [];
    if (condition_arr.length === 1) {
      query = condition_arr[0];
    } else if (condition_arr.length > 1) {
      query = { $and: condition_arr };
    }
    var options = {
      sort: { _id: -1 },
      page: Number(req.query.page),
      limit: Number(req.query.limit),
    };
    return Plan.paginate(query, options)
      .then((result) =>
        res.status(200).send({
          type: "success",
          message: "List of plan get successfully.",
          data: result,
        })
      )
      .catch((error) =>
        res.status(200).send({ type: "error", message: error.message })
      );
  }

  /****Update Plan Status ******/
  async updateStatus(req, res) {
    //console.log(req.params.id);
    let data = await Plan.findById(req.params.id);
    let new_status = data.status === 1 ? 0 : 1;
    return await Plan.findOneAndUpdate(
      { _id: req.params.id },
      { status: new_status },
      { new: true }
    )
      .then((result) =>
        res.status(200).send({
          type: "success",
          message: "Plan status updated successfully.",
        })
      )
      .catch((error) =>
        res.status(200).send({ type: "error", message: error.message })
      );
  }
};
