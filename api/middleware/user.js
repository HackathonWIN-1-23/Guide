const User = require("../models/User.js");

const userMiddleware = async (req, res, next) => {
  const token = req.get("Authorization");
  if (!token) {
    return next();
  }
  try {
    const user = await User.findOne({ token });
    if (!user) {
      return next();
    }
    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = userMiddleware;