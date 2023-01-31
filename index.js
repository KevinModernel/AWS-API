// Montar express server, y mandar algo al front (.jSON), y eso lo subis a aws. Primero probalo en local.
const express = require('express');
const axios = require('axios');
const Scraper = require('@yimura/scraper').default;

const app = express();
const youtube = new Scraper()

// Innitialize Express Server
const PORT = process.env.PORT || 3000
try {
	app.listen(PORT);
	console.log("Express running on port: " + PORT);
} catch (e) {
	console.error('Unable to stablish server: ', e);
};

app.get('/', async (req, res) => {
	//const playlistLink = await searchArtists('duki');
	res.send('<h1>Express con HTML!! 8) </h1>');
	//res.end(JSON.stringify({link: playlistLink}) )
})


const api = "https://tastedive.com/api/similar?q=";

//let userInput = 'duki';
let videosIDs = [];

// Method to search similar artists.
const searchArtists = async (musicianName) => {
	let response;

	try { // HTTP GET Request to get recommendations. ############################ Works Ok.
		response = await axios.get(`${api}${musicianName}`);
	} catch (error) {
		console.log('API tasteDive failed request. Retry.');
	};

	// Store artists names ############################ Works Ok.
	let recommendations = [];
	for(let i=0; i < 4; i++) {
		recommendations.push(response.data.Similar.Results[i].Name)
	}
	console.log(recommendations); // ############################ Works Ok.

	// For each recommendation, scrape and store 4 ID videos. // ############################ Works Ok.
	for (let i=0; i < recommendations.length; i++) {
		await scrapeIDs(recommendations[i]); // #############Agregaste await aca y ahora si funciona sin settimer
	};

	// Method to scrape youtube video links
	async function scrapeIDs (recommendation) {
		try {
			//const yt = new youtube.default();
			let resultados = await youtube.search(recommendation)
			videosIDs.push(resultados.videos[0].id+','+resultados.videos[1].id+','+resultados.videos[2].id+','+resultados.videos[3].id);

		} catch (error) {
			console.log(error);	
		}
	};
	console.log(videosIDs);

	// Concatenate IDs + youtube base url for playlist.
	let playlistURL;
	playlistURL = 'https://www.youtube.com/watch_videos?video_ids='+videosIDs[0]+','+videosIDs[1]+','+videosIDs[2]+','+videosIDs[3];
	console.log(playlistURL);
	return playlistURL
}
