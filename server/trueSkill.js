const trueSkill = require('com.izaakschroeder.trueskill').create();

/*
	Players list:
	[
		{
			name: 'Pelle',
			rating: {
				{ mu: 25, sigma: 8.333333333333334 }
				// or
				trueSkill.createRating()
			}
		},
		...
	]
	Results:
	[<Rank for player n>...]
	eg:
	[0,1,2,2,3]
*/

const playMatch = (players, results) => {
	const newRatings = trueSkill.update(players.map((player) => [player.rating]), results);
	return {
		newRatings,
		oldRatings: players.map((player) => [player.rating])
	};
};

const players = [{
		name: 'alice',
		rating: trueSkill.createRating()
	}, {
		name: 'bob',
		rating: trueSkill.createRating()
	}, {
		name: 'chris',
		rating: trueSkill.createRating()
	}, {
		name: 'darren',
		rating: trueSkill.createRating()
	}];

var lol = playMatch(players,[0,1,2,10]);
console.log(JSON.stringify(lol, null, 4))

module.exports = {
    playMatch
};
