const express = require('express');
const axios = require('axios');
const Scraper = require('@yimura/scraper').default;
const cors = require('cors');

const app = express();
const youtube = new Scraper();

const corsOptions = {
   origin:'*', 
   credentials:true,
   optionSuccessStatus:200,
};

const apiRecommendationsLink = "https://tastedive.com/api/similar?q=";

// Innitialize Express Server
const PORT = process.env.PORT || 3000
try {
	app.listen(PORT);
	console.log("Express running on port: " + PORT);
} catch (e) {
	console.error('Unable to stablish server: ', e);
};

app.use(cors(corsOptions))

// Handle GET request.
app.get('/:input', async (req, res) => {
	const { input } = req.params
	// Create playlist link, scrapping youtube video IDs.
	const playlistLink = await CreatePlayList(input, apiRecommendationsLink);
	console.log("playlistLink");
	console.log(playlistLink);
	// Validate playlistLink.
	if (playlistLink == false) {
		res.send(JSON.stringify({link: "Request failed. Try again!"}))		
	} else {
		res.send(JSON.stringify({link: playlistLink}))
	};
})

// Method to search similar artists.
const CreatePlayList = async (musicianName, apiRecommendationsLink) => {

	// HTTP GET Request to get recommendations.
	const APIRecommendations = await getAPIRecommendations(musicianName, apiRecommendationsLink);
	console.log("APIRecommendations")
	// Validate API Recommendations response. If False, end process.
	if (APIRecommendations == false) {
		return false
	};

	// Store first 4 recommendations.
	const recommendations = await storeRecommendations(APIRecommendations);
	console.log(recommendations);

	// For each recommendation, get 4 ID videos.
	const videosIDs = await getVideosIDs(recommendations);

	// Concatenate IDs + youtube base url for playlist.
	let playlistURL;
	playlistURL = 'http://www.youtube.com/watch_videos?video_ids='+videosIDs[0]+','+videosIDs[1]+','+videosIDs[2]+','+videosIDs[3];
	console.log(playlistURL);
	
	return playlistURL;
};

// Method to make HTTP GET Request to API, and get recommendations JSON.
const getAPIRecommendations = async (musicianName, apiRecommendationsLink) => {
	try {
		let response = await axios.get(`${apiRecommendationsLink}${musicianName}`);
		return response;
	} catch (error) {
		console.log('API tasteDive failed request. Retry.');
		return false
	}
};
// Method to store in an array the name of the first 4 recommendations.
const storeRecommendations  = (APIRecommendations) => {
	let recommendations = [];
	for(let i=0; i < 4; i++) {
		recommendations.push(APIRecommendations.data.Similar.Results[i].Name)
	};
	return recommendations
};
// Method to store in an array the videos IDs for each recommendations.
const getVideosIDs = async (recommendations) => {
	let videosIDs = [];
	for (let i=0; i < recommendations.length; i++) {
		let response = await scrapeIDs(recommendations[i]);
		videosIDs.push(response)
	}
	return videosIDs;
}
// Method to scrape 4 youtube videos IDs.
const scrapeIDs = async (recommendation) => {
	try {
		let videosIDs = [];
		let response = await youtube.search(recommendation);
		for (let i=0; i < 4; i++) {
			videosIDs.push(response.videos[i].id);
		}
		return videosIDs;
	} catch (error) {
		console.log(error);	
		return
	}
};