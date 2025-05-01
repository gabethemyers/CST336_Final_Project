import express from 'express';
import mysql from 'mysql2/promise';

const app = express();

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));

app.use(express.urlencoded({ extended: true }));

const pool = mysql.createPool({
    host: "migueloros.site",
    user: "miguelor_webuser",
    password: "^ta;DW3)V8@$",
    database: "miguelor_final-project",
    connectionLimit: 10,
    waitForConnections: true
});

const conn = await pool.getConnection();

//routes
app.get('/', (req, res) => {
   res.send('Hello Express app!')
});

// Home page 
 app.get('/', (req, res) => { 
    res.render('home.ejs'); 
});


app.get("/dbTest", async(req, res) => {
    let sql = "SELECT CURDATE()";
    const [rows] = await conn.query(sql);
    res.send(rows);
});//dbTest

app.listen(3000, ()=>{
    console.log("Express server running")
});