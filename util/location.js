const axios =require('axios');
const HttpError=require('../models/http-error')

const API_KEY=process.env.GOOGLE_API_KEY;

const getCoordsForAddress=async(address)=>{
    // try {
    //         const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`);

    //         const data = response.data;
    //         console.log(address);
    //         console.log(data);
    //         if(!data||data.status==='ZERO_RESULTS'){
    //             const error = new HttpError('Could not find location for specified Address',422);
    //             throw error;
    //         }
    //         const coordinates=data.results[0].geometry.location;
    //         return coordinates;
    // } catch (err) {
    //     console.log(err);
    //     const error = new HttpError('Could not find location for specified Address',422);
    //     throw error;
    // }


    const coordinates={
        lat:40.7484474,
        lng:-73.9871516,
    }
    return coordinates;
}

module.exports=getCoordsForAddress;