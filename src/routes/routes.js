var express = require('express');
var fs = require('fs');
var mongodb = require('mongodb');
var bodyParser = require('body-parser');
var dateTime = require('node-datetime');
var dt = dateTime.create();

var mongoClient = mongodb.MongoClient;
var url = "mongodb://localhost:27017";
var databaseName = "message_board";

var currentUser = "";

var router = express.Router();

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

                ;
                //console.log(posts);
                var data = {
                    title: "Threads",
                    navOptions: getNav(req.session.user),
                    threads: posts
                };
                ;
                //console.log(data);
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
                    var userToAdd = {
                        type: typeOfUser,
                        username: req.body.newUsername,
                        password: req.body.newPass,
                        avatar_img: req.body.image,
                        email: req.body.email,
                        age: req.body.age

                    };
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


//ACCOUNT DETAILS
router.route("/accountDetails").get(
    function (req, res) {
        var getNav = req.app.get("getNav");
        console.log(req.session.user);

        (async function mongo() {
            try {
                var client = await mongoClient.connect(url);

                var db = client.db(databaseName);

                //var currentUser = await db.collection("users").findOne({/*INSERT QUERY HERE*/});
                var currentUser = await db.collection("users").findOne({"username": req.session.user.username});
                
                var model = {
                    title: "Account Details",
                    
                    navOptions : getNav(req.session.user),
                    currentUser: currentUser
                };

                if (req.session.user == undefined) {
                    res.redirect("/loging");
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

//EDIT ACCOUNT GET
router.route("/editAccountDetails").get(
    function (req, res) {
        var getNav = req.app.get("getNav");
        //console.log(req.session.user);

        (async function mongo() {
            try {
                var client = await mongoClient.connect(url);

                var db = client.db(databaseName);

                
                var currentUser = await db.collection("users").findOne({"username":req.session.user.username});
                
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

//EDIT ACCOUNT POST
router.route("/editAccountDetails").post(
    function (req, res) {

        (async function mongo() {
            try {
                var client = await mongoClient.connect(url);

                var db = client.db(databaseName);

                
                var user = {"username": req.session.user.username};
                var newValues = {$set: {username: req.body.newUsername, email:req.body.newEmail, age:req.body.newAge}};
                await db.collection("users").updateOne(user,newValues);
                req.session.user.username = req.body.newUsername;
                


                res.redirect("/");

            } catch (err) {
                console.log("Mongo Error!");
                res.send(err);
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

                var newMessage = {
                    
                    "title":req.body.subject,
                    "body":req.body.body,
                    "date_posted":dt.format('m/d/Y'),
                    "createdBy": req.session.user.username
                };

                await db.collection("messages").insertOne(newMessage);

                res.redirect("/");
            } catch (err) {
                console.log("Mongo Error!");
                res.send(err);
            } finally {
                client.close();
            }
        }());
    }
);

//EDIT POST GET
router.route("/editPost/:name").get(
    function (req, res) {
        var getNav = req.app.get("getNav");

        (async function mongo() {
            try {
                var client = await mongoClient.connect(url);

                var db = client.db(databaseName);

                var currentPost = await db.collection("messages").findOne({ "title": req.params.name });

                var model = {
                    title: "Account Details",
                    navOptions: getNav(req.session.user),
                    currentPost: currentPost
                };
                if (currentPost.createdBy == currentUser.username) {
                    res.render("editPost", model);
                } else {
                    res.redirect("/");
                }


            } catch (err) {
                console.log("Mongo Error!");
                res.send(err);
            } finally {
                client.close();
            }
        }());
    }
)

//POST EDIT POST
router.route("/editPost").post(
    function (req, res) {

        (async function mongo() {
            try {
                var client = await mongoClient.connect(url);

                var db = client.db(databaseName);
                console.log(req.body);

                var post = { "title": req.body.originalName };
                var newValues = { $set: { title: req.body.editSubject, body: req.body.editThread } };
                await db.collection("messages").updateOne(post, newValues);


                res.redirect("/");
            } catch (err) {
                console.log("Mongo Error!");
                console.log(err);
                res.send(err);
            } finally {
                client.close();
            }
        }());
    }
)

router.route("/deletePost/:title").get(
    function(req, res){
        console.log("Delete Post!");
        //console.log(req.params);

        (async function mongo() {
            try {
                var client = await mongoClient.connect(url);

                var db = client.db(databaseName);

                if (currentUser.type.includes("admin")) {
                    await db.collection("messages").deleteOne({ "title": req.params.name });
                } else {
                    var post = await db.collection("messages").findOne({ "title": req.params.name });
                    if (post.createdBy == currentUser.username) {
                        await db.collection("messages").deleteOne({ "title": req.params.name });
                    }
                }


                res.redirect("/");
            } catch (err) {
                console.log("Mongo Error!");
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

                var model = {
                    title: "Post Detail Page",
                    navOptions: getNav(req.session.user),
                    message: post,
                    user: userInfo
                };
                res.render("viewPost", model);
            } catch (err) {
                console.log("Mongo Error!");
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