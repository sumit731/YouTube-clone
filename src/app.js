const express = require('express');
const cors = require('cors');
const cookies = require('cookie-parser') 

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "20kb"}))
app.use(express.urlencoded({extended: true, limit: "20kb"}))
app.use(express.static("public"))
app.use(cookies())

//import routes files
const userRouter = require("./routes/user.routes")

app.use("/api/v1/users", userRouter)

module.exports = {app}