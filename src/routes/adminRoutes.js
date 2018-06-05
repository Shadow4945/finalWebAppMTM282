var express = require('express');
var fs = require('fs');
var mongodb = require('mongodb');

var router = express.Router();

var mongoClient = mongodb.MongoClient;
var url = "mongodb://localhost:27017";
var databaseName = "message_board";

//TODO: 
//      Add GET to delete user accounts in the user list

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
        console.log("User list!");
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

router.route("/deleteUser").get(
    function(req, res){
        //delete from database
    }
);

module.exports = router;