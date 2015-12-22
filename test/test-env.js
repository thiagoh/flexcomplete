(function(exports) {

    'use strict';

    var init = function() {

        var express = require('express'),
            http = require('https'),
            _ = require('underscore'),
            fs = require('fs'),
            app = express(),
            data1Path = "/data/test1",
            readline = require('readline'),
            superHeroes = [];

        fs.readFile('./test/super-heroes.data', function(err, data) {
            if (err) {
                throw err;
            }

            superHeroes = data.toString('utf8').split('\n');

            app.get(data1Path, function(req, res) {

                var result = '',
                    searchQuery = (req.query.q || '').trim();

                if (searchQuery === '') {
                    res.status(404).end("No such search query");
                    return;
                }

                res.type('json'); // => 'application/json'
                res.status(200);

                var heroes = _.filter(superHeroes, function(curHero) {
                    return curHero.indexOf(searchQuery) >= 0;
                });

                res.json(heroes);
                res.end();
            });

            var server = app.listen(3000, function() {
                var host = server.address().address;
                var port = server.address().port;

                console.log('Example app listening at http://%s:%s', host, port);
            });
        });
    };

    exports.init = init;

}(typeof module.exports === 'object' && module.exports || this));