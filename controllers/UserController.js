const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const models = require("../models");
const sendEmail = require("../utils/sendEmail");
const moment = require("moment");
const config = require("../config");
const User = models.User;
const SubscriptionReport = models.SubscriptionReport;
const UserOtp = models.UserOtp;
const Ticket = models.Ticket;
const Plan = models.Plan;
const Fs = require("fs");
const crypto = require("crypto");
const AWS = require("aws-sdk");
const { adminRoles } = require("../configs/constant");
const S3 = new AWS.S3({
  accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
});
const { SECRET_KEY } = process.env;
const stripe = require("stripe")(SECRET_KEY);

module.exports = class UserController {
  /****Save New User Data**************/
  async register(req, res) {
    const id = await User.getNextId("User");
    console.log('asxax here we come',id) 
    req.body.mango_id = id;
    if (
      Number(req.body.register_type) !== 1 &&
      req.body.register_type !== undefined
    ) {
      await new UserController().createUserSocialDetails(req, res);
      return false;
    }
    req.body.bucket_name = process.env.AWS_S3_BUCKET_NAME;
    req.body.password = await bcrypt.hash(req.body.password, 10);
    req.body.token = await new UserController().createVerifyToken();
    req.body.user_image = null;
    req.body.status = 0;
    req.body.email = req.body.email.toLowerCase();
    let user = new User(req.body);
    return user
      .save()
      .then(async function (result, error) {
        if (result) {
			//if(result.stripe_customer === null){
				const customer = await stripe.customers.create({
					email: result.email,
					description: "Mango Customer",
					name: result.firstname + " " + result.lastname,
				});
				var new_result = await User.findOneAndUpdate(
					{ _id: result._id },
					{ stripe_customer: customer.id }, { returnDocument: false }
				);
			//}
          new UserController().createUserVerifyOtp(req, res, result);
        } else {
          res.status(200).send({ type: "error", message: error.message });
        }
      })
      .catch((error) => {
        let errMsg;
        if (error.code == 11000) {
          errMsg = Object.keys(error.keyValue)[0] + " already exists.";
        } else {
          errMsg = error.message;
        }
        res.status(400).send({ type: "error", message: errMsg });
      });
  }

  async createUserVerifyOtp(req, res, result) {
    var new_otp = Math.floor(10000 + Math.random() * 90000);
    let user = new UserOtp();
    user.otp = new_otp;
    user.status = 1;
    user.created_by = result._id;
    user.updated_by = result._id;
    return await user
      .save()
      .then(function (result, error) {
        if (result) {
          res
            .status(200)
            .send({
              type: "success",
              message: "Your one time password for verification",
              otp: new_otp,
            });
        } else {
          res.status(200).send({ type: "error", message: error.message });
        }
      })
      .catch((error) =>
        res.status(400).send({ type: "error", message: error.message })
      );
  }

  async userVerifyOtp(req, res) {
    var user = await User.findOne({ phone: req.body.phone }).exec();
    if (user) {
      if (user.status === 0) {
        let otp_user = await UserOtp.findOne({
          otp: req.body.otp,
          created_by: user._id,
        }).exec();
        if (otp_user) {
          await User.findOneAndUpdate(
            { _id: otp_user.created_by },
            { status: 1 },
            { returnOriginal: false }
          );
          return await UserOtp.deleteOne({ otp: req.body.otp })
            .then((data) =>
              res
                .status(200)
                .send({
                  type: "success",
                  message: "User Verfied successfully. Please proceed login",
                })
            )
            .catch((error) =>
              res.status(200).send({ type: "error", message: error.message })
            );
        } else {
          return res
            .status(200)
            .send({
              type: "error",
              message:
                "Please check and re-enter the OTP. Your entered OTP is invalid",
            });
        }
      } else {
        return res
          .status(200)
          .send({
            type: "success",
            message: "Your account is already verified. Please proceed login",
          });
      }
    } else {
      return res
        .status(200)
        .send({
          type: "error",
          message: "User not found please check your data",
        });
    }
  }

  async resendOtp(req, res) {
    var user = await User.findOne({ phone: req.body.phone }).exec();
    if (user) {
      if (Number(user.status) === 0) {
        var new_otp = Math.floor(10000 + Math.random() * 90000);
        let otp_user = await UserOtp.findOne({ created_by: user._id }).exec();
        if (otp_user) {
          await UserOtp.findOneAndUpdate(
            { _id: otp_user._id },
            { otp: new_otp },
            { returnOriginal: false }
          );
        } else {
          let new_otp_user = new UserOtp();
          new_otp_user.otp = new_otp;
          new_otp_user.status = 1;
          new_otp_user.created_by = user._id;
          new_otp_user.updated_by = user._id;
          await new_otp_user.save();
        }
        return res
          .status(200)
          .send({
            type: "success",
            message: "Your one time password for verification",
            otp: new_otp,
          });
      } else {
        return res
          .status(200)
          .send({
            type: "success",
            message: "Your account is already verified. Please proceed login",
          });
      }
    } else {
      return res
        .status(200)
        .send({
          type: "error",
          message: "User not found please check your data",
        });
    }
  }

  async createVerifyToken() {
    const characters =
      "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let randomToken = "";
    for (let i = 0; i < 20; i++) {
      randomToken += characters[Math.floor(Math.random() * characters.length)];
    }
    return randomToken;
  }

  /****Web Check and login user**************/
  async login(req, res) {
    var email = req.body.email.toLowerCase();
    var user = await User.findOne({ email: email }).select("+password").exec();
    if (user && user.status === 0) {
      return res
        .status(200)
        .send({
          type: "error",
          message: "You account is inactive. Please verify your email address",
        });
    } else if (user && user.status === 2) {
      return res
        .status(200)
        .send({
          type: "error",
          message: "You account is blocked. Please contact to administrator!",
        });
    }
    if (user && (await bcrypt.compare(req.body.password, user.password))) {
      const token = jwt.sign(
        {
          user_id: user._id,
          email: email,
          stripe_customer: user.stripe_customer,
          role: user.role,
          status: user.status,
          full_name: user.firstname + " " + user.lastname,
        },
        process.env.TOKEN_KEY,
        {
          expiresIn: "30d",
        }
      );
      //save user token
      user = await User.findOneAndUpdate(
        { _id: user._id },
        { token: token, is_logged_in: true },
        {
          returnOriginal: false,
        }
      );
      // user
      return res
        .status(200)
        .send({ type: "success", message: "", jwttoken: token, data: user });
    }
    res
      .status(200)
      .send({ type: "error", message: "Email or password are incorrect" });
  }

  /****app Check and login user**************/
  async appLogin(req, res) {
    var condition = {};
    if (Number(req.body.login_type) === 1) {
      condition["email"] = req.body.email.toLowerCase();
    } else if (Number(req.body.login_type) === 2) {
      condition["facebook_token"] = req.body.token;
    } else if (Number(req.body.login_type) === 3) {
      condition["google_token"] = req.body.token;
    } else if (Number(req.body.login_type) === 4) {
      condition["apple_token"] = req.body.token;
    }
    //console.log('condition', condition)
    var user = await User.findOne(condition).select("+password").exec();
    if (user) {
      if (Number(user.status) === 0) {
        return res
          .status(200)
          .send({
            type: "error",
            message:
              "You account is inactive. Please verify your email address",
          });
      } else if (user.status === 2) {
        return res
          .status(200)
          .send({
            type: "error",
            message: "You account is blocked. Please contact to administrator!",
          });
      } else {
        if (Number(req.body.login_type) === 1) {
          if (
            Number(req.body.login_type) === 1 &&
            !(await bcrypt.compare(req.body.password, user.password))
          ) {
            res
              .status(200)
              .send({ type: "error", message: "Password is incorrect" });
          }
        }
        const token = jwt.sign(
          {
            full_name: user.firstname + " " + user.lastname,
            stripe_customer: user.stripe_customer,
            user_id: user._id,
            email: user.email,
            role: user.role,
            status: user.status,
          },
          process.env.TOKEN_KEY,
          { expiresIn: "30d" }
        );
        //save user token
        user = await User.findOneAndUpdate(
          { _id: user._id },
          { token: token, is_logged_in: true },
          { returnOriginal: false }
        );
        // user
        res
          .status(200)
          .send({ type: "success", message: "", jwttoken: token, data: user });
      }
    } else {
      if (Number(req.body.login_type) === 1) {
        res
          .status(200)
          .send({
            type: "error",
            message: "User with following email does not exist.",
          });
      } else {
        new UserController().createUserSocialDetails(req, res);
      }
    }
  }

  //Create user with social login details
  async createUserSocialDetails(req, res) {
    if (Number(req.body.login_type) === 2) {
      req.body.facebook_token = req.body.token;
    } else if (Number(req.body.login_type) === 3) {
      req.body.google_token = req.body.token;
    } else if (Number(req.body.login_type) === 4) {
      req.body.apple_token = req.body.token;
    } else if (Number(req.body.register_type) === 5) {
      req.body.facebook_token = req.body.token;
    } else if (Number(req.body.register_type) === 6) {
      req.body.google_token = req.body.token;
    } else if (Number(req.body.register_type) === 7) {
      req.body.apple_token = req.body.token;
    }
    req.body.role = 2;
    req.body.status = 1;
    req.body.bucket_name = process.env.AWS_S3_BUCKET_NAME;
    let user = new User(req.body);
    return user
      .save()
      .then(async function (result, error) {
        if (result) {
			//if(result.stripe_customer === null){
				var customer_data = {};
				if(result.email !== null){
					customer_data.email = result.email;
				}
				if(result.email !== null){
					customer_data.phone = result.phone;
				}
				if(result.firstname !== null){
					customer_data.name = result.firstname + " " + result.lastname;
				}
				customer_data.description = "Mango Customer";
				//create stripe customer
				const customer = await stripe.customers.create(customer_data);
				var new_result = await User.findOneAndUpdate(
					{ _id: result._id },
					{ stripe_customer: customer.id }
				);
			//}
          const token = jwt.sign(
            {
              full_name: result.firstname + " " + result.lastname,
              stripe_customer: customer.id,
              user_id: result._id,
              email: result.email,
              role: result.role,
              status: result.status,
            },
            process.env.TOKEN_KEY,
            { expiresIn: "30d" }
          );
          //save user token
          let userCast = await User.findOneAndUpdate(
            { _id: result._id },
            { token: token },
            { returnOriginal: false }
          );
          // user
          return res
            .status(200)
            .send({
              type: "success",
              message: "You have logged in successfully.",
              jwttoken: token,
              data: userCast,
            });
        } else {
          return res
            .status(200)
            .send({ type: "error", message: error.message });
        }
      })
      .catch((error) =>
        res.status(200).send({ type: "error", message: error })
      );
  }

  /****Save New User Data**************/
  async createUser(req, res) {
    req.body.password = await bcrypt.hash(req.body.password, 10);
    req.body.created_by = req.user.user_id;
    req.body.updated_by = req.user.user_id;
    req.body.email = req.body.email.toLowerCase();
    req.body.bucket_name = process.env.AWS_S3_BUCKET_NAME;
    let user = new User(req.body);
    return user
      .save()
      .then(async function (result, error) {
        if (result) {
          let message = "User data added successfully";
          let userCast = await User.findOneAndUpdate(
            { _id: result._id },
            { token: Math.random().toString(36).substring(2, 7) },
            { returnOriginal: false }
          );
          if (req.files !== undefined && req.files.length > 0) {
            //save user image once user data is saved
            new UserController().uploadUserImages(req, res, result, message);
          } else {
            res
              .status(200)
              .send({ type: "success", message: message, data: result });
          }
          const link = `${config.webUrl}reset-password/${userCast.token}`;
          let emailData = {
            link: link,
            firstname: userCast.firstname,
            lastname: userCast.lastname,
          };
          await sendEmail.staffCreated(
            userCast.email,
            "Add new staff",
            emailData
          );
        } else {
          res.status(200).send({ type: "error", message: error.message });
        }
      })
      .catch((error) =>
        res.status(200).send({ type: "error", message: error.message })
      );
  }

  /***********Update User Notification ********/
  async updateNotification(req, res) {
    await User.findByIdAndUpdate(req.params.id, { user_notification: 0 })
      .then(function (result, error) {
        if (result) {
          res
            .status(200)
            .send({
              type: "success",
              message: "User data updated successfully",
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

  /************ Change Password *********/
  async changePassword(req, res) {
    var user = await User.findById(req.params.id).exec();
    if (user) {
      var encrypted_pass = await bcrypt.hash(req.body.password, 10);
      user.password = encrypted_pass;
      await user.save();
      return res
        .status(200)
        .send({
          type: "success",
          message: "Password has been changed sucessfully.",
        });
    } else {
      return res
        .status(200)
        .send({
          type: "error",
          message:
            "There is a problem while changing the password,please try later.",
        });
    }
  }

  /****Get Form Pre Add Edit data**************/
  async formAddEditData(req, res) {
    var user_data =
      req.params.id !== "0" ? await User.findById(req.params.id).exec() : {};
    return res
      .status(200)
      .send({
        type: "success",
        message: "",
        user_data: user_data,
        roles: adminRoles,
      });
  }

  /****Get profile data**************/
  async getProfileData(req, res) {
    var user_data = await User.findById(req.user.user_id).exec();
    return res
      .status(200)
      .send({
        type: "success",
        message: "",
        user_data: user_data,
        roles: adminRoles,
      });
  }

  /****Update User Data**************/
  async updateUser(req, res) {
    req.body.password !== undefined
      ? (req.body.password = await bcrypt.hash(req.body.password, 10))
      : "";
    req.body.updated_by = req.user.user_id;
    let data_update = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).exec();
    if (data_update) {
      let message = "User data updated successfully";
      if (req.files !== undefined && req.files.length > 0) {
        //First Check and delete old image
        if (data_update.user_image !== null) {
          await new UserController().removeUserImage(data_update);
        }
        await new UserController().uploadUserImages(
          req,
          res,
          data_update,
          message
        );
      } else {
        return res
          .status(200)
          .send({ type: "success", message: message, data: data_update });
      }
    } else {
      return res
        .status(200)
        .send({
          type: "error",
          message: "Some error occured please try again later",
        });
    }
  }

  /****Update User Profile Data For App **************/
  async updateUserProfile(req, res) {
    req.body.updated_by = req.user.user_id;
    let data_update = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).exec();
    if (data_update) {
      let message = "Profile updated successfully";
      if (req.files !== undefined && req.files.length > 0) {
        if (data_update.user_image !== null) {
          await new UserController().removeUserImage(data_update);
        }
        await new UserController().uploadUserImages(
          req,
          res,
          data_update,
          message
        );
      } else {
        return res
          .status(200)
          .send({ type: "success", message: message, data: data_update });
      }
    } else {
      res
        .status(200)
        .send({
          type: "error",
          message: "Some error occured please try again later",
        });
    }
  }

  async saveUserCroppedImage(req, res) {
    var user_data = await User.findById(req.params.id).exec();
    if (user_data.user_image !== null) {
      await new UserController().removeUserImage(user_data);
    }

    var baseImage = req.body.user_image;
    let FOLDER_PATH = process.env.UPLOAD_BASE + "users";
    //Find extension of file
    const ext = baseImage.substring(
      baseImage.indexOf("/") + 1,
      baseImage.indexOf(";base64")
    );
    const fileType = baseImage.substring(
      "data:".length,
      baseImage.indexOf("/")
    );
    //Forming regex to extract base64 data of file.
    const regex = new RegExp(`^data:${fileType}\/${ext};base64,`, "gi");
    //Extract base64 data.
    const base64Data = baseImage.replace(regex, "");
    const file_name = user_data._id + "." + ext;
    const FILE_UPLOAD_PATH = FOLDER_PATH + "/" + file_name;
    Fs.writeFileSync(FILE_UPLOAD_PATH, base64Data, "base64");
    let FILE_URL = "users/" + file_name;
    new UserController().updateUserImageData(user_data, FILE_URL, req, res);
    return res
      .status(200)
      .send({ type: "success", message: "Image Saved successfully" });
  }

  async updatePassword(req, res) {
    var user = await User.findById(req.params.id).select("+password").exec();
    if (
      user &&
      (await bcrypt.compare(req.body.currentpassword, user.password))
    ) {
      var encrypted_pass = await bcrypt.hash(req.body.password, 10);
      user.password = encrypted_pass;
      await user.save();
      return res
        .status(200)
        .send({
          type: "success",
          message: "Password updated sucessfully. Please Login now",
        });
    } else {
      return res
        .status(200)
        .send({
          type: "error",
          message:
            "Your current password is not matching. Please verify and try again..",
        });
    }
  }

  async appUpdatePassword(req, res) {
    var user = await User.findById(req.user.user_id).select("+password").exec();
    if (
      user &&
      (await bcrypt.compare(req.body.currentpassword, user.password))
    ) {
      var encrypted_pass = await bcrypt.hash(req.body.password, 10);
      user.password = encrypted_pass;
      await user.save();
      return res
        .status(200)
        .send({
          type: "success",
          message: "Password updated sucessfully. Please Login now",
        });
    } else {
      return res
        .status(200)
        .send({
          type: "error",
          message:
            "Your current password is not matching. Please verify and try again..",
        });
    }
  }

  /****Get List Of all the Users/Admin**************/
  async listData(req, res) {
    var query = {};
    var condition_arr = [{ _id: { $ne: req.user.user_id } }];
    if (
      req.query.search_string !== undefined &&
      req.query.search_string !== ""
    ) {
      condition_arr.push({
        $or: [
          { firstname: new RegExp(req.query.search_string, "i") },
          { lastname: new RegExp(req.query.search_string, "i") },
          { email: new RegExp(req.query.search_string, "i") },
          { phone: new RegExp(req.query.search_string, "i") },
        ],
      });
    }
    req.query.status !== undefined && req.query.status !== ""
      ? condition_arr.push({ status: Number(req.query.status) })
      : "";

    if (req.query.role !== undefined && req.query.role !== "") {
      condition_arr.push({ role: Number(req.query.role) });
    } else {
      condition_arr.push({ role: { $ne: 2 } });
    }

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

    return User.paginate(query, options)
      .then((result) =>
        res
          .status(200)
          .send({
            type: "success",
            message: "User list get successfully.",
            data: result,
            roles: adminRoles,
          })
      )
      .catch((error) =>
        res.status(200).send({ type: "error", message: error.message })
      );
  }

  /****Get List Of all the Users/App**************/
  async listDataMembers(req, res) {
    //console.log('oka',typeof req.query.search_string.replace('M000', ''))
    var query = {};
    var condition_arr = [{ _id: { $ne: req.user.user_id } }];
    condition_arr.push({ role: 2 });
    if (
      req.query.search_string !== undefined &&
      req.query.search_string !== ""
    ) {
      if (req.query.search_string.includes("M000")) {
        condition_arr.push({
          $or: [
            { mango_id: req.query.search_string.replace("M000", "") },
            { firstname: new RegExp(req.query.search_string, "i") },
            { lastname: new RegExp(req.query.search_string, "i") },
            { email: new RegExp(req.query.search_string, "i") },
            { phone: new RegExp(req.query.search_string, "i") },
          ],
        });
      } else {
        condition_arr.push({
          $or: [
            { firstname: new RegExp(req.query.search_string, "i") },
            { lastname: new RegExp(req.query.search_string, "i") },
            { email: new RegExp(req.query.search_string, "i") },
            { phone: new RegExp(req.query.search_string, "i") },
          ],
        });
      }
    }
    req.query.status !== undefined && req.query.status !== ""
      ? condition_arr.push({ status: Number(req.query.status) })
      : "";
    if (req.query.date_range !== undefined && req.query.date_range !== "") {
      var arrVars = req.query.date_range.split("/");
      if (arrVars.length === 2) {
        const start = new Date(arrVars[0]);
        start.setHours(0, 0, 0, 0);
        const end = new Date(arrVars[1]);
        end.setHours(23, 59, 59, 999);
        condition_arr.push({ created_at: { $gte: start, $lte: end } });
      }
    }

    //get free plan id
    var plan = await Plan.findOne({
      name: new RegExp("Freemium Account", "i"),
    });
    //console.log('free plan', plan)
    if (req.query.type === "unpaid") {
      if (plan) {
        condition_arr.push({ $or: [{ plan_id: null }, { plan_id: plan.id }] });
      } else {
        condition_arr.push({ plan_id: null });
      }
    } else {
      condition_arr.push({
        $and: [{ plan_id: { $ne: null } }, { plan_id: { $ne: plan.id } }],
      });
    }
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

    return User.paginate(query, options)
      .then((result) =>
        res
          .status(200)
          .send({
            type: "success",
            message: "User list get successfully.",
            data: result,
            roles: adminRoles,
          })
      )
      .catch((error) =>
        res.status(200).send({ type: "error", message: error.message })
      );
  }

  /****Get Single User Detail**************/
  async view(req, res) {
    //console.log(req.params.id);
    return await User.findById(req.params.id)
      .then((result) =>
        res
          .status(200)
          .send({
            type: "success",
            message: "User data get successfully.",
            data: result,
          })
      )
      .catch((error) =>
        res.status(200).send({ type: "error", message: error.message })
      );
  }

  /****Delete User**************/
  async delete(req, res) {
    return await User.deleteOne({ _id: req.params.id })
      .then((data) =>
        res
          .status(200)
          .send({
            type: "success",
            message: "Selected User deleted successfully",
          })
      )
      .catch((error) =>
        res.status(200).send({ type: "error", message: error.message })
      );
  }

  /****Forgot Password**************/
  async ForgotPassword(req, res) {
    const characters =
      "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let randomToken = "";
    for (let i = 0; i < 20; i++) {
      randomToken += characters[Math.floor(Math.random() * characters.length)];
    }
    var userEmail = req.body.email.toLowerCase();
    var user = await User.findOne({ email: userEmail });
    if (!user) {
      var errors = {
        errors: { email: ["User with this email does not exists"] },
      };
      return res
        .status(200)
        .json({
          type: "error",
          message: "User with this email does not exists",
          data: errors,
        });
    } else if (user.status == 0) {
      return res
        .status(200)
        .json({
          type: "error",
          message:
            "Your account is inactive please verify your account or contact admin in case of any inconvenience",
          data: {},
        });
    } else if (user.status == 2) {
      return res
        .status(200)
        .json({
          type: "error",
          message:
            "Your account is blocked please contact admin in case of any inconvenience",
          data: {},
        });
    }
    user.token = randomToken;
    await user.save();
    const link = `${config.webUrl}reset-password/${user.token}`;
    let emailData = {
      link: link,
      firstname: user.firstname,
      lastname: user.lastname,
      url: process.env.BASE_URL,
    };
    await sendEmail.forgetPasswordEmail(
      user.email,
      "Password reset",
      emailData
    );
    res
      .status(200)
      .send({
        type: "success",
        message: "Password reset link sent to your email account",
      });
  }

  async checkToken(req, res) {
    const user = await User.findOne({ token: req.params.token });
    if (!user) {
      return res
        .status(200)
        .send({
          type: "error",
          message: "Invalid or expired token. Please request new token",
        });
    } else {
      return res
        .status(200)
        .send({ type: "success", message: "Token is valid" });
    }
  }

  /****Reset Password**************/
  async ResetPassword(req, res) {
    var errors = { errors: { email: ["Invalid or expired link"] } };
    try {
      const user = await User.findOne({ token: req.body.token });
      if (!user)
        return res
          .status(200)
          .send({
            type: "error",
            message: "Invalid or expired link",
            data: errors,
          });
      var encrypted_pass = await bcrypt.hash(req.body.password, 10);
      user.password = encrypted_pass;
      user.token = null;
      await user.save();
      res
        .status(200)
        .send({
          type: "success",
          message: "Password reset sucessfully. Please Login now",
          data: user,
        });
    } catch (error) {
      res.send("An error occured");
    }
  }

  /****Verify Account**************/
  async VerifyAccount(req, res) {
    try {
      const user = await User.findOne({ _id: req.body.userId });
      if (!user)
        return res
          .status(200)
          .send({ type: "error", message: "Invalid or expired link" });
      if (user.status == 1)
        return res
          .status(200)
          .send({
            type: "success",
            message:
              "Your account is alreaday verified. Please try login to proceed",
          });
      if (!user.token)
        return res
          .status(200)
          .send({ type: "error", message: "Invalid or expired link" });
      user.status = 1;
      user.token = null;
      await user.save();
      res
        .status(200)
        .send({
          type: "success",
          message: "Congratulations! Your account has been confirmed",
        });
    } catch (error) {
      res
        .status(200)
        .send({ type: "error", message: "Invalid or expired link111" });
    }
  }

  /***************Upload Category Image************/
  async uploadUserImages(req, res, userdata, message) {
    try {
      AWS.config.update({
        accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
        region: process.env.AWS_S3_BUCKET_REGION,
      });
      let file = req.files[0];
      let FOLDER_PATH = "users";
      let ext = file.originalname.split(".").pop().toLowerCase();
      const file_name = Date.now() + "." + ext;
      const FILE_UPLOAD_PATH = FOLDER_PATH + "/" + file_name;
      let params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: FILE_UPLOAD_PATH,
        Body: file.buffer,
      };
      let uploadPromise = await S3.upload(params).promise();
      new UserController().updateUserImageData(
        userdata,
        uploadPromise,
        req,
        res,
        message
      );
    } catch (e) {
      //console.log('upload image exception', e)
      res
        .status(200)
        .send({
          type: "error",
          message: "Some error occured please try again later",
        });
    }
  }

  /***************Update User Image Field************/
  async updateUserImageData(userdata, imageData, req, res, message) {
    try {
      const update_record = await User.findByIdAndUpdate(
        userdata._id,
        { user_image: imageData.key, bucket_name: imageData.Bucket },
        { new: true }
      ).exec();
      return res
        .status(200)
        .send({ type: "success", message: message, data: update_record });
    } catch (err) {
      return res
        .status(200)
        .send({
          type: "error",
          message: "Some error occured please try again later",
        });
    }
  }

  /*********************Logou User ANd Update Column ******/
  async logout(req, res) {
    return await User.findByIdAndUpdate(req.user.user_id, {
      is_logged_in: false,
    })
      .then((data) =>
        res
          .status(200)
          .send({ type: "success", message: "User logout successfully" })
      )
      .catch((error) =>
        res
          .status(200)
          .send({
            type: "error",
            message: "There is a problem to logout this user,please try later",
            "api-error": error.message,
          })
      );
  }

  /***************Remove Old User Image************/
  async removeUserImage(userdata) {
    if (userdata.user_image !== null) {
      var oldFileParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: userdata.user_image,
      };
      await S3.deleteObject(oldFileParams).promise();
    }
  }

  async checkStatus(req, res) {
    await User.findById(req.user.user_id)
      .then(function (result, error) {
        if (result) {
          res.status(200).send(result);
        } else {
          res.status(200).send({ message: error.message });
        }
      })
      .catch((error) =>
        res.status(200).send({ type: "error", message: error.message })
      );
  }

  /**** Update  User Status **************/
  async updateStatus(req, res) {
    let data = await User.findById(req.params.id);
    let new_status = data.status == 1 ? 0 : 1;
    return await User.findOneAndUpdate(
      { _id: req.params.id },
      { status: new_status },
      { new: true }
    )
      .then((result) =>
        res
          .status(200)
          .send({
            type: "success",
            new_status: new_status,
            message: "User status updated successfully.",
          })
      )
      .catch((error) =>
        res
          .status(200)
          .send({
            type: "error",
            new_status: new_status,
            message: error.message,
          })
      );
  }

  /**** Block/Unblock  User **************/
  async blockUnblockUser(req, res) {
    let data = await User.findById(req.params.id);
    let new_status = data.status === 1 ? 2 : 1;
    let msg =
      data.status === 1
        ? "User blocked successfully."
        : "User unblocked successfully.";
    return await User.findOneAndUpdate(
      { _id: req.params.id },
      { status: new_status },
      { new: true }
    )
      .then((result) =>
        res
          .status(200)
          .send({ type: "success", new_status: new_status, message: msg })
      )
      .catch((error) =>
        res
          .status(200)
          .send({
            type: "error",
            new_status: new_status,
            message: error.message,
          })
      );
  }

  async getDashboardData(req, res) {
    var members = await User.find({ role: 2 }).countDocuments();
    var tickets = await Ticket.find({ status: 1 }).countDocuments();
    var totalRevenue = await SubscriptionReport.aggregate([
      { $group: { _id: null, net_amount: { $sum: "$net_amount" } } },
    ]);
    var currentYear = new Date().getFullYear();
    var lastYear = new Date().getFullYear() - 1;
    var lastTwoYearRevenue = await SubscriptionReport.aggregate([
      {
        $match: {
          created_at: {
            $gte: new Date(lastYear, 1, 1),
            $lt: new Date(currentYear, 12, 31),
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { date: "$created_at", format: "%Y-%m" } },
          net_amount: {
            $sum: {
              $cond: [{ $not: ["$net_amount"] }, 0, "$net_amount"],
            },
          },
        },
      },
      { $project: { _id: "$_id", net_amount: "$net_amount" } },
    ]);

    return res
      .status(200)
      .send({
        type: "success",
        members: members,
        tickets: tickets,
        total_revenue: totalRevenue,
        lastTwoYearRevenue: lastTwoYearRevenue,
      });
  }
};
