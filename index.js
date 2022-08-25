const express = require("express");
const bodyParser = require("body-Parser");
const routes = require("./src/routes/route.js");
const mongoose = require('mongoose');
require('dotenv').config();


const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


mongoose.connect(process.env.MONGODB_STRING,
    { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB running on 27017'))
    .catch(err => console.log(err))

app.use('/', routes);

const multer = require("multer");
const upload = multer({
    dest: "images",
    limits: {
        fileSize: 1000000
    }
});

app.post("/upload", upload.single("upload"), function(req, res) {
    res.status(200).send({ status: true, msg: "Successfully Uploaded!" });
    return
});

app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port: ' + (process.env.PORT || 3000));
});