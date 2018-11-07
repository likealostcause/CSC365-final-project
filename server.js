'use strict';

const express = require('express'),
	app = express();

app.set('view engine', 'pug');
app.set('views', 'views');

app.use(express.static('resources'));

app.get('/', function(req, res) {
	res.render('homepage');
});
