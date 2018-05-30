var express = require('express');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

var router = require('./src/routes/routes');
app.use("/", router);
var mhRoutes = require('./src/routes/mhRoutes');
app.use("/mh/", mhRoutes);
var adminRoutes = require('./src/routes/adminRoutes');
app.use("/admin/", adminRoutes);

app.use(express.static(__dirname + "/public"));

app.set('views', './src/views');
app.set('view engine', 'pug');

app.listen(3000, function(){
    console.log("Express Listening on Port: 3000");
});