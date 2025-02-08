const mongoose = require("mongoose");
const { DB_NAME } = require("../constant");

const connectDB = async () => {
  try {
    const connectInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `mongoDB is connected || DB HOST : ${connectInstance.connection.host}`
    );
  } catch (error) {
    console.log("MongoDB connection failed: ", error);
    process.exit(1);
  }
};
module.exports = {connectDB};
