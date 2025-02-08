const { apiError } = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/user.models");
const {uploadOnCloudinary} = require("../utils/cloudinary");

const registerUser = asyncHandler(async (req, res) => {
  // get user detail from frontend
  // validation - not empty
  // check if user already exist: username, email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // upload them to cloudinary, avatar
  // create user object - create entery in database
  // remove password and refresh token field from response
  // check for user creation
  // return response

  const { email, password, username, fullname } = req.body;
  console.log(email, password, username, fullname);

  if (
    [username, fullname, email, password].some((field) => field?.trim() === "")
  ) {
    throw new apiError(400, "All fields are required");
  }

  const userExist = User.findOne({ $or: [{ username }, { email }] });
  if(userExist){
    throw new apiError(409, "User already exist");
  }

  const avatarLocalPath = req.files?.avatar[0].path;
  const coverImageLocalPath = req.files?.coverImage[0].path;

  if(!avatarLocalPath){
    throw new apiError(400, "Avatar is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if(!avatar){
    throw new apiError(400, "Avatar is required");
  }
  

  // res.status(200).json({message: "user registered successfully"})
});

module.exports = { registerUser };
