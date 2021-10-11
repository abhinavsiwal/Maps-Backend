const HttpError = require("../models/http-error");
const { v4: uuidv4, v4 } = require("uuid");
const { validationResult } = require("express-validator");
const getCoordsForAddress = require("../util/location");
const Place = require("../models/place");
let DUMMY_PLACES = [
  {
    id: "p1",
    title: "Empire State Building",
    description: "one of the most scrapers in the world",
    imageUrl:
      "https://images.unsplash.com/photo-1533752125192-ae59c3f8c403?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1374&q=80",
    address: "20 W st NewYork",
    location: {
      lat: 40.7484,
      lng: 73.9857,
    },
    creator: "u1",
  },
  {
    id: "p2",
    title: "Empire State Sky",
    description: "one of the most scrapers in the world",
    imageUrl:
      "https://images.unsplash.com/photo-1533752125192-ae59c3f8c403?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1374&q=80",
    address: "20 W st NewYork",
    location: {
      lat: 40.7484,
      lng: -73.9857,
    },
    creator: "u1",
  },
];

const getPlaceById = async(req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try{
    place = await Place.findById(placeId);
  }catch(err){
    console.log(err);
    const error = new HttpError('Something went wrong,could not find a place',500);
    return next(error);
  }

  if (!place) {
    const error = new HttpError('Could not find a place for provided Id',404);
    return next(error);
  }

  console.log(place);
  res.json({ place:place.toObject({getters:true}) });
};

const getPlacesByUserId = async(req, res,next) => {
  const userId = req.params.uid;
  let places
  try{
    places = await Place.find({creator:userId})
  }catch(err){
    console.log(err);
    const error = new HttpError('Fetching places failed, please try again later',500);
    return next(error);
  }
  if (!places || places.length === 0) {
    throw new HttpError("Could not find a place for the provided id.", 404);
  }
  res.json({ places:places.map(place=>place.toObject({getters:true})) });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);

    next(new HttpError("Invalid Inputs passed,please check your data", 422));
  }
  const { title, description, address, creator,image } = req.body;
  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    console.log(error);
    return next(error);
  }
  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image,
    creator,
  });
  try{
   await createdPlace.save();
  }catch(err){
    console.log(err);
    const error = new HttpError('Creating Place failed,please try again',400)
    return next(error);
  }
  res.status(201).json({ place: createdPlace });
};

const updatePlaceById = async(req, res,next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);

    return next( new HttpError("Invalid Inputs passed,please check your data", 422));
  }
  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place;
  try{
    place = await Place.findById(placeId);
  }catch(err){
    console.log(err);
    const error = new HttpError('Something went wrong,could not update Place',500);
    return next(error);
  }

  place.title = title;
  place.description = description;

  try{
    await place.save();
  }catch(err){
    console.log(err);
    const error = new HttpError('Something went wrong,could not update Place',500);
    return next(error);
  }

  res.status(200).json({ place: place.toObject({getters:true}) });
};

const deletePlace = async(req, res) => {
  const placeId = req.params.pid;
 
  let place;
  try{
    place =await Place.findById(placeId);
  }catch(err){
    console.log(err);
    const error = new HttpError('Something went wrong,could not delete Place',500);
    return next(error);
  }
  res.status(200).json({ message: "Deleted Place" });
  try{
   await place.remove();
  }catch(err){
    console.log(err);
    const error = new HttpError('Something went wrong,could not delete Place',500);
    return next(error);
  }
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlaceById = updatePlaceById;
exports.deletePlace = deletePlace;
