var express = require('express');
var fs = require('fs');
var mongodb = require('mongodb');
var ObjectID = require('mongodb').ObjectID;
var bodyParser = require('body-parser');
var dateTime = require('node-datetime');
var bcrypt = require('bcryptjs');
var dt = dateTime.create();

var mongoClient = mongodb.MongoClient;
var url = "mongodb://localhost:27017";
var databaseName = "message_board";

var currentUser = "";

var router = express.Router();

var salt = 10;

/*Format for posts in database
    title: "x",
    body: "body",
    date_posted: "m/d/Y",
    createdBy: "user Id or username"
*/

/*Format for users in database
    type: "admin or user",
    username: "username",
    password: "password",
    avatarImg: "link or empty",
    email: "email@email.com",
    age: "number"
*/


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
                var users = await db.collection("users").find().toArray();

                var data = {
                    title: "Threads",
                    navOptions: getNav(req.session.user),
                    threads: posts,
                    users: users
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
                currentUser = user;

                if (!user) {
                    res.redirect("/login");
                }

                if(bcrypt.compareSync(req.body.pass, user.password)){
                    req.session.user = {
                        isAuthenticated: true,
                        username: req.body.username,
                        isAdmin: user.type.includes("admin")
                    };
                    res.redirect("/");
                } else {
                    res.redirect("/login");
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
        var getNav = req.app.get("getNav");
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
                    var hash = bcrypt.hashSync(req.body.newPass, salt);

                    var userToAdd = {
                        type: typeOfUser,
                        username: req.body.newUsername,
                        password: hash,
                        avatar_img: req.body.image,
                        email: req.body.email,
                        age: req.body.age

                    };
                    console.log(userToAdd);

                    await db.collection("users").insertOne(userToAdd);
                    var model = {
                        title: "Log in",
                        navOptions: getNav(req.session.user)
                    };
                    res.render("login", model);
                } else {
                    var model = {
                        title: "Create Account",
                        navOptions: getNav(req.session.user),
                        usernameError: usernameError,
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

router.route("/accountDetails").get(
    function (req, res) {
        var getNav = req.app.get("getNav");

        (async function mongo() {
            try {
                var client = await mongoClient.connect(url);

                var db = client.db(databaseName);

                var currentUser = await db.collection("users").findOne({ "username": req.session.user.username });

                var model = {
                    title: "Account Details",

                    navOptions: getNav(req.session.user),
                    currentUser: currentUser
                };

                if (req.session.user == undefined) {
                    res.redirect("/login");
                } else if (req.session.user.isAuthenticated) {
                    res.render("accountDetails", model);
                }

            } catch (err) {
                console.log(err);
                res.send(err);
            } finally {
                client.close();
            }
        }());
    }
)

router.route("/editAccountDetails").get(
    function (req, res) {
        var getNav = req.app.get("getNav");

        (async function mongo() {
            try {
                var client = await mongoClient.connect(url);

                var db = client.db(databaseName);


                var currentUser = await db.collection("users").findOne({ "username": req.session.user.username });

                var model = {
                    title: "Account Details",
                    navOptions: getNav(req.session.user),
                    currentUser: currentUser
                };
                if (req.session.user == undefined) {
                    res.redirect('/login');
                } else if (req.session.user.isAuthenticated) {
                    res.render("editAccountDetails", model);
                }

            } catch (err) {
                console.log(err);
                res.send(err);
            } finally {
                client.close();
            }
        }());
    }
)

router.route("/editAccountDetails").post(
    function (req, res) {

        (async function mongo() {
            try {
                var client = await mongoClient.connect(url);

                var db = client.db(databaseName);


                var user = { "username": req.session.user.username };
                var newValues = { $set: { username: req.body.newUsername, email: req.body.newEmail, age: req.body.newAge } };
                await db.collection("users").updateOne(user, newValues);
                req.session.user.username = req.body.newUsername;

                res.redirect("/");

            } catch (err) {
                console.log(err);
            } finally {
                client.close();
            }
        }());
    }
)

router.route("/newPost").get(
    function (req, res) {
        var getNav = req.app.get("getNav");

        var model = {
            title: "Add a new post!",
            navOptions: getNav(req.session.user)
        };
        if (req.session.user == undefined) {
            res.redirect('/login');
        } else if (req.session.user.isAuthenticated) {
            res.render("newPost", model);
        }
    }
);

router.route("/newPost").post(
    function (req, res) {

        (async function mongo() {
            try {
                var client = await mongoClient.connect(url);

                var db = client.db(databaseName);

                var userTitle = req.body.subject;

                if (userTitle.indexOf("?") > -1) {
                    var title = userTitle.replace("?", "");
                } else {
                    var title = req.body.subject;
                }

                var userInfo = await db.collection("users").findOne({ "username": req.session.user.username });

                var newMessage = {

                    "title": title,
                    "body": req.body.body,
                    "date_posted": dt.format('m/d/Y'),
                    "createdBy": userInfo.username,
                    "avatar_img": userInfo.avatar_img
                };

                await db.collection("messages").insertOne(newMessage);

                res.redirect("/");
            } catch (err) {
                console.log(err);
                res.send(err);
            } finally {
                client.close();
            }
        }());
    }
);

router.route("/editPost/:name").get(
    function (req, res) {
        var getNav = req.app.get("getNav");

        (async function mongo() {
            try {
                var client = await mongoClient.connect(url);

                var db = client.db(databaseName);

                var currentPost = await db.collection("messages").findOne({ "title": req.params.name });

                var model = {
                    title: "Edit Your Post",
                    navOptions: getNav(req.session.user),
                    currentPost: currentPost
                };
                if (currentPost.createdBy == currentUser.username) {
                    res.render("editPost", model);
                } else {
                    res.redirect("/");
                }


            } catch (err) {
                console.log(err);
                res.send(err);
            } finally {
                client.close();
            }
        }());
    }
)

router.route("/editPost").post(
    function (req, res) {

        (async function mongo() {
            try {
                var client = await mongoClient.connect(url);

                var db = client.db(databaseName);
                var post = { "title": req.body.originalName };
                var newValues = { $set: { title: req.body.editSubject, body: req.body.editThread } };
                await db.collection("messages").updateOne(post, newValues);


                res.redirect("/");
            } catch (err) {
                console.log(err);
                console.log(err);
                res.send(err);
            } finally {
                client.close();
            }
        }());
    }
)

router.route("/deletePost/:title").get(
    function (req, res) {

        (async function mongo() {
            try {
                var client = await mongoClient.connect(url);

                var db = client.db(databaseName);

                if (req.session.user == undefined) {
                    res.redirect("/login");
                } else if (req.session.user.isAdmin) {
                    await db.collection("messages").deleteOne({ "title": req.params.title });
                } else {
                    var post = await db.collection("messages").findOne({ "title": req.params.title });
                    if (post.createdBy == currentUser.username) {
                        await db.collection("messages").deleteOne({ "title": req.params.title });
                    }
                }
                res.redirect("/");
            } catch (err) {
                console.log(err);
                res.send(err);
            } finally {
                client.close();
            }
        }());
    }
);

router.route("/post/:name").get(
    function (req, res) {
        var getNav = req.app.get("getNav");
        (async function mongo() {
            try {
                var client = await mongoClient.connect(url);

                var db = client.db(databaseName);

                var post = await db.collection("messages").findOne({ "title": req.params.name });
                var userInfo = await db.collection("users").findOne({ "username": post.createdBy });
                var o_id = new ObjectID(post._id);
                var postReplies = await db.collection("replies").find({'originalThreadId':o_id}).toArray();

                var model = {
                    title: "Post Detail Page",
                    navOptions: getNav(req.session.user),
                    message: post,
                    user: userInfo,
                    postReplies: postReplies
                };
                //console.log(postReplies);
                res.render("viewPost", model);
            } catch (err) {
                console.log("Mongo Error in View");
                console.log(err);
                console.log(err);
                res.send(err);
            } finally {
                client.close();
            }
        }());
    }
);

router.route("/posts").get(
    function (req, res) {
        var getNav = req.app.get("getNav");
        (async function mongo() {
            try {
                var client = await mongoClient.connect(url);

                var db = client.db(databaseName);

                var posts = await db.collection("messages").find().toArray();

                var model = {
                    title: "Post List",
                    navOptions: getNav(req.session.user),
                    posts: posts
                };
                res.render("posts", model);
            } catch (err) {
                res.send(err);
            } finally {
                client.close();
            }
        }());
    }
);


module.exports = router;