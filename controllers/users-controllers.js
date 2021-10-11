const { v4: uuidv4, v4 } = require('uuid');
const HttpError = require('../models/http-error')
const {validationResult}=require('express-validator')

const DUMMY_USERS=[{
    id:"u1",
    name:"Max Schwarz",
    email:'test@test.com',
    password:"testers",
}]

const getUsers=(req,res)=>{
    res.json({users:DUMMY_USERS});
}

const signup=(req,res)=>{
    const errors =validationResult(req);
    if(!errors.isEmpty()){
      console.log(errors);
  
      throw new HttpError('Invalid Inputs passed,please check your data',422)
    }
    const {name,email,password}=req.body;
    const hasUser = DUMMY_USERS.find(u=>u.email===email );
    if(hasUser){
        throw new HttpError('User already exists',422)
    }
    const createdUser={
        id:v4(),
        name,
        email,
        password,
    }
    DUMMY_USERS.push(createdUser);
    res.status(201).json({user:createdUser});
}

const login=(req,res)=>{
    const errors =validationResult(req);
    if(!errors.isEmpty()){
      console.log(errors);
  
      throw new HttpError('Invalid Inputs passed,please check your data',422)
    }
    const {email,password}=req.body;

    const identifiedUser=DUMMY_USERS.find(u=>u.email===email);
    if(!identifiedUser ||identifiedUser.password!==password){
        throw new HttpError('Could not identify User',401);
    }
    res.json({message:"Logged In"})
}

exports.getUsers=getUsers;
exports.signup=signup;
exports.login=login;