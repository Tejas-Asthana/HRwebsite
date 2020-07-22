const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const path = require('path');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const db = mysql.createConnection({
    host     : 'localhost',
    user     : 'admin1234',
    password : 'admin1234',
    database : 'HR_Website'
});


router.route('/')
  .get((req, res) => {
    res.status(200).sendFile(path.resolve(__dirname, '../public/signup.html'))
  })
  .post( async (req, res) => {
      const hashedpswrd = await bcrypt.hash(req.body.pswrd, 10);
      const newUser = {
        name: req.body.name,
        email: req.body.email,
        pswrd: hashedpswrd
      }
      let sql = "INSERT INTO hrHead SET ?";
      db.query(sql, newUser, (err, result) => {
        if(err) {
          console.log(`Failed to load your request to database. ${err}`)
        }
        else {
          // console.log(`New user signed up! `)
        }
      })
      res.redirect('/login')
  })


module.exports = router;
