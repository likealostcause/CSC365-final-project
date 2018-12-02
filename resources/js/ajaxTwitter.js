'use strict';

const tweetIt = function(url) {
	const xhr = new XMLHttpRequest();
	xhr.open('POST', '/tweet');
	xhr.setRequestHeader('Content-Type', 'application/json');

	xhr.addEventListener('load', function() {
		console.log('tweeted it');
	});

	xhr.send(
		JSON.stringify({
			spotifyUrl: url
		})
	);
};

const getTracks = function(numTracks) {
	const xhr = new XMLHttpRequest();
	xhr.open('GET', '/get-music?numTracks=' + numTracks);

	xhr.addEventListener('load', function() {

		const spotifyInfo = JSON.parse(xhr.response);
		//loop over received data and dynamically add tracks to table
		spotifyInfo.tracks.forEach(function(trackInfo) {
			let trackName = trackInfo.name;
			let trackArtist = document.createTextNode(trackInfo.artists[0].name);
			let trackUrl = trackInfo.external_urls.spotify;
			//let trackPreview = trackInfo.preview_url;
			let trackAnchor = document.createElement('a');
			trackAnchor.setAttribute('href', trackUrl);
			trackAnchor.innerText = trackName;
			let tdArtist = document.createElement('td');
			let tdName = document.createElement('td');
			tdArtist.appendChild(trackArtist);
			tdName.appendChild(trackAnchor);
			let button = document.createElement('button');
			button.appendChild(document.createTextNode('Tweet'));
			button.setAttribute('onclick', `tweetIt('${trackUrl}')`);
			let tdTwitterBtn = document.createElement('td');
			tdTwitterBtn.appendChild(button);

			let tr = document.createElement('tr');
			tr.appendChild(tdArtist);
			tr.appendChild(tdName);
			tr.appendChild(tdTwitterBtn);

			document.getElementById('dataTable').appendChild(tr);
		});
	});

	xhr.addEventListener('error', function() {
		console.error('Error occured :(');
	});

	xhr.timeout = 5 * 1000;
	xhr.addEventListener('timeout', function() {
		console.warn('Timeout');
	});

	xhr.send();
};

document.querySelector('#musicInfo').addEventListener('submit', function(evt) {
	evt.preventDefault();

	const input = document.querySelector('#input');
	let numTracks = input.value;
	if(numTracks > 15)
		numTracks = 15;

	input.value = '';
	getTracks(numTracks);
});
