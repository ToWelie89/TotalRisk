const patchLog = {
    '1.4.1': {
        patchType: 'major',
        description: 'This patch contains lots of improvements, bug fixes and new added features.',
        news: [{
            title: 'Additional maps',
            description: 'The ability to play on other maps other than the classic map has been added. Two new maps are now available for both singleplayer and multiplayer; Classic world map extended and Napoleonic era Europe map. More maps will soon come!'
        }, {
            title: 'More customization options',
            description: 'There are more character customization options available now.'
        }, {
            title: 'Leaderboard enabled',
            description: 'You can now view the leaderboard. You have to have completed at least ONE multiplayer game to be able to get a ranking and appear on the leaderboard.'
        }, {
            title: 'Character gallery',
            description: 'Added a gallery where you can see all the characters created by the community.'
        }, {
            title: 'Fast dice',
            description: 'In the settings menu you can now enable fast dice mode. This will make the dice roll almost immediately, saving precious time for those who are impatient.'
        }, {
            title: 'Default settings',
            description: 'Added the ability to reset settings to default. The default settings are the ones recommended for this game.'
        }, {
            title: 'Added quick link to report bug site',
            description: 'Check the top right corner for the little bug icon. This will open the projects Github page where you can submit bugs. Feel free to also submit suggestions and feedback.'
        }, {
            title: 'Visual improvements',
            description: 'Lots of graphical improvements to the game view.',
            subPoints: [
                'Replaced the turn timer in multiplayer games.',
                'Also warn a player in multiplayer games if the time is almost up',
                'Adjusted the speed of AI opponents in multiplayer games.',
                'Added ability to see the bonuses for controlling whole regions.',
                'Made it more visibly obvious when other players or AI:s are attacking or performing movements in mulitplayer games by drawing arrows between territories on the map.'
            ]
        }],
        bugFixes: [{
            title: '',
            description: 'Fixed a bug where the tutorial would not work properly.'
        }, {
            title: '',
            description: 'Fixed a bug where player could not choose their character in a multiplayer lobby.'
        }, {
            title: '',
            description: 'Fixed a bug where a player could not set a default character.'
        }, {
            title: '',
            description: 'Fixed a bug where players could see other players cards in mulitplayer games.'
        }, {
            title: '',
            description: 'Fixed a bug where players could not select their custom created characters.'
        }, {
            title: '',
            description: 'Fixed a bug where the game announcer voice would not speak.'
        }, {
            title: '',
            description: 'Fixed a bug where it wasn\'t possible to change a player to AI in a singleplayer lobby.'
        }, {
            title: '',
            description: 'Fixed a bug where players couldn\'t see newly created multiplayer lobbies.'
        }]
    }
};

module.exports = {
    patchLog
};