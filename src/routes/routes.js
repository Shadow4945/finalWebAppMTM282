var express = require('express');
var fs = require('fs');
var mongodb = require('mongodb');

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
            title: "Create Account"
            //insert nav
        };

        res.render("createAccount", model);
    }
);


router.route("/createAccount").post(
    function(req, res){
        (async function mongo() {
            try{
                //validate:
                    //email
                    //password
                    var passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/gm;
                    var password = req.body.newPass;
                    var passwordErr = document.getElementById('passwordErr');
                    console.log(req.body.newPass);
                    if(passwordRegex.test(password) == false){
                        passwordErr.textContent = "Invalid Password";
                    }
                    //password confirm
                //add new user to the database
            } catch(err){
                console.log(err);
            } finally {
                client.close();
            }
        }());
    }
 );
module.exports = router;