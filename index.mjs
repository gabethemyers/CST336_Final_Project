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

app.post('/addItem', isAuthenticated, async (req, res) => { //take user to wishlist for them to see the updated wishlist
    let itemName = req.body.itemName;
    //let itemDesc = req.body.itemDescription;
    let itemPrice = req.body.itemPrice;
    let itemLink = req.body.itemLink;
    let itemImg = req.body.itemImage;
    let userId = req.session.user.id;

    let sql = `INSERT INTO items
                (name, price, link, imageurl, userId)
                VALUES
                (?,?,?,?,?)`;
    let sqlParams = [itemName,itemPrice,itemLink,itemImg,userId];
    const[rows] = await conn.query(sql, sqlParams);

    //console.log(itemName + " " + itemDesc + " " + itemLink + " " + itemPrice + " " + itemImg);
    res.redirect('/viewWishlist');
});

app.post('/removeItem', isAuthenticated, async (req, res) => { //deletes a selected item from the wishlist
    let itemId = req.body.itemId;

    let sql = `DELETE FROM items WHERE itemId = ?`;
    let sqlParams = [itemId];
    const[rows] = await conn.query(sql, sqlParams);
    console.log("Deleted: " + itemId);
    res.redirect('/viewWishlist');
});

//user clicks items in their own wishlist to edit them
// app.get('/editItem', isAuthenticated, async(req, res) => {
//     let itemId = req.query.itemId; //needed to know which item to edit
//     let sql = `SELECT * FROM items WHERE itemId = ?`;
//     let sqlParams = [itemId];
//     const[rows] = await conn.query(sql, sqlParams);


//     res.render('editItem.ejs',{itemDetails:rows});
// });

app.get('/viewWishlist', isAuthenticated, async (req, res) => { //displays all items with matching userId
    let selfUserId = req.session.user.id;
    let sql = `SELECT itemId, name, price, imageurl, link FROM items WHERE userId = ?`;
    let sqlParams = [selfUserId];
    const[rows] = await conn.query(sql, sqlParams);
    console.log(rows);
    res.render('viewWishlist.ejs',{items: rows});
});

app.get('/friends', isAuthenticated, async(req, res) => { //displays all friends
    let selfUserId = req.session.user.id;
    let sql = `SELECT u.username, u.userid as friendUserId 
    FROM friends f
    JOIN users u ON (u.userid = f.userid1 OR u.userid = f.userid2) AND u.userid != ?
    WHERE f.userid1 = ? OR f.userid2 = ?`;
    let sqlParams = [selfUserId, selfUserId, selfUserId];
    const[rows] = await conn.query(sql, sqlParams);
    console.log(rows);
    res.render('friends.ejs',{friends:rows});
});

app.get('/friends/:friendId/list', isAuthenticated, async(req, res) => { //displays all friends
    let friendUserId = req.params.friendId;
    const [userRows] = await conn.query('SELECT username FROM users WHERE userid = ?', [friendUserId]);
    const friendUsernameToDisplay = userRows[0].username;

    let friendsSql = `SELECT u.username, u.userid as friend_user_id
    FROM friends f
    JOIN users u ON (u.userid = f.userid1 OR u.userid = f.userid2) AND u.userid != ?
    WHERE (f.userid1 = ? OR f.userid2 = ?)`;
    let friendsSqlParams = [friendUserId, friendUserId, friendUserId]; 
    const [rows] = await conn.query(friendsSql, friendsSqlParams);
    res.render('viewFriendsFriends.ejs', {
        viewingFriendUsername: friendUsernameToDisplay,
        friends: rows, 
    });
});

app.get('/addFriend', isAuthenticated, async(req, res) => { //displays all friends
    res.render('addFriend.ejs');
});

app.post('/addFriend', isAuthenticated, async(req, res) => { //displays all friends
    let currentUserId = req.session.user.id;
    let friendUsername = req.body.friendUsername;
   
    const sql = `SELECT userid, username FROM users WHERE username = ?`;
    const sqlParams = [friendUsername];
    const [rows] = await conn.query(sql, sqlParams);

    if (rows.length > 0) {
        let friendUserId = rows[0].userid;

        // Check if the friend already exists in the friends table
        const checkSql = `SELECT * FROM friends WHERE (userid1 = ? AND userid2 = ?) OR (userid1 = ? AND userid2 = ?)`;
        const checkParams = [currentUserId, friendUserId, friendUserId, currentUserId];
        const [checkRows] = await conn.query(checkSql, checkParams);

        if (checkRows.length > 0) {
            return res.render('addFriend.ejs', { error: 'Friend already exists!' });
        } else if (currentUserId === friendUserId) {
            return res.render('addFriend.ejs', { error: 'You cannot add yourself as a friend!' });
        } else {
            let sql = `INSERT INTO friends (userid1, userid2) VALUES (?, ?)`;
            let sqlParams = [currentUserId, friendUserId];
            await conn.query(sql, sqlParams);
            res.render('addFriend.ejs', { success: 'Successfully added friend!' });
        }
    }
    else {
        res.render('addFriend.ejs', { error: 'User not found' });
    }
});

app.get('/friendsWishlist', isAuthenticated, async(req, res) => { //displays all friends
    let friendUserId = req.query.friendId;
    console.log("Friend ID Retrieved: " + friendUserId);
    let sql = `SELECT * FROM items WHERE userId = ?`;
    let sqlParams = [friendUserId];
    const[rows] = await conn.query(sql, sqlParams);
    let ownUserId = req.session.user.id;
    console.log(rows);
    res.render('friendsWishlist.ejs',{items: rows, ownUserId: ownUserId, friendUserId: friendUserId});
});

app.post('/markItem', isAuthenticated, async(req, res) => { //displays all friends
    let itemId = req.body.itemId;
    let userId = req.session.user.id;
    console.log("user ID Retrieved: " + userId);
    let friendUserId = req.body.friendUserId; 
    let sql2 = `UPDATE items SET markedUserId = ? WHERE itemId = ?`;
    let sqlParams2 = [userId, itemId];
    const[rows2] = await conn.query(sql2, sqlParams2);

    let sql = `SELECT * FROM items WHERE userId = ?`;
    let sqlParams = [friendUserId];
    const[rows] = await conn.query(sql, sqlParams);
    console.log(rows);
    res.render('friendsWishlist.ejs',{items: rows, ownUserId: userId, friendUserId: friendUserId});
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