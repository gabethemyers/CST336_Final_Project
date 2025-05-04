import express from 'express';
import mysql from 'mysql2/promise';
import session from 'express-session';

const app = express();

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));

app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: "best_group_ever",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));

const pool = mysql.createPool({
    host: "migueloros.site",
    user: "miguelor_webuser",
    password: "^ta;DW3)V8@$",
    database: "miguelor_final-project",
    connectionLimit: 10,
    waitForConnections: true
});

const conn = await pool.getConnection();

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/');
    }
}

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
        req.session.user = { id: rows[0].userid, username: rows[0].username };
        res.render('landing.ejs');
    } else {
        res.render('login.ejs', { error: 'Invalid username or password' });
    }
});

// Signup page
app.get('/signUp', (req, res) => {
    res.render('signUp.ejs');
});

// Signup form submission, takes user to login after successful signup
app.post('/signUp', async(req, res) => {
    const { username, password } = req.body;
    const sql = "INSERT INTO users (username, password) VALUES (?, ?)";
    await conn.query(sql, [username, password]);
    res.redirect('/login');
});

app.get('/addItem', isAuthenticated, (req, res) => {
    res.render('addItem.ejs');
});

app.post('/addItem', isAuthenticated, (req, res) => { //take user to wishlist for them to see the updated wishlist
    res.redirect('viewWishlist.ejs');
});

app.post('/removeItem', isAuthenticated, (req, res) => { //deletes a selected item from the wishlist
    res.redirect('viewWishlist.ejs');
});

//user clicks items in their own wishlist to edit them
app.get('/editItem', isAuthenticated, (req, res) => {
    let itemId = req.query.itemId; //needed to know which item to edit
    res.render('editItem.ejs');
});

app.get('/viewWishlist', isAuthenticated, (req, res) => { //displays all items with matching userId
    res.render('viewWishlist.ejs');
});

app.get('/friends', isAuthenticated, (req, res) => { //displays all friends
    res.render('friends.ejs');
});


app.get('/signOut', (req, res) => { //displays all friends
    req.session.destroy();
    res.redirect('/');
});

app.get("/dbTest", async(req, res) => {
    let sql = "SELECT CURDATE()";
    const [rows] = await conn.query(sql);
    res.send(rows);
});//dbTest

app.listen(3000, ()=>{
    console.log("Express server running")
});