const express = require('express')
const bcrypt = require('bcryptjs')
const db = require('./dbConnectExec.js')

const app = express();
app.use(express.json())

app.get("/hi",(req,res)=>{
    res.send("hello world")
})

app.post("/player", async (req,res)=>{
    //res.send("creating user")
    //console.log("request body", req.body)

    var FirstName = req.body.FirstName;
    var LastName = req.body.LastName;
    var email = req.body.email;
    var password = req.body.password;

    if(!FirstName || !LastName || !email || !password){
        return res.status(400).send("bad request")
    }

    FirstName = FirstName.replace("'","''")
    LastName = LastName.replace("'","''")

    var emailCheckQuery = `SELECT email
    FROM Player
    WHERE email = '${email}'`

    var existingUser = await db.executeQuery(emailCheckQuery)

    //console.log("existing user", existingUser)
    if(existingUser[0]){
        return res.status(409).send('Please enter a different email')
    }

    var hashedPassword = bcrypt.hashSync(password)

    var insertQuery = `INSERT INTO Player(FirstName, LastName, Email, Password)
    VALUES('${FirstName}','${LastName}','${email}','${hashedPassword}')`

    db.executeQuery(insertQuery)
    .then(()=>{res.status(201).send})
    .catch(()=>{
        console.log("error in POST /player", err)
        res.status(500).send()
    })
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