var express = require('express');
var fs = require('fs');
var mongoClient = require('mongodb').MongoClient;

var router = express.Router();

var url = "mongodb://localhost:27017";
var databaseName = "messageBoard";


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
                
                var result1 = await db.collection("monsters").insertMany(fileData.monsters);
                var result2 = await db.collection("weapons").insertMany(fileData.weapons);
                var result3 = await db.collection("weaponTypes").insertMany(fileData.weaponTypes);
                
                res.json([result1, result2, result3]);
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
        
                var result1 = await db.collection("monsters").insertMany(fileData.monsters);
                var result2 = await db.collection("weapons").insertMany(fileData.weapons);
                var result3 = await db.collection("weaponTypes").insertMany(fileData.weaponTypes);
                
                res.json([result1, result2, result3]);
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

module.exports = router;