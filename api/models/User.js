const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { randomUUID } = require("crypto");
const { Schema, model } = mongoose;

const SALT_WORK_FACTOR = 10;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: async function (email) {
        if (!this.isModified("email")) return true;
        const user = await this.constructor.findOne({ email: email});
        return !Boolean(user);
      },
      message: "This user is already registered",
    },
  },
  displayName: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    default: "user",
    enum: ["user", "admin"],
  },
  avatar: {
    type: String,
    required: true,
  },
  googleId: String,
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.checkPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

UserSchema.methods.generateToken = function () {
  this.token = randomUUID();
};

UserSchema.set("toJSON", {
  transform: function (doc, ret, _options) {
    delete ret.password;
    return ret;
  },
});

const User = model("User", UserSchema);
module.exports = User;
