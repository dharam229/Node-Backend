var mongoose = require("mongoose"),
  Schema = mongoose.Schema;
var mongoosePaginate = require("mongoose-paginate");
const { adminRoles } = require("../configs/constant");

const UserSchema = new Schema(
  {
    firstname: { type: String, default: "" },
    lastname: { type: String, default: "" },
    email: { type: String, default: null },
    phone: { type: String, default: null },
    about: { type: String, default: "" },
    prefrence: { type: String, default: "" },
    address: { type: String, default: "" },
    country: { type: String, default: "" },
    state: { type: String, default: "" },
    city: { type: String, default: "" },
    interests: [{ type: String, default: "" }],
    hobbies: [{ type: String, default: "" }],
    likes: [{ type: String, default: "" }],
    password: { type: String, select: false, default: null },
    is_logged_in: { type: Boolean, default: false },
    facebook_token: { type: String, default: null },
    google_token: { type: String, default: null },
    apple_token: { type: String, default: null },
    token: { type: String, default: null },
    mango_id: { type: Number, default: 1 },
    user_image: { type: String, default: null },
    bucket_name: { type: String, default: null },
    agree_term: { type: Number, default: 0 },
    gender: { type: Number, default: 0 }, //1=Men,2=Women
    role: { type: Number, default: 2 }, //1=Admin,2=User
    plan_id: { type: Schema.Types.ObjectId, ref: "Plan", default: null }, //User subscription plan
    payment_status: { type: String, default: null }, //User subscription plan
    payment_refrence_token: { type: String, default: null }, //User subscription plan
    sub_date: { type: Number, default: null }, //Date when user purchased subscription
    sub_reneual_date: { type: Number, default: null }, //Date for subscription renual
    status: { type: Number, default: 0 },
    stripe_customer: { type: String, default: null },
    created_by: { type: Schema.Types.ObjectId, ref: "User", default: null },
    updated_by: { type: Schema.Types.ObjectId, ref: "User", default: null },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

UserSchema.statics.getNextId = async function (modelName, callback) {
  let incr = await this.findOne()
    .sort({ field: "asc", created_at: -1 })
    .limit(1);
  console.log("incr", incr);
  if (!incr) return (incr = 1);
  incr.mango_id++;
  console.log("incr.mango_id", incr.mango_id);
  return incr.mango_id;
};

UserSchema.post("init", function () {
  if (this.firstname == "") {
    this.firstname = "No";
    this.lastname = "Name";
  }
});

// Sets the created_at parameter equal to the current time
UserSchema.pre("save", function (next) {
  now = new Date();
  this.updated_at = now;
  if (!this.created_at) {
    this.created_at = now;
  }
  next();
});

UserSchema.virtual("mango_season_id").get(function () {
  return "M000" + this.mango_id;
});

UserSchema.virtual("virtual_address").get(function () {
  return this.address === ""
    ? this.city !== ""
      ? this.country !== ""
        ? this.city + ", " + this.country
        : ""
      : ""
    : this.address;
});

UserSchema.virtual("fullname").get(function () {
  return this.firstname + " " + this.lastname;
});

UserSchema.virtual("rolename").get(function () {
  var new_array = adminRoles.filter((item) => item.id === this.role);
  if (new_array.length > 0) {
    return new_array[0].name;
  }
});

UserSchema.virtual("aws_path").get(function () {
  var bucket_name =
    this.bucket_name !== null
      ? this.bucket_name
      : process.env.AWS_S3_BUCKET_NAME;
  return "https://" + bucket_name + ".s3.amazonaws.com/";
});

UserSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("User", UserSchema);
