const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const path = require('path');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

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
  .get(verifyToken, (req, res) => {
    const bearerHeader = req.cookies.jwt
    if(bearerHeader === undefined) {
      res.redirect('/signup')
    }
    else {
      res.status(200).sendFile(path.resolve(__dirname, '../public/opportunities.html'));
    }
  })


module.exports = router;
