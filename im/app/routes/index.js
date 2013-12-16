module.exports = function (app) {

    app.get('/', function (req, res) {
        res.render('sensor.html');
    });

    app.get('/d', function (req, res) {
        res.render('d.html');
    });



    require('./im')(app);

    require('./sensor')(app);

};



