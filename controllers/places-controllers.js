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

const getPlaceById = (req, res, next) => {
  const placeId = req.params.pid;
  const place = DUMMY_PLACES.find((p) => {
    return p.id === placeId;
  });
  if (!place) {
    throw new HttpError("Could not find a place for the provided id.", 404);
  }

  console.log(place);
  res.json({ place });
};

const getPlacesByUserId = (req, res) => {
  const userId = req.params.uid;
  const places = DUMMY_PLACES.filter((p) => {
    return p.creator === userId;
  });
  if (!places || places.length === 0) {
    throw new HttpError("Could not find a place for the provided id.", 404);
  }
  res.json({ places });
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

const updatePlaceById = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);

    throw new HttpError("Invalid Inputs passed,please check your data", 422);
  }
  const { title, description } = req.body;
  const placeId = req.params.pid;

  const updatedPlace = { ...DUMMY_PLACES.find((p) => p.id === placeId) };
  const placeIndex = DUMMY_PLACES.findIndex((p) => p.id === placeId);
  updatedPlace.title = title;
  updatedPlace.description = description;

  DUMMY_PLACES[placeIndex] = updatedPlace;

  res.status(200).json({ place: updatedPlace });
};

const deletePlace = (req, res) => {
  const placeId = req.params.pid;
  if (!DUMMY_PLACES.find((p) => p.id === placeId)) {
    throw new HttpError("Could not find the place for that Id", 404);
  }
  DUMMY_PLACES = DUMMY_PLACES.filter((p) => p.id !== placeId);
  res.status(200).json({ message: "Deleted Place" });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlaceById = updatePlaceById;
exports.deletePlace = deletePlace;
