const express = require('express');
const app = express();
app.use(express.json());
app.use('/api', require('./routes/app.route'));

const server = app.listen(4000,(req,res){
    res.status(200).json("Hello uploader");
});
server.setTimeout(300000);
