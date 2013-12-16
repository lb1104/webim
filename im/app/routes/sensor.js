var sensor = require('../c/sensor');

module.exports = function (app) {

    app.get('/sensor', function (req, res) {
        res.render('sensor.html');
    });

    app.get('/sensor_add', function (req, res) {
        res.render('sensor_add.html');
    });


    app.post('/sensor', function (req, res) {
        sensor.addPost(req, res);
        res.send('ok');
    });

    app.post('/socketlist', function (req, res) {
        sensor.list(req, res);
    });

    app.post('/sensorlist', function (req, res) {
        sensor.sensorlist(req, res);
    });
    app.get('/sensorlist', function (req, res) {
        res.render('sensorlist.html');
    });


};