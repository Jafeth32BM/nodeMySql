const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'test'
})

connection.connect((err)=>{
    if (err) {console.log('FALLO DE CONEXION: '+err); return;}
    console.log('DB Online! ! !')
});

module.exports = connection;