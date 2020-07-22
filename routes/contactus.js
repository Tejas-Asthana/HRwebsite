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


function verifyToken(req, res, next) {
  const bearerHeader = req.cookies.jwt
  if(bearerHeader === undefined) {
    res.redirect('/signup')
  }
  else {
    // console.log(bearerHeader)
    req.token = bearerHeader;
    next();
  }
}

router.route('/')
  .get( verifyToken, (req, res) => {
    const bearerHeader = req.cookies.jwt
    // console.log(bearerHeader )
      if(bearerHeader === undefined) {
        res.redirect('/signup')
    }
    else {
      res.status(200).sendFile(path.resolve(__dirname, '../public/contactUs.html'));
    }
    // console.log(res.body);
  })
  .post( verifyToken, (req, res) => {
    let sql = "INSERT INTO contactUs SET ?";
    db.query(sql, req.body, (err, result) => {
      if(err) {
        res.status(400).send(`Failed to load your request to database.`);
        throw err;
      }
      else {
        res.status(200).send(`We will reach you shortly ${req.body.name}.`)
        // console.log(result)
      }
    })
  })

module.exports = router;
