const sql = require('mssql')
const sproulConfig = require('./config.js')

const config = {
    user: sproulConfig.DB.user,
    password: sproulConfig.DB.password,
    server: sproulConfig.DB.server, // You can use 'localhost\\instance' to connect to named instance
    database: sproulConfig.DB.database,
}

async function executeQuery(aQuery){
    var connection = await sql.connect(config)
    var result = await connection.query(aQuery)

    return result.recordset
}

module.exports = {executeQuery: executeQuery}
// executeQuery(`SELECT *
// FROM VideoGame
// LEFT JOIN GameMode
// ON GameMode.ModePK = VideoGame.ModeFK`)