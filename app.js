var express = require('express');
var bodyParser = require('body-parser');
var expressSession = require('express-session');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(expressSession({
    secret: '600dm0rn1n6',
    saveUninitialized: true,
    resave: true
}));


var checkAuth = function (req, res, next) {
    if (req.session.user && req.session.user.isAuthenticated) {
        next();
    } else {
        res.redirect('/');
    }
}
//TODO: Set up nav bar here based on current user
//app.set("getNav", getNav);

var router = require('./src/routes/routes');
app.use("/", router);
var userRoutes = require('./src/routes/userRoutes');
app.use("/user/", userRoutes);
var adminRoutes = require('./src/routes/adminRoutes');
app.use("/admin/", adminRoutes);

app.use(express.static(__dirname + "/public"));
app.set('views', './src/views');
app.set('view engine', 'pug');

app.listen(3000, function () {
    console.log("Express Listening on Port: 3000");
});