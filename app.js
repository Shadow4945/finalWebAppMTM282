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

function getNav(user) {
    var isAdmin = false;
    var isAuthenticated = false;

    if (user) {
        isAdmin = user.isAdmin;
        isAuthenticated = user.isAuthenticated;
    }
    return [{
        "name": "Home",
        "path": "/",
        "show": true
    }, {
        "name": "Create Account",
        "path": "/createAccount",
        "show": !isAuthenticated
    }, {
        "name": "Account Details",
        "path": "/accountDetails",
        "show": isAuthenticated
    }, {
        "name": "New Post",
        "path": "/newPost",
        "show": isAuthenticated
    }, {
        "name": "Logout",
        "path": "/logout",
        "show": isAuthenticated
    }, {
        "name": "Login",
        "path": "/login",
        "show": !isAuthenticated
    }, {
        "name": "Users",
        "path": "/admin/userList",
        "show": isAdmin
    }, {
        "name": "Reload Data",
        "path": "/admin/reloadData",
        "show": isAdmin
    }
    ];
}

app.set("getNav", getNav);

var router = require('./src/routes/routes');
app.use("/", router);

var adminRoutes = require('./src/routes/adminRoutes');
app.use("/admin/", adminRoutes);

app.use(express.static(__dirname + "/public"));
app.set('views', './src/views');
app.set('view engine', 'pug');

app.listen(3000, function () {
    console.log("Express Listening on Port: 3000");
});