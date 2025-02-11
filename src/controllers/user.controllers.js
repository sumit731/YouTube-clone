const apiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/user.models");
const {uploadOnCloudinary} = require("../utils/cloudinary");
const apiResponse = require("../utils/apiResponse")

const genrateAccessAndRefreshToken = asyncHandler(async(userId) => {
  try{
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken =await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    user.save({validateBeforeSave: false});

    return {accessToken, refreshToken};
  }
  catch(error){
    throw new apiError(500, "Something went wrong while generating refresh and access token");
  }
})

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

  const userExist = await User.findOne({ $or: [{ username }, { email }] });
  if(userExist){
    throw new apiError(409, "User already exist");
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  console.log("avatarLocation" , avatarLocalPath)
  console.log("coverIMagePath local",coverImageLocalPath);
  
  if(!avatarLocalPath){
    throw new apiError(400, "Avatar is required LocalPath");
  }

  //upload on cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  console.log("avatar return",avatar)
  console.log("coverImage return",coverImage)

  if(!avatar || !avatar.url){
    throw new apiError(400, "Avatar is required checking");
  }

  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username : username.toLowerCase()
  })

  const createUser = await User.findById(user._id).select("-password -refreshToken")
  if(!createUser){
    throw new apiError(500, "something went wrong white registering the user")
  }

  return res.status(201).json(
    new apiResponse(200, createUser, "User registered Successfully")
  )


  // res.status(200).json({message: "user registered successfully"})
});

const loginUser = asyncHandler(async(req,res) => {
  //req body -> data
  // username or email
  // find the user
  // password check
  // access and refresh token
  // send cookie
  // send response

  const { email, username, password } = req.body;

  if(!username && !email){
    throw new apiError(400, "username or email is required");
  }

  const user = await User.findOne({
    $or: [{username},{email}]
  })

  if(!user){
    throw new apiError(404, "User not found");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if(!isPasswordValid){
    throw new apiError(401, "Password is incorrect");
  }

  const {accessToken, refreshToken} = await genrateAccessAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  const option = {
    httpOnly: true,
    secure: true
  }

  return res
  .status(200)
  .cookie("accessToken", accessToken, option)
  .cookie("refreshToken", refreshToken, option)
  .json(
    new apiResponse(
      200,
      {
        user: loggedInUser, accessToken, refreshToken
      },
      "User Logged In Successfully"
    )
  )

})

const logoutUser = asyncHandler(async(req,res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined
      }
    },
    {
      new: true
    }
  )

  const options = {
    httpOnly: true,
    secure: true
  }

  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(new apiResponse(200, null, "User Logged Out Successfully"))
})

const refreshAccessToken = asyncHandler(async(req,res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if(!incomingRefreshToken){
    throw new apiError(401, "Invalid Refresh Token")
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  
    const user = await User.findById(decodedToken?._id)
  
    if(!user){
      throw new apiError(401, "Invalid Refresh Token")
    }
  
    if(user?.refreshToken !== incomingRefreshToken){
      throw new apiError(401, "Invalid Refresh Token")
    }
  
    const options = {
      httpOnly: true,
      secure: true
    }
  
    const {accessToken, newRefreshToken} = await user.generateAccessToken(user._id);
  
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
      new apiResponse(
        200,
        {
          accessToken, refreshToken: newRefreshToken
        },
        "Access Token Refreshed Successfully"
      )
    )
  } catch (error) {
    throw new apiError(500, "Something went wrong while refreshing access token")
  }
})

module.exports = { registerUser, loginUser, logoutUser, refreshAccessToken };
