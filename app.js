const express = require("express");
const app = express();
require("dotenv").config();
// PARA CAPTURAR LOS DATOS DEL FORMULARIO
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
// RUTAS ===siempre apunta a la carpeta public===
app.use("/resources", express.static("public"));
app.use("/resources", express.static(__dirname + "/public"));

// MOTOR DE PLANTILLAS
app.set("view engine", "ejs");
// BCRYPT
const bcrypt = require("bcryptjs");
// SESSION
const session = require("express-session");
app.use(
  session({
    secret: "secreto",
    resave: true,
    saveUninitialized: true,
  })
);
// CONEXION A LA DB
const dbCon = require("./dataBase/config");
// RUTAS
app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/register", (req, res) => {
  res.render("register");
});
// registro
app.post("/register", async (req, res) => {
    const {user, name, rol, pass} = req.body;
    let passHash = await bcrypt.hash(pass,8);
    dbCon.query('INSERT INTO users SET ?', {
        user: user,
        name: name,
        rol: rol,
        pass: passHash
    }, async(err,result)=>{
        if (err) { console.log(err)}
        res.render('register',{
            alert: true,
            alertTitle: "Registro",
            alertMessage: "Registro completo",
            alertIcon: 'success',
            showConfirmButton: false,
            time: 1500,
            ruta: ''
        })
    })
});
// autenticar/LOGIN
app.post('/auth', async (req, res)=>{
    const {user, pass} = req.body;
    // let passHash = await bcrypt.hash(pass,8);
    if(user && pass){
        dbCon.query('select * from users where user = ?', [user],
        async (err, result)=>{
            if (result.length == 0 || !(await bcrypt.compare(pass, result[0].pass))) {
                res.render('login',{
                    alert: true,
                    alertTitle: "ERROR",
                    alertMessage: "Usuario y/o contraseña incorrecta",
                    alertIcon: 'error',
                    showConfirmButton: false,
                    time: false,
                    ruta: 'login'
                })
            }
            else{
                req.session.loggedin = true;
                req.session.name = result[0].name
                res.render('login',{
                    alert: true,
                    alertTitle: "Conexion exitosa",
                    alertMessage: "Login correcto",
                    alertIcon: 'success',
                    showConfirmButton: false,
                    time: 1500,
                    ruta: ''
                })
            }
        })
    }else{
        res.send('Ingresa los datos')
    }

})
// AUTH resto de paginas
app.get('/', (req,res) =>{
    if (req.session.loggedin){
        res.render('index',{
            login: true,
            name: req.session.name
        })
    }else{
        res.render('index',{
            login: false,
            name: 'DEBE INICIAR SESION '
        })
    }
})
// logout
app.get('/logout', (req,res)=>{
    req.session.destroy(()=>{
        res.redirect('/')
    })
})
//
app.listen(3000, (req, res) => {
  console.log("Servidor ejecutandose");
});
