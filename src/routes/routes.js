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
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.route("/").get(
    function (req, res) {
        var getNav = req.app.get("getNav");
        (async function mongo() {
            try {
                var client = await mongoClient.connect(url);

                var db = client.db(databaseName);

                var posts = await db.collection("messages").find().toArray();

                console.log(posts);
                var data = {
                    title: "Threads",
                    navOptions: getNav(req.session.user),
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
        var getNav = req.app.get("getNav");
        var model = {
            title: "Log In",
            navOptions: getNav(req.session.user)
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
        var getNav = req.app.get("getNav");
        var model = {
            title: "Create Account",
            navOptions: getNav(req.session.user),
        };
        res.render("createAccount", model);
    }
);


router.route("/createAccount").post(
    function (req, res) {
        (async function mongo() {
            try {
                var client = await mongoClient.connect(url);
                var db = client.db(databaseName);
                var existingUser = await db.collection("users").findOne({ "username": req.body.newUsername });
                var existingEmail = await db.collection("users").findOne({ "email": req.body.email });

                var usernameError, ageError, typeError, passError, confirmError = "";
                var allFieldsValid = true;

                var ageRegex = /^\d+$/gm;
                var passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/gm;
                var password = req.body.newPass;

                if (req.body.newUsername.length < 2 || existingUser) {
                    usernameError = "Invalid username";
                    allFieldsValid = false;
                }

                if (ageRegex.test(req.body.age) == false) {
                    ageError = "Invalid age";
                    allFieldsValid = false;
                }

                if (req.body.type == false) {
                    typeError = "Must select user type";
                    allFieldsValid = false;
                }
                if (passwordRegex.test(password) == false) {
                    passError = "Password must be at least 8 characters, have 1 capital, 1 digit, and 1 special character";
                    allFieldsValid = false;
                }
                if (req.body.confirmPass != password) {
                    confirmError = "Passwords don't match";
                    allFieldsValid = false;
                }



                var typeOfUser = "user";
                if (req.body.admin) {
                    typeOfUser = "admin";
                }


                if (allFieldsValid) {
                    /* Adding user to data base --------------------------------------- */
                    var userToAdd = {
                        type: typeOfUser,
                        username: req.body.newUsername,
                        password: req.body.newPass,
                        avatar_img: req.body.image,
                        email: req.body.email,
                        age: req.body.age

                    };
                    await db.collection("users").insertOne(userToAdd);
                    //------------------------------------------------------------------/
                    var model = {
                        title: "Log in"
                        //insert nav
                    };
                    res.render("login", model);
                } else {
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

                    res.render("createAccount", model);
                }
            } catch (err) {
                console.log(err);
            } finally {
                client.close();
            }
        }());
    }
);
module.exports = router;