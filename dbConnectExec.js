const sql = require('mssql')
const sproulConfig = require('./config.js')

const config = {
    user: sproulConfig.config.DB.user,
    password: sproulConfig.config.DB.password,
    server: sproulConfig.config.DB.server, // You can use 'localhost\\instance' to connect to named instance
    database: sproulConfig.config.DB.database,
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