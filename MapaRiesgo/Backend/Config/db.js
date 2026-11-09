const mysql = require("mysql")

const conection=mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"mapaderiesgo"
})

module.exports=conection