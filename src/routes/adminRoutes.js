var express = require('express');
var fs = require('fs');
var mongodb = require('mongodb');

var router = express.Router();

var mongoClient = mongodb.MongoClient;
var url = "mongodb://localhost:27017";
var databaseName = "message_board";

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


//TODO: Remove demo routes
//      Add admin nav bar variable
//      GET route to reloadData
//      GET route to loadData
//      GET route to dropData
//      Add GET that renders newPost page
//      Add POST that saves admin's post to database
//      Add GET that allows admin to delete any post
//      Add route that allows admin to edit their own post
//      Add GET to render admin's account details
//      Add route that allows admin to edit their account details
//      Add GET to render user list
//      Add GET to delete user accounts in the user list
//      Add POST for logout

router.route("/reLoadData").get(
    function(req, res){
        var fileData = JSON.parse(fs.readFileSync("./src/data/data.json", "utf8"));
        console.log(fileData);

        // IIFE Weirdness
        (async function mongo(){
            try{
                var client = await mongoClient.connect(url);
                var db = client.db(databaseName);
        
                db.dropDatabase(databaseName)
                
                var result1 = await db.collection("users").insertMany(fileData.users);
                var result2 = await db.collection("messages").insertMany(fileData.messages);

                res.json([result1, result2]);
            }catch(err){
                res.send(err);
            }finally{
                client.close();
            }
        }());
    }
);

router.route("/loadData").get(
    function(req, res){
        var fileData = JSON.parse(fs.readFileSync("./src/data/data.json", "utf8"));
        console.log(fileData);

        // IIFE Weirdness
        (async function mongo(){
            try{
                var client = await mongoClient.connect(url);
                var db = client.db(databaseName);
        
                var result1 = await db.collection("users").insertMany(fileData.users);
                var result2 = await db.collection("messages").insertMany(fileData.messages);
                
                
                res.json([result1, result2]);
            }catch(err){
                res.send(err);
            }finally{
                client.close();
            }
        }());
    }
);

router.route("/dropData").get(
    function(req, res){
        var fileData = JSON.parse(fs.readFileSync("./src/data/data.json", "utf8"));
        console.log(fileData);

        // IIFE Weirdness
        (async function mongo(){
            try{
                var client = await mongoClient.connect(url);
                var db = client.db(databaseName);
        
                db.dropDatabase(databaseName)
                
                res.send("Data dropped!");
            }catch(err){
                res.send(err);
            }finally{
                client.close();
            }
        }());
    }
);

router.route("/users").get(
    function(req, res){
        // var fileData = JSON.parse(fs.readFileSync("./src/data/data.json", "utf8"));
        console.log("User list!");
        (async function mongo(){
            try{
                var client = await mongoClient.connect(url);

                var db = client.db(databaseName);

                var users = await db.collection("users").find().toArray();
                
                //console.log(users);

                var data = { 
                    title: "User List",
                    navOptions : nav,
                    userList: users
                };
                console.log(data);
                res.render("userList", data);
            }catch(err){
                console.log("Error in /users");
                console.log(err);
                res.send(err);
            }finally{
                client.close();
            }
        }());
    }
);

module.exports = router;