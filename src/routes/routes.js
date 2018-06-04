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
//      GET that renders login
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
},{
    "name": "Monsters",
    "path": "/mh/monsters"
},{
    "name": "Add Monster",
    "path": "/mh/addMonster"
}
,{
    "name": "Log Out",
    "path": "/logout"
}
];

router.route("/").get(
    function (req, res) {

        (async function mongo(){
            try{
                var client = await mongoClient.connect(url);

                var db = client.db(databaseName);

                var posts = await db.collection("messages").find().toArray();

                console.log(posts);
                var data = {
                    title: "Threads",
                    navOptions : nav,
                    threads: posts
                };
                console.log(data);
                res.render("index", data);
            }catch(err){
                res.send(err);
            }finally{
                client.close();
            }
        }());
    }
);

router.route("/about").get(
    function (req, res) {
        var model = {
            title: "About My Monster Hunter Demo",
            navOptions : nav
        };

        res.render("about", model);
    }
);

module.exports = router;