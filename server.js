const express = require('express');
const app = express();
const Users = require('./api/users');
const db = require('./db');

//--------------Requirements-----------//
db.init();

//-------------Middlewares-------------//
app.use(express.json());


//-------------routes------------------//
app.use('/users', Users);


app.listen(3000,() => {
    console.log('server started at 3000');
})