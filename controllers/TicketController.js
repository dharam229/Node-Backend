const models = require("../models");
const Ticket = models.Ticket;
const User = models.User;
const TicketFile = models.TicketFile;
const Fs = require("fs");
const sendEmail = require("../utils/sendEmail");
const moment = require("moment");
const AWS = require("aws-sdk");
const S3 = new AWS.S3({
  accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
});

// Requiring ObjectId from mongoose npm package
const ObjectId = require("mongoose").Types.ObjectId;

// Validator function
function isValidObjectId(id) {
  if (ObjectId.isValid(id)) {
    if (String(new ObjectId(id)) === id) return true;
    return false;
  }
  return false;
}

module.exports = class TicketController {
  /****Get List Of tickets**************/
  async listData(req, res) {
    var query = {};
    var condition_arr = [];
    if (
      req.query.search_string !== undefined &&
      req.query.search_string !== ""
    ) {
      if (isValidObjectId(req.query.search_string)) {
        condition_arr.push({
          $or: [{ _id: req.query.search_string }],
        });
      } else {
        condition_arr.push({
          $or: [{ name: new RegExp(req.query.search_string, "i") }],
        });
      }
    }
    if (req.query.date_range !== undefined && req.query.date_range !== "") {
      var date_arr = req.query.date_range.split("/").map((item) => item.trim());
      const start_date = moment(date_arr[0]).startOf("day").toDate();
      const end_date = moment(date_arr[1]).endOf("day").toDate();
      condition_arr.push({ ticket_date: { $gte: start_date, $lte: end_date } });
    }
    if (
      req.query.status !== undefined &&
      req.query.status !== "" &&
      req.query.status != "0"
    ) {
      condition_arr.push({ status: Number(req.query.status) });
    }

    if (condition_arr.length === 1) {
      query = condition_arr[0];
    } else if (condition_arr.length > 1) {
      query = { $and: condition_arr };
    }

    var options = {
      sort: { _id: -1 },
      populate: "created_by",
      page: Number(req.query.page),
      limit: Number(req.query.limit),
    };

    console.log("query, options", query, options);

    return Ticket.paginate(query, options)
      .then((result) =>
        res.status(200).send({
          type: "success",
          message: "List of tickets get successfully.",
          data: result,
        })
      )
      .catch((error) =>
        res.status(200).send({ type: "error", message: error.message })
      );
  }

  /****Save New Ticket Data**************/
  async create(req, res) {
    req.body.created_by = req.user.user_id;
    req.body.updated_by = req.user.user_id;

    let user_data = await User.findById(req.user.user_id).exec();
    if (user_data) {
      req.body.name = user_data.fullname;
    }

    let ticket = new Ticket(req.body);
    return ticket
      .save()
      .then(function (result, error) {
        if (result) {
          //If have any file save them
          if (req.files !== undefined && req.files.length > 0) {
            new TicketController().uploadTicketFile(req, res, result);
          }
          res.status(200).send({
            type: "success",
            message: "Ticket has been generated successfully",
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

  /****Get Form Pre Add Edit data**************/
  async formAddEditData(req, res) {
    var data =
      req.params.id !== "0"
        ? await Ticket.findById(req.params.id)
            .populate(["created_by", "ticket_file"])
            .exec()
        : {};
    return res.status(200).send({ type: "success", message: "", data: data });
  }

  /************UPDATE TICKET******************/
  async update(req, res) {
    if (req.user.role !== 1) {
      return res.status(200).send({
        type: "error",
        message: "You are not authorized for this operation",
      });
    }
    req.body.updated_by = req.user.user_id;
    let data_update = await Ticket.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).exec();
    if (data_update) {
      if (req.body.status == "2") {
        new TicketController().sendEmail(data_update);
      }
      return res.status(200).send({
        type: "success",
        message: "Ticket data updated successfully",
        data: data_update,
      });
    } else {
      return res.status(200).send({
        type: "error",
        message: "Some error occured please try again later",
      });
    }
  }

  async sendEmail(data_update) {
    let user_data = await User.findById(data_update.created_by).exec();
    if (user_data) {
      sendEmail.ticketActionEmail(
        user_data.email,
        "Ticket Update Related",
        user_data,
        data_update
      );
    } else {
      console.log("disabled");
    }
  }

  /***************Upload Ticket File************/
  async uploadTicketFile(req, res, ticketData) {
    var files = req.files;
    await files.forEach(async (file) => {
      const ext = file.mimetype.split("/")[1];
      const fileName = Date.now() + "." + ext;
      const FOLDER_PATH = "tickets/" + ticketData._id;
      const PRODUCT_UPLOAD_PATH = FOLDER_PATH + "/" + fileName;
      let params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: PRODUCT_UPLOAD_PATH,
        Body: file.buffer,
        ContentType: file.mimetype,
      };
      let uploadPromise = await S3.upload(params).promise();
      let file_data = new TicketFile({
        bucket_name: process.env.AWS_S3_BUCKET_NAME,
        ticket_id: ticketData._id,
        name: fileName,
        path: uploadPromise.Key,
        mime: file.mimetype,
      });
      file_data
        .save()
        .then(function (result, error) {
          if (result) {
            new TicketController().updateTicketFileData(ticketData, result);
          }
        })
        .catch((error) => {});
    });
  }

  async updateTicketFileData(ticketData, file_data) {
    await Ticket.findByIdAndUpdate(
      ticketData._id,
      { $push: { ticket_file: file_data._id } },
      { new: true }
    );
  }
};
