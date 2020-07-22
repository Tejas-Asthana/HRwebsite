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

router.route('/')
  .get((req, res) => {
    res.render('adminpanel')
  })
  .post( async (req, res) => {
    try {
      const {email, pswrd} = req.body;
      if(!email || !pswrd) {
        return res.status(400).render('adminpanel', {
          message: 'Please provide a valid email and password'
        })
      }
      db.query('SELECT * FROM admin WHERE email = ?', [email],
      async (err, result) => {
        if(!result || !(pswrd === result[0].pswrd)) {
          res.status(401).render('adminpanel', {
            message: 'email or password is incorrect'
          })
        }
        else {
          const id = result[0].id;
          var adminToken = jwt.sign({id}, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
          })
        }
        const cookieoptions = { expires: new Date(
          Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60
          ),
          httpOnly: true
        }
        res.cookie('admin', adminToken, cookieoptions)
        res.redirect('/databasepage')
      })
    }
    catch (err) {
      console.log(err)
    }
  })

module.exports = router;
