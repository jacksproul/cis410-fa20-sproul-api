const express = require('express')
const bcrypt = require('bcryptjs')
const db = require('./dbConnectExec.js')
const jwt = require('jsonwebtoken')
const config = require('./config.js')
const cors = require('cors')

const app = express();
app.use(express.json())
app.use(cors())
const auth = require('./middleware/authenticate')


app.post("/reviews", auth, async(req,res)=>{

    try{
        var gameFK = req.body.gameFK;
        var rating = req.body.rating;
        var summary = req.body.summary;
    
        if(!gameFK || !rating || !summary){res.status(400).send("bad request")}

        summary = summary.replace("'", "''")
    
        //console.log(req.player)
        //res.send("here is your response")

        let insertQuery = `INSERT INTO Review(Rating, Summary, GameFK)
        OUTPUT inserted.ReviewPK, inserted.Rating, inserted.Summary, inserted.GameFK
        VALUES ('${rating}', '${summary}', ${gameFK})`

        let insertedReview = await db.executeQuery(insertQuery)
        //console.log(insertedReview)
        res.status(201).send(insertedReview[0])
    }
    catch(error){
        console.log("error in POST/reviews")
        res.status(500).send()
    }
})

app.get('/player/me', auth, (req,res)=>{
    res.send(req.player)
})

app.get("/hi",(req,res)=>{
    res.send("hello world")
})

app.post("/player/login", async(req,res)=>{
    //console.log(req.body)

    var email = req.body.email;
    var password = req.body.password;

    if (!email || !password){
        return res.status(400).send('bad request')
    }

    //check that user email exists in db
    var query = `SELECT *
    FROM Player
    WHERE Email = '${email}'`

    let result;

    try{
        result = await db.executeQuery(query);
    }catch(myError){
        console.log('error in /player/login', myError);
        return res.status(500).send()
    }

   // console.log(result);

    if(!result[0]){return res.status(400).send('invalid user credentials')}
    //check that password matches

    let user = result[0]
    //console.log(user)

    if(!bcrypt.compareSync(password,user.Password)){
        console.log("invalid password");
        return res.status(400).send("invalid user credentials");
    }

    //generate token

    let token = jwt.sign({pk: user.PlayerPK}, config.JWT, {expiresIn: '60 minutes'})

    //console.log(token)
    //save token in db and send token and user info back to user
    let setTokenQuery = `UPDATE Player
    SET Token = '${token}'
    WHERE PlayerPK = ${user.PlayerPK}`

    try{
        await db.executeQuery(setTokenQuery)

        res.status(200).send({
            token: token,
            user: {
                FirstName: user.FirstName,
                LastName: user.LastName,
                Email: user.Email,
                PlayerPK: user.PlayerPK
            }
        })
    }
    catch(myError){
        console.log("error setting user token", myError);
        res.status(500).send()
    }
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

const PORT = process.env.PORT || 5000

app.listen(PORT,()=>{console.log(`app is running on port ${PORT}`)})