var express = require('express');
var fs = require('fs');
var mongodb = require('mongodb');

var mongoClient = mongodb.MongoClient;
var url = "mongodb://localhost:27017";
var databaseName = "messageBoard";

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

router.route("/addMonster").get(
    function(req, res){
        console.log("Add Monster Get!");
        var model = {
            title:"Add a new Monster",
            navOptions: nav
        };
        res.render("addMonster", model);
    }
);

router.route("/addMonster").post(
    function(req, res){
        console.log("Add Monster Post!");
        console.log(req.body);

        (async function mongo(){
            try{
                var client = await mongoClient.connect(url);

                var db = client.db(databaseName);

                var newMonster = {
                    "name":req.body.name,
                    "element":req.body.element,
                    "ailments":[req.body.ailments],
                    "imgUrl":req.body.imgUrl,
                };

                await db.collection("monsters").insertOne(newMonster);

                res.redirect("/mh/monster/"+req.body.name);
            }catch(err){
                console.log("Mongo Error!");
                res.send(err);
            }finally{
                client.close();
            }
        }());
    }
);

router.route("/deleteMonster/:name").get(
    function(req, res){
        console.log("Delete Monster!");
        console.log(req.params);

        (async function mongo(){
            try{
                var client = await mongoClient.connect(url);

                var db = client.db(databaseName);

                await db.collection("monsters").deleteOne({"name":req.params.name});

                res.redirect("/mh/monsters");
            }catch(err){
                console.log("Mongo Error!");
                res.send(err);
            }finally{
                client.close();
            }
        }());
    }
);

router.route("/monster/:name").get(
    function(req, res){
        console.log(req.params);
        (async function mongo(){
            try{
                var client = await mongoClient.connect(url);

                var db = client.db(databaseName);

                var monster = await db.collection("monsters").findOne({"name":req.params.name});

                console.log(monster);
                var model = {
                    title: "Monster Detail Page",
                    navOptions : nav,
                    monster: monster
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

router.route("/monsters").get(
    function(req, res){
        // var fileData = JSON.parse(fs.readFileSync("./src/data/data.json", "utf8"));

        (async function mongo(){
            try{
                var client = await mongoClient.connect(url);

                var db = client.db(databaseName);

                var monsters = await db.collection("monsters").find().toArray();

                var model = {
                    title: "Monster List",
                    navOptions : nav,
                    monsters: monsters
                };
                res.render("monsters", model);
            }catch(err){
                res.send(err);
            }finally{
                client.close();
            }
        }());
    }
);

module.exports = router;