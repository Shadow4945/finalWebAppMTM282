var express = require('express');
var fs = require('fs');

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
    "name": "Reload Data",
    "path": "/admin/reloadData"
}
];

router.route("/").get(
    function (req, res) {
        var data = {
            title: "Monster Hunter Demo",
            navOptions : nav
        };
        res.render("index", data);
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