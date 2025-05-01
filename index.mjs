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

// Home page 
 app.get('/', (req, res) => { 
    res.render('home.ejs'); 
});

// Login page
app.get('/login', (req, res) => {
    res.render('login.ejs');
});

// Login form submission
app.post('/login', async(req, res) => {
    const { username, password } = req.body;
    const sql = "SELECT * FROM users WHERE username = ? AND password = ?";
    const [rows] = await conn.query(sql, [username, password]);
    // if login is valid, takes to landing.ejs. Else goes back to login.ejs and displays error message
    if (rows.length > 0) {
        res.render('landing.ejs');
    } else {
        res.render('login.ejs', { error: 'Invalid username or password' });
    }
});

// Signup page
app.get('/signUp', (req, res) => {
    res.render('signUp.ejs');
});

app.get("/dbTest", async(req, res) => {
    let sql = "SELECT CURDATE()";
    const [rows] = await conn.query(sql);
    res.send(rows);
});//dbTest

app.listen(3000, ()=>{
    console.log("Express server running")
});