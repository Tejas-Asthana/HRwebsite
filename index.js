const express = require('express');
const mysql = require('mysql');
const path = require('path');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const login = require('./routes/login.js')
const signup = require('./routes/signup.js')
const opportunities = require('./routes/opportunities.js')
const contactus = require('./routes/contactus.js')
const adminpanel = require('./routes/adminpanel.js')

require('dotenv').config({path: __dirname + '/.env'})

const port = process.env.PORT || 3000 ;
const app = express();

app.use(bodyParser.urlencoded({ extended: false }))
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname , '/')));
app.use(express.static(path.join(__dirname , '/public')));
app.use(express.static(path.join(__dirname , '/views')));
app.use(express.urlencoded({ extended: true }));
app.use(express.raw());
app.use(cookieParser());

const db = mysql.createConnection({
    host     : 'localhost',
    user     : 'admin1234',
    password : 'admin1234',
    database : 'HR_Website'
});

function verifyAdminToken(req, res, next) {
  const bearerHeader = req.cookies.admin
  if(bearerHeader === undefined) {
    res.redirect('/adminpanel')
  }
  else {
    // console.log(bearerHeader)
    req.adminToken = bearerHeader;
    next();
  }
}

// landing page
app.route('/')
  .get((req, res) => {
    const bearerHeader = req.cookies.jwt
    // console.log(bearerHeader )
      if(bearerHeader === undefined) {
        res.status(200).sendFile(path.resolve(__dirname + '/public/home.html'));
      }
      else {
        res.render('home', {
          message:  "as user"
        })
      }
    })
    .post((req, res) => {
      // console.log(req.body);
      let sql = "INSERT INTO applyingUsers SET ?";
      db.query(sql, req.body, (err, result) => {
        if(err) {
          res.status(400).send(`Failed to load your request to database.`);
          throw err;
        }
        else {
          res.status(200).send(`We will reach you shortly ${req.body.email}.`)
          // console.log(result)
        }
      })
    })


// signup page
app.use('/signup', signup)


// logged In view page
app.use('/login', login);


// logout
app.post('/logout', (req, res) => {
  res.clearCookie('jwt');
  res.redirect('/')
})


// Contact Us page
app.use('/contactus', contactus)


// opportunities page
app.use('/opportunities', opportunities)


// adminpanel page
app.use('/adminpanel', adminpanel);


// databasepage page
app.route('/databasepage')
  .get( verifyAdminToken, (req, res) => {
    res.sendFile(__dirname + '/public/databasepage.html')
  })

// databasehrhead json page
app.get('/databasehrhead', verifyAdminToken, (req, res) => {
  let sql = `SELECT * FROM hrHead `;
  let query = db.query(sql, (err, result) => {
      if(err) throw err;
      // console.log(result);
      res.json(result)
  });
})

// contactus json page
app.get('/databasecontactus', verifyAdminToken, (req, res) => {
  let sql = `SELECT * FROM contactUs `;
  let query = db.query(sql, (err, result) => {
      if(err) throw err;
      res.json(result)
  });
})

// applyingusers json page
app.get('/databaseapplyingusers', verifyAdminToken, (req, res) => {
  let sql = `SELECT * FROM applyingUsers `;
  let query = db.query(sql, (err, result) => {
      if(err) throw err;
      res.json(result)
  });
})

// adminlogout
app.post('/logoutadmin', (req, res) => {
  res.clearCookie('admin');
  res.redirect('/adminpanel')
})

app.listen(port, () => console.log(`server started on port: ${port}`))
