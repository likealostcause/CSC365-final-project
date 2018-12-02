'use strict';

const ajax = new XMLHttpRequest();
ajax.open('GET', 'https://api.spotify.com/v1/recommendations');

ajax.addEventListener('load', function() {
	console.log('Finished');
	console.log(typeof ajax.response);
	const track = JSON.parse(ajax.response);

});
