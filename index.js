const express = require('express')
const db = require('./dbConnectExec.js')

const app = express();

app.get("/hi",(req,res)=>{
    res.send("hello world")
})

app.get("/videogame", (req,res)=>{
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

app.get("/videogame/:pk", (req,res) =>{
    var pk = req.params.pk
    // console.log("my PK: ", pk)

    var myQuery = `SELECT *
    FROM VideoGame
    LEFT JOIN GameMode
    ON GameMode.ModePK = VideoGame.ModeFK
    WHERE GamePK = ${pk}`

    db.executeQuery(myQuery)
    .then((game) =>{
        // console.log("Game: ", game)

        if (game[0]){
            res.send(game[0])
        } else {res.status(404).send('bad request')}
    })
    .catch((error) => {
        console.log("error in /game/pk", error)
        res.status(500).send()
    })
} )
app.listen(5000,()=>{console.log("app is running on port 5000")})