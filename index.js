const express = require('express')
const db = require('./dbConnectExec.js')

const app = express();

app.get("/hi",(req,res)=>{
    res.send("hello world")
})

app.get("/movies", (req,res)=>{
    //get data from database
    db.executeQuery(`SELECT *
    FROM VideoGame
    LEFT JOIN GameMode
    ON GameMode.ModePK = VideoGame.ModeFK`)
    .then((result) => {
        res.status(200).send(result)
    })
    .catch((error) => {
        console.log(error);
        res.status(500).send()
    })
})

app.listen(5000,()=>{console.log("app is running on port 5000")})