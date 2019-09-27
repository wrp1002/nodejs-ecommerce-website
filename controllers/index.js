module.exports = function(app) {  
    app.get('/', async (req, res) => {
        res.render('pages/index');
    });
}

