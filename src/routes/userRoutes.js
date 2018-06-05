var express = require('express');
var fs = require('fs');
var mongodb = require('mongodb');
var dateTime = require('node-datetime');
var dt = dateTime.create();

var mongoClient = mongodb.MongoClient;
var url = "mongodb://localhost:27017";
var databaseName = "message_board";

var router = express.Router();
//TODO: Remove demo routes
//      Change Nav to reflect regular user nav bar links - DONE
//      Add GET that renders newPost page - DONE
//      Add POST that saves user's post to database - DONE
//      Add GET that allows user to delete their own post - DONE
//      Add route that allows user to edit their own post - DONE
//      Add GET to render user's account details - DONE
//      Add route that allows user to edit their account details - DONE
//      Add POST for logout - Need session destroy

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

//ACCOUNT DETAILS
router.route("/accountDetails").get(
    function(req,res){
        var getNav = req.app.get("getNav");

       (async function mongo(){
            try{
                var client = await mongoClient.connect(url);

                var db = client.db(databaseName);

                var currentUser = await db.collection("users").findOne({/*INSERT QUERY HERE*/});
                
                var model = {
                    title: "Account Details",
                    navOptions : getNav(req.sesssion.user),
                    currentUser: currentUser
                };
                res.render("accountDetails", model);
                
            }catch(err){
                console.log("Mongo Error!");
                res.send(err);
            }finally{
                client.close();
            }
        }());
    }
)

//EDIT ACCOUNT GET
router.route("/editAccountDetails").get(
    function(req,res){
        var getNav = req.app.get("getNav");

       (async function mongo(){
            try{
                var client = await mongoClient.connect(url);

                var db = client.db(databaseName);

                var currentUser = await db.collection("users").findOne({/*INSERT QUERY HERE*/});
                
                var model = {
                    title: "Account Details",
                    navOptions : getNav(req.session.user),
                    currentUser: currentUser
                };
                res.render("editAccountDetails", model);
                
            }catch(err){
                console.log("Mongo Error!");
                res.send(err);
            }finally{
                client.close();
            }
        }());
    }
)

//EDIT ACCOUNT POST
router.route("/editAccountDetails").post(
    function(req,res){
        console.log("Changing Account Details!");

        (async function mongo(){
            try{
                var client = await mongoClient.connect(url);

                var db = client.db(databaseName);

                var user = {"_id": "bob" /*USER ID HERE*/};
                var newValues = {$set: {username: req.body.newUsername, email:req.body.newEmail, age:req.body.newAge}};
                await db.collection("users").updateOne(user,newValues);
                

            res.redirect("/");
                
            }catch(err){
                console.log("Mongo Error!");
                res.send(err);
            }finally{
                client.close();
            }
        }());
    }
)

router.route("/newPost").get(
    function(req, res){
        var getNav = req.app.get("getNav");

        var model = {
            title:"Add a new post!",
            navOptions: getNav(req.session.user)
        };
        res.render("newPost", model);
    }
);

router.route("/newPost").post(
    function(req, res){

        (async function mongo(){
            try{
                var client = await mongoClient.connect(url);

                var db = client.db(databaseName);

                var newMessage = {
                    "name":req.body.subject,
                    "body":req.body.body,
                    "date_posted":dt.format('m/d/Y'),
                    "createdBy": /*insert user id/name/identifier*/ "bob"
                };

                await db.collection("messages").insertOne(newMessage);

                res.redirect("/");
            }catch(err){
                console.log("Mongo Error!");
                res.send(err);
            }finally{
                client.close();
            }
        }());
    }
);

//EDIT POST GET
router.route("/editPost/:name").get(
    function(req,res){
        var getNav = req.app.get("getNav");

       (async function mongo(){
            try{
                var client = await mongoClient.connect(url);

                var db = client.db(databaseName);

                var currentPost = await db.collection("messages").findOne({"title":req.params.name});
                
                var model = {
                    title: "Account Details",
                    navOptions : getNav(req.session.user),
                    currentPost: currentPost
                };
                res.render("editPost", model);
                
            }catch(err){
                console.log("Mongo Error!");
                res.send(err);
            }finally{
                client.close();
            }
        }());
    }
)

//POST EDIT POST
router.route("/editPost/:name").post(
    function(req,res){
        console.log("Updating Post");

       (async function mongo(){
            try{
                var client = await mongoClient.connect(url);

                var db = client.db(databaseName);

                var post = {"name": req.params.name};
                var newValues = {$set: {name: req.body.editName, body: req.body.editThread}};
                await db.collection("users").updateOne(post,newValues);

                
                res.redirect("/");   
            }catch(err){
                console.log("Mongo Error!");
                res.send(err);
            }finally{
                client.close();
            }
        }());
    }
)

router.route("/deletePost/:title").get(
    function(req, res){
        console.log("Delete Post!");
        console.log(req.params);

        (async function mongo(){
            try{
                var client = await mongoClient.connect(url);

                var db = client.db(databaseName);

                await db.collection("messages").deleteOne({"title":req.params.name});

                res.redirect("/");
            }catch(err){
                console.log("Mongo Error!");
                res.send(err);
            }finally{
                client.close();
            }
        }());
    }
);

router.route("/post/:name").get(
    function(req, res){
        var getNav = req.app.get("getNav");
        (async function mongo(){
            try{
                var client = await mongoClient.connect(url);

                var db = client.db(databaseName);

                var post = await db.collection("messages").findOne({"title":req.params.name});
                var userInfo = await db.collection("users").findOne({"username":post.createdBy});

                // console.log(userInfo);
                var model = {
                    title: "Post Detail Page",
                    navOptions : getNav(req.session.user),
                    message: post,
                    user: userInfo
                };
                res.render("viewPost", model);
            }catch(err){
                console.log("Mongo Error!");
                console.log(err);
                res.send(err);
            }finally{
                client.close();
            }
        }());
    }
);

router.route("/posts").get(
    function(req, res){
        var getNav = req.app.get("getNav");
        (async function mongo(){
            try{
                var client = await mongoClient.connect(url);

                var db = client.db(databaseName);

                var posts = await db.collection("messages").find().toArray();

                var model = {
                    title: "Post List",
                    navOptions : getNav(req.session.user),
                    posts: posts
                };
                res.render("posts", model);
            }catch(err){
                res.send(err);
            }finally{
                client.close();
            }
        }());
    }
);

//LOGOUT
router.route("/logout").post(
    function(req,res){
        res.redirect("/");
    }
)

module.exports = router;