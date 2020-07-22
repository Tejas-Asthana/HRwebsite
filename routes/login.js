const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const path = require('path');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

require('dotenv').config({path: path.resolve(__dirname, '/.env')})

const db = mysql.createConnection({
    host     : 'localhost',
    user     : 'admin1234',
    password : 'admin1234',
    database : 'HR_Website'
});


router.route('/')
  .get((req, res) => {
    res.render('login')
  })
  .post( async (req, res) => {
    try {
      const {email, pswrd} = req.body;
      if(!email || !pswrd) {
        return res.status(400).render('login.ejs', {
          message: 'Please provide a valid email and password'
        })
      }
      db.query('SELECT * FROM hrHead WHERE email = ?', [email],
      async (err, result) => {
        if(!result || !(await bcrypt.compare(pswrd, result[0].pswrd))) {
          res.status(401).render('login.ejs', {
            message: 'email or password is incorrect'
          })
        }
        else {
          const id = result[0].id;
          var token = jwt.sign({id}, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
          })
          // console.log(`The token is: ${token}`)
        }
        const cookieoptions = { expires: new Date(
          Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60
        ),
        httpOnly: true
        }
        res.cookie('jwt', token, cookieoptions)
        let sql = `SELECT * FROM hrHead WHERE email = ?`;
        db.query(sql, [email],(err, result) => {
          if(err) throw err;
          var Name = result[0].name;
          res.status(200).render('home', {
            message: Name
          })
        });
        })
      } catch (err) {
        console.log(err)
      }
    })


module.exports = router;
