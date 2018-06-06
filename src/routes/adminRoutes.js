var express = require('express');
var fs = require('fs');
var mongodb = require('mongodb');
var dateTime = require('node-datetime');
var dt = dateTime.create();

var router = express.Router();

var mongoClient = mongodb.MongoClient;
var url = "mongodb://localhost:27017";
var databaseName = "message_board";

router.route("/reloadData").get(
    function(req, res){
        var fileData = JSON.parse(fs.readFileSync("./src/data/data.json", "utf8"));

        (async function mongo(){
            try{
                var client = await mongoClient.connect(url);
                var db = client.db(databaseName);
        
                db.dropDatabase(databaseName)
                
                var result1 = await db.collection("users").insertMany(fileData.users);
                var result2 = await db.collection("messages").insertMany(fileData.messages);
                var message1Id = await db.collection("messages").findOne({ "title": "First post"});
                await db.collection("replies").insertOne({
                    "originalThreadId": message1Id._id,
                    "datePosted": dt.format('m/d/Y'),
                    "author": "admin",
                    "text":"This is a test reply"
                });

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

router.route("/userList").get(
    function(req, res){
       var getNav = req.app.get("getNav");
        (async function mongo(){
            try{
                var client = await mongoClient.connect(url);

                var db = client.db(databaseName);

                var users = await db.collection("users").find().toArray();

                var data = { 
                    title: "User List",
                    navOptions : getNav(req.session.user),
                    userList: users
                };
                if(req.session.user == undefined){
                    res.redirect("/login");
                } else if(req.session.user.isAdmin){
                    res.render("userList", data);
                } else {
                    res.redirect("/");
                }

            }catch(err){
                console.log(err);
                res.send(err);
            }finally{
                client.close();
            }
        }());
    }
);

router.route("/deleteUser/:name").get(
    function(req, res){
        var getNav = req.app.get("getNav");

        (async function mongo(){
            try{
                var client = await mongoClient.connect(url);

                var db = client.db(databaseName);

                var userToDelete = {"username": req.params.name };

                await db.collection("users").deleteOne(userToDelete);

                
                
                res.redirect("/");
            }catch(err){
                console.log(err);
                res.send(err);
            }finally{
                client.close();
            }
        }());

        
    }
);

module.exports = router;