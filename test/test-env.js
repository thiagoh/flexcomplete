(function(exports) {

    'use strict';

    var init = function() {

        var express = require('express'),
            http = require('https'),
            _ = require('underscore'),
            fs = require('fs'),
            app = express(),
            superHeroesPath = "/data/super-heroes",
            readline = require('readline'),
            superHeroes = [];

        fs.readFile('./test/super-heroes.data', function(err, data) {
            if (err) {
                throw err;
            }

            superHeroes = data.toString('utf8').split('\n');

            // Add headers
            app.use(function(req, res, next) {

                // Website you wish to allow to connect
                res.setHeader('Access-Control-Allow-Origin', '*');//'http://localhost:8888');

                // Request methods you wish to allow
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

                // Request headers you wish to allow
                res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

                // Set to true if you need the website to include cookies in the requests sent
                // to the API (e.g. in case you use sessions)
                res.setHeader('Access-Control-Allow-Credentials', true);

                // Pass to next layer of middleware
                next();
            });

            app.get(superHeroesPath, function(req, res) {

                var result = '',
                    searchQuery = (req.query.q || '').trim().toLowerCase();

                if (searchQuery === '') {
                    res.status(404).end("No such search query");
                    return;
                }

                res.type('json'); // => 'application/json'
                res.status(200);

                var heroes = _.filter(superHeroes, function(curHero) {
                    return curHero.toLowerCase().indexOf(searchQuery) >= 0;
                });

                res.json(heroes);
                res.end();
            });

            app.listen(3000);
        });
    };

    exports.init = init;

}(typeof module.exports === 'object' && module.exports || this));