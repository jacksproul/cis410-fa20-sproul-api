const jwt = require('jsonwebtoken')
const config = require('../config.js')
const db = require('../dbConnectExec.js')

const auth = async(req,res,next)=>{
    //console.log(req.header('Authorization'))
    try{
        //1. decode token
        let myToken = req.header('Authorization').replace('Bearer ', '')
        //console.log(myToken)

        let decodedToken = jwt.verify(myToken, config.JWT)
        //console.log(decodedToken)

        let PlayerPK = decodedToken.pk;
        console.log(PlayerPK);

        //2. compare token w/ db token
        let query = `SELECT PlayerPK, FirstName, LastName, Email
        FROM Player
        WHERE PlayerPK = ${PlayerPK} and Token = '${myToken}'`

        let returnedUser =  await db.executeQuery(query)
        //console.log(returnedUser)

        //3. save user information in request
        if(returnedUser[0]){
            req.player = returnedUser[0];
            next()
        } else{
            res.status(401).send('Authentication failed.')}

    }catch(myError){
        res.status(401).send("Authentication failed.")
    }
}

module.exports = auth