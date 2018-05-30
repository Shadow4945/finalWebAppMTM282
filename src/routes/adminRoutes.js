var express = require('express');
var fs = require('fs');
var mongoClient = require('mongodb').MongoClient;

var router = express.Router();

var url = "mongodb://localhost:27017";
var databaseName = "monsterHunter";

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