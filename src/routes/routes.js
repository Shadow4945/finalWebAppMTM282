var express = require('express');
var fs = require('fs');
var mongodb = require('mongodb');
var bodyParser = require('body-parser');

var mongoClient = mongodb.MongoClient;
var url = "mongodb://localhost:27017";
var databaseName = "message_board";


var router = express.Router();

//TODO: Remove demo routes
//      Change Nav to reflect logged out user nav bar links
//      GET that renders home page
//      POST that allows users to login & redirects to proper view
//      GET that renders create account
//      POST that saves new account info to database & redirects to proper view
router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());


var nav = [{
    "name": "Home",
    "path": "/"
},
{
    "name": "About",
    "path": "/about"
}, {
    "name": "Monsters",
    "path": "/mh/monsters"
}, {
    "name": "Add Monster",
    "path": "/mh/addMonster"
}
    , {
    "name": "Log Out",
    "path": "/logout"
}
];

router.route("/").get(
    function (req, res) {

        (async function mongo() {
            try {
                var client = await mongoClient.connect(url);

                var db = client.db(databaseName);

                var posts = await db.collection("messages").find().toArray();

                console.log(posts);
                var data = {
                    title: "Threads",
                    navOptions: nav,
                    threads: posts
                };
                console.log(data);
                res.render("index", data);
            } catch (err) {
                res.send(err);
            } finally {
                client.close();
            }
        }());
    }
);

router.route("/login").get(
    function (req, res) {
        var model = {
            title: "Log In"
            //add nav for user
        };

        res.render("login", model);
    }
);

router.route("/login").post(
    function (req, res) {
        (async function mongo() {
            try {
                var client = await mongoClient.connect(url);
                var db = client.db(databaseName);
                var user = await db.collection("users").findOne({ "username": req.body.username });

                if (!user) {
                    res.redirect("/login");
                }

                var validLogin = user.password == req.body.pass;

                if (validLogin) {
                    req.session.user = {
                        isAuthenticated: true,
                        username: req.body.username,
                        isAdmin: user.type.includes("admin")
                    };

                    res.redirect("/");
                }
            } catch (err) {
                console.log(err);
            } finally {
                client.close();
            }
        }());
    }
);

router.route("/logout").get(
    function (req, res) {
        req.session.destroy(function (err) {
            if (err) {
                console.log(err);
            } else {
                res.redirect('/');
            }
        });
    }
);

router.route("/createAccount").get(
    function (req, res) {
        var model = {
            title: "Create Account",
            //insert nav
            passErrorMsg: "",
            confirmErrorMsg: ""
        };

        res.render("createAccount", model);
    }
);


router.route("/createAccount").post(
    function(req, res){
        (async function mongo() {
            try{
                var client = await mongoClient.connect(url);
                var db = client.db(databaseName);
                var existingUser = await db.collection("users").findOne({ "username": req.body.newUsername });
                var existingEmail = await db.collection("users").findOne({"email": req.body.email});

                var usernameError, emailError, ageError, typeError, passError, confirmError = "";
                
                var ageRegex = /^\d+$/gm;
                var passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/gm;
                var emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/gm;
                var password = req.body.newPass;

                //if username length is less than 2 or exists in db print error
                //if email doesn't match the regex or exists in db print error
                //if age doesn't match the regex print error
                //if user type button isn't selected, print error
                //if password doesn't match regex print error
                //if confirm password doesn't match password print error
                if(req.body.newUsername.length < 2 || existingUser) {
                    usernameError = "Invalid username";
                } 
                if(emailRegex.test(req.body.email) == false || existingEmail){
                    emailError = "Invalid email";
                }
                if(ageRegex.test(req.body.age) == false) {
                    ageError = "Invalid age";
                }
                console.log("User type: " + req.body.type);
                if(req.body.type == false){
                    typeError = "Must select user type";
                }
                if(passwordRegex.test(password) == false){
                    passError = "Password must be at least 8 characters, have 1 capital, 1 digit, and 1 special character";
                }
                if(req.body.confirmPass != passError){
                    confirmError = "Passwords don't match";
                }
                
                var typeOfUser = "user";
                if(req.body.admin){
                    typeOfUser = "admin";
                }

                var model = {
                    title: "Create Account",
                    //insert nav
                    usernameError: usernameError,
                    emailError: emailError,
                    ageError: ageError,
                    typeError: typeError,
                    passError: passError,
                    confirmError: confirmError
                };

            /* Adding user to data base --------------------------------------- */
                var userToAdd = {
                    type: typeOfUser,
                    username: req.body.newUsername,
                    password: req.body.newPass,
                    avatar_img: req.body.image,
                    email: req.body.email,
                    age: req.body.age

                }
                await db.collection("users").insertOne(userToAdd);
            //------------------------------------------------------------------/

                res.render("createAccount", model);
            } catch(err){
                console.log(err);
            } finally {
                client.close();
            }
        }());
    }
 );
module.exports = router;