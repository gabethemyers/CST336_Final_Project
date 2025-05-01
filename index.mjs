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
  waitForConnections: true,
  connectionLimit: 10
});

// I put this to check if the user logged in
function requireLogin(req, res, next) {
  // check session or JWT here
  next();
}

// ——— Routes ———


// home page
app.get('/', requireLogin, (req, res) => {
  res.render('home.ejs', { title: 'Home' });
});

// DB test
app.get('/dbTest', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT CURDATE() AS today');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Server error');
});

// start server
app.listen(3000, ()=>{
    console.log("Express server running")
});