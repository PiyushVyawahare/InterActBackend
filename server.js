const express = require('express');
const app = express();
const Users = require('./api/users');
const db = require('./db');
const cors = require('cors');

//--------------Requirements-----------//
db.init();

//-------------Middlewares-------------//
app.use(express.json({ limit: '10mb' }));
app.use(cors());


//-------------routes------------------//
app.use('/users', Users);
// app.use('/signin', Signin);

app.listen(4000, () => {
  console.log('server started at 4000');
})