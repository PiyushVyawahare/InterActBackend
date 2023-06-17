const express = require('express');
const app = express();
const Users = require('./api/users');
// const Signin = require('./api/signin')
const db = require('./db');

//--------------Requirements-----------//
db.init();

//-------------Middlewares-------------//
app.use(express.json());


//-------------routes------------------//
app.use('/users', Users);
// app.use('/signin', Signin);

app.listen(4000,() => {
    console.log('server started at 4000');
})