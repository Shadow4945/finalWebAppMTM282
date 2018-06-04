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
//      Change Nav to reflect regular user nav bar links
//      Add GET that renders newPost page
//      Add POST that saves user's post to database
//      Add GET that allows user to delete their own post
//      Add route that allows user to edit their own post
//      Add GET to render user's account details
//      Add route that allows user to edit their account details
//      Add POST for logout

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

var nav = [{
    "name": "Home",
    "path": "/"
},
{
    "name": "About",
    "path": "/about"
},{
    "name": "Monsters",
    "path": "/mh/monsters"
},{
    "name": "Add Monster",
    "path": "/mh/addMonster"
}
,{
    "name": "Reload Data",
    "path": "/admin/reloadData"
}
];

router.route("/newPost").get(
    function(req, res){
        console.log("New Post Get!");
        var model = {
            title:"Add a new post!",
            navOptions: nav
        };
        res.render("newPost", model);
    }
);

router.route("/newPost").post(
    function(req, res){
        console.log("Added new post!");
        console.log(req.body);

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

router.route("/deletePost/:title").get(
    function(req, res){
        console.log("Delete Monster!");
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
        console.log(req.params);
        (async function mongo(){
            try{
                var client = await mongoClient.connect(url);

                var db = client.db(databaseName);

                var post = await db.collection("messages").findOne({"title":req.params.name});

                console.log(post);
                var model = {
                    title: "Post Detail Page",
                    navOptions : nav,
                    message: post
                };
                res.render("monster", model);
            }catch(err){
                console.log("Mongo Error!");
                res.send(err);
            }finally{
                client.close();
            }
        }());
    }
);

router.route("/posts").get(
    function(req, res){
        // var fileData = JSON.parse(fs.readFileSync("./src/data/data.json", "utf8"));

        (async function mongo(){
            try{
                var client = await mongoClient.connect(url);

                var db = client.db(databaseName);

                var posts = await db.collection("messages").find().toArray();

                var model = {
                    title: "Post List",
                    navOptions : nav,
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

module.exports = router;