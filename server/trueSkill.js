const trueSkill = require('com.izaakschroeder.trueskill').create();

const playMatch = (players, results) => {
	const newRatings = trueSkill.update(players.map((player) => [player.rating]), results);
	return {
		newRatings,
		oldRatings: players.map((player) => [player.rating])
	};
};

const getNewRating = () => {
	return trueSkill.createRating();
};

const players = [{
	name: 'alice',
	rating: getNewRating()
}, {
	name: 'bob',
	rating: getNewRating()
}, {
	name: 'chris',
	rating: getNewRating()
}, {
	name: 'darren',
	rating: getNewRating()
}];

// INITIAL
console.log(players.map(p => p.rating))
// 1st round
var lol = playMatch(players,[0,1,2,3]);
players.forEach((p, i) => {
	p.rating = lol.newRatings[i][0]
});
console.log(players.map(p => p.rating))
// 2nd round
lol = playMatch(players,[0,1,2,3]);
players.forEach((p, i) => {
	p.rating = lol.newRatings[i][0]
});
console.log(players.map(p => p.rating))

module.exports = {
    playMatch,
    getNewRating
};
