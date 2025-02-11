const express = require("express")
const {registerUser, refreshAccessToken} = require("../controllers/user.controllers")
const upload = require("../middlewares/multer.middleware")

const router = express.Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ])
    ,registerUser)

router.route("/login").post(loginUser)

//secure route
router.route("/logout").post(verifyJWT ,logoutUser)
router.route("/refreshToken").post(refreshAccessToken)

module.exports = router