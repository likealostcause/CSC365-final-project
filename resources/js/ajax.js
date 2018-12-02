'use strict';

const ajax = new XMLHttpRequest();
ajax.open('GET', '/get-music?numberOfTracks');

ajax.addEventListener('load', function() {
	console.log('Finished');
	console.log(typeof ajax.response);
	const track = JSON.parse(ajax.response);

});
