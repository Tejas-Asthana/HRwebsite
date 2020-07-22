const express = require('express');
const mysql = require('mysql');
const path = require('path');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

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
    user     : 'admin',
    password : 'aZsXdCfVgBhNjMkl',
    database : 'HR_Website'
});


function verifyToken(req, res, next) {
  const bearerHeader = req.cookies.jwt
  if(bearerHeader === undefined) {
    res.redirect('/signup')
  }
  else {
    // res.status(403);
    console.log(bearerHeader)
    req.token = bearerHeader;
    next();
  }
}

function verifyAdminToken(req, res, next) {
  const bearerHeader = req.cookies.admin
  if(bearerHeader === undefined) {
    res.redirect('/adminpanel')
  }
  else {
    // res.status(403);
    console.log(bearerHeader)
    req.adminToken = bearerHeader;
    next();
  }
}


// landing page
app.get('/', (req, res) => {
  const bearerHeader = req.cookies.jwt
  console.log(bearerHeader )
    if(bearerHeader === undefined) {
      res.status(200).sendFile(__dirname + '/public/home.html');
    }
    else {
      res.render('home', {
        message:  "as user"
      })
    }
})

app.post('/', (req, res) => {
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
app.get('/signup', (req, res) => {
  res.status(200).sendFile(__dirname + '/public/signup.html')
})

app.post('/signup', async (req, res) => {
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
            console.log(`New user signed up! `)
          }
        })
        res.redirect('/login')
})



// logged In view page
app.get('/login', (req, res) => {
  // res.sendFile(__dirname + '/public/login.html')
  res.render('login')
})

app.post('/login', async (req, res) => {
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

// logout
app.post('/logout', (req, res) => {
  res.clearCookie('jwt');
  res.redirect('/')
})

app.get('/getpost/:id', (req, res) => {
    let email = "'tejasa82@gmail.com'";
    let sql = `SELECT * FROM hrHead WHERE email = ${email}`;
    let query = db.query(sql, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.send(result[0].name);
    });
});


// Contact Us page
app.get('/contactus', verifyToken, (req, res) => {
  const bearerHeader = req.cookies.jwt
  // console.log(bearerHeader )
    if(bearerHeader === undefined) {
      res.redirect('/signup')
  }
  else {
    res.status(200).sendFile(__dirname + '/public/contactUs.html');
  }
  console.log(res.body);
})

app.post('/contactus', verifyToken, (req, res) => {
  let sql = "INSERT INTO contactUs SET ?";
  db.query(sql, req.body, (err, result) => {
    if(err) {
      res.status(400).send(`Failed to load your request to database.`);
      throw err;
    }
    else {
      res.status(200).send(`We will reach you shortly ${req.body.name}.`)
      console.log(result)
    }
  })
})

app.get('/opportunities', verifyToken, (req, res) => {
  const bearerHeader = req.cookies.jwt
  if(bearerHeader === undefined) {
    res.redirect('/signup')
  }
  else {
    res.status(200).sendFile(__dirname + '/public/opportunities.html');
    // res.render('home', {
    //   message:  "hello"
    // })
  }
})

app.get('/adminpanel', (req, res) => {
  res.render('adminpanel')
  // let sql = `SELECT * FROM admin `;
  // let query = db.query(sql, (err, result) => {
  //     if(err) throw err;
  //     console.log(result);
  //     const data = result;
  // });
})

app.post('/adminpanel', async (req, res) => {
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

app.get('/databasepage', verifyAdminToken, (req, res) => {
  // let sql = `SELECT * FROM admin `;
  // let query = db.query(sql, (err, result) => {
  //     if(err) throw err;
  //     console.log(result);
  //     const data = result;
  // });
  res.sendFile(__dirname + '/public/databasepage.html')
})

app.get('/databasehrhead', verifyAdminToken, (req, res) => {
  let sql = `SELECT * FROM hrHead `;
  let query = db.query(sql, (err, result) => {
      if(err) throw err;
      // console.log(result);
      // const data = result;
      res.json(result)
  });
})

app.get('/databasecontactus', verifyAdminToken, (req, res) => {
  let sql = `SELECT * FROM contactUs `;
  let query = db.query(sql, (err, result) => {
      if(err) throw err;
      res.json(result)
  });
})

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
