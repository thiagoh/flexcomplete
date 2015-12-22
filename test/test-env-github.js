(function(exports) {

    'use strict';

    var init = function() {

        var express = require('express'),
            http = require('https'),
            _ = require('underscore'),
            app = express(),
            data1Path = "/data/test1",
            agent = new http.Agent({

            });

        app.get(data1Path, function(req, res) {

            var result = '';
            var searchQuery = (req.query.q || '').trim();

            console.log(searchQuery, searchQuery === '');

            if (searchQuery === '') {
                res.status(404).end("No such search query");
                return;
            }

            http.get({
                hostname: 'api.github.com',
                port: 443,
                //path: '/users/jeresig/followers',
                path: '/users/ericelliott/followers',
                headers: {
                    'User-Agent': 'thiagoh'
                }
            }, function(httpResponse) {

                httpResponse.on('data', function(chunk) {
                    result += chunk;
                });
                httpResponse.on('end', function() {
                    res.type('json'); // => 'application/json'
                    res.status(200);

                    var followers = _.filter(JSON.parse(result), function(curFollower) {
                        return curFollower.login.indexOf(searchQuery) >= 0;
                    });

                    res.json(followers);
                    res.end();
                });
            }).on('error', function(e) {
                console.log("Got error: " + e.message);
            });
        });

        var server = app.listen(3000, function() {
            var host = server.address().address;
            var port = server.address().port;

            console.log('Example app listening at http://%s:%s', host, port);
        });
    };

    exports.init = init;

}(typeof module.exports === 'object' && module.exports || this));