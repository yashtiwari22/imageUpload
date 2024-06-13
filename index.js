const express = require('express');
const app = express();
app.use(express.json());
app.use('/api', require('./routes/app.route'));

const server = app.listen(4000,function(){
    console.log('Server Ready');
});
server.setTimeout(300000);
