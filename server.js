'use strict';

const express = require('express'),
	app = express();

app.set('view engine', 'pug');
app.set('views', 'views');

app.use(express.static('resources'));

app.get('/', function(req, res) {
	res.render('homepage');
});

const server = app.listen(3000, function() {
	console.log(`Server started on port ${server.address().port}`);
});
