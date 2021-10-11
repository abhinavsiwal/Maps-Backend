const { v4: uuidv4, v4 } = require("uuid");
const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const User = require("../models/user");

const DUMMY_USERS = [
  {
    id: "u1",
    name: "Max Schwarz",
    email: "test@test.com",
    password: "testers",
  },
];

const getUsers =async (req, res,next) => {
  
    let users;
    try {
        users = await User.find({},'-password');
    } catch (err) {
        console.log(err);
        const error = new HttpError(
          "Fetching users failed,please try again later.",
          500
        );
        return next(error);
    };
    res.json({users:users.map(user=>user.toObject({getters:true}))});
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);

    throw new HttpError("Invalid Inputs passed,please check your data", 422);
  }
  const { name, email, password, image,places } = req.body;
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

  const createdUser = new User({
    name,
    email,
    image,
    password,
    places
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

  res.status(201).json({ user: createdUser.toObject({getters:true}) });
};

const login =async (req, res,next) => {
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
    const error = new HttpError(
      "Login failed,please try again later.",
      500
    );
    return next(error);
  }

  if(!existingUser||existingUser.password!==password){
    const error = new HttpError(
        "Invalid Credentials,could not login.",
        401
      );
      return next(error);
  }

  res.json({ message: "Logged In" });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
