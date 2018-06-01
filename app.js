var express = require('express');
var bodyParser = require('body-parser');
var expressSession = require('express-session');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

var router = require('./src/routes/routes');
app.use("/", router);
var userRoutes = require('./src/routes/userRoutes');
app.use("/user/", userRoutes);
var adminRoutes = require('./src/routes/adminRoutes');
app.use("/admin/", adminRoutes);

var checkAuth = function(req, res, next) {
    if(req.session.user && req.session.user.isAuthenticatied) {
        next();
    }else{
        res.redirect('/');
    }
}

app.use(express.static(__dirname + "/public"));
app.set('views', './src/views');
app.set('view engine', 'pug');

app.use(expressSession({
    secret: '600dm0rn1n6',
    saveUninitialized: true,
    resave: true
}));

var urlencodedParser = bodyParser.urlencoded({extended:false});

app.get('/login', function(req, res){
    res.render('login');
});

//TODO: Change route for user-only pages
app.get('/accountDetails', checkAuth, function(req, res){
    res.render('accountDetails');
});

app.get('/logout', function(req, res){
    req.session.destroy(function(err){
        if(err){
            console.log(err);
        }else{
            res.redirect('/');
        }
    });
});

//TODO: Change to validate that user exists in DB
app.post('/login', urlencodedParser, function(req, res){
    if(req.body.username=='user' && req.body.pass=='password'){
        req.session.user={
            isAuthenticatied: true,
            username: req.body.username
        };
        res.redirect('/accountDetails');
    }else{
        res.redirect('/');
    }
});

app.listen(3000, function(){
    console.log("Express Listening on Port: 3000");
});