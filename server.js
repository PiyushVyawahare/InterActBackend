const express = require('express');
const app = express();

app.get('/', async (request, response) => {
    return response.status(200).end('Welcome to server');
})

app.listen(3000,() => {
    console.log('server started at 3000');
})