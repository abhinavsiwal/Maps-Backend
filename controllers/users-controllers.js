const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      "Fetching users failed,please try again later.",
      500
    );
    return next(error);
  }
  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);

    throw new HttpError("Invalid Inputs passed,please check your data", 422);
  }
  const { name, email, password } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      "Signing up failed,please try again later.",
      500
    );
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      "User already Exist,please login instead.",
      422
    );
    return next(error);
  }

  //Bycrpt password
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    console.log(err);
    const error = new HttpError("Could not create user,please try again", 500);
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    image: req.file.path,
    password: hashedPassword,
    places: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      "Signing up failed,please try again later.",
      500
    );
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      "secret",
      { expiresIn: "1h" }
    );    
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      "JWT signup error.",
      500
    );
    return next(error);
  }


  res.status(201).json({userId:createdUser.id,email:createdUser.email,token:token });
};

const login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);

    throw new HttpError("Invalid Inputs passed,please check your data", 422);
  }
  const { email, password } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    console.log(err);
    const error = new HttpError("Login failed,please try again later.", 500);
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError("Invalid Credentials,could not login.", 401);
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    console.log(err);
    const error = new HttpError("Could not log you in. Please try again later");
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError("Password is not Correct");
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      "secret",
      { expiresIn: "1h" }
    );    
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      `JWT Login Error. ${err}`,
      500
    );
    return next(error);
  }
  res.json({
    userId:existingUser.id,
    email:existingUser.email,
    token:token,
  });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
