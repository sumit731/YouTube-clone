const dotenv = require("dotenv").config();
const { connectDB } = require("./db/db");
const { app } = require("./app");

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("server is not connected: ", error);
    });
    app.listen(process.env.PORT || 5000, () => {
      console.log("mongoDB server is connected: ", process.env.PORT);
    });
  })
  .catch((error) => {
    console.log("mongoDB server is Not connected", error);
  });

// const express = require('express');
// const mongoose = require('mongoose');
// const { DB_NAME } = require('./constant');
// const app = express();

/*( async() => {
    try{
        mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        app.on('error', (error) => {
            console.log("Error: ", error);
        })
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on PORT: ${process.env.PORT}`);
        })
    }
    catch(error){
        console.log("Error: ", error);
        throw error
    }
})()*/
