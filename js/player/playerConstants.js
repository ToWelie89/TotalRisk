const PLAYER_TYPES = {
    HUMAN: 0,
    AI: 1
};

const PLAYER_COLORS = {
    RED: {
        name: 'Red',
        mainColor: '#dd4444',
        borderColor: '#b22525',
        highlightColor: '#fe8c8c'
    },
    GREEN: {
        name: 'Green',
        mainColor: '#4acd61',
        borderColor: '#35a749',
        highlightColor: '#caf6c2'
    },
    BLUE: {
        name: 'Blue',
        mainColor: '#4770ea',
        borderColor: '#234abe',
        highlightColor: '#7272fa'
    },
    PINK: {
        name: 'Pink',
        mainColor: '#ff99cc',
        borderColor: '#ff6699',
        highlightColor: '#ffc9e4'
    },
    BLACK: {
        name: 'Black',
        mainColor: '#564848',
        borderColor: '#362d2d',
        highlightColor: '#525252'
    },
    YELLOW: {
        name: 'Yellow',
        mainColor: '#eaea67',
        borderColor: '#bbbb42',
        highlightColor: '#ffffae'
    }
};

const avatars = {
    'Julius Caesar': {
        picture: './assets/img/caesar.png',
        selectSound: '',
        flag: 'http://i.imgur.com/8MpJNmA.png'
    },
    'Napoleon Bonaparte': {
        picture: './assets/img/napoleon.png',
        selectSound: '',
        flag: 'https://i.pinimg.com/originals/42/0e/bd/420ebd5c48ff17a5cbfc0b8c6fe0dd3d.png'
    },
    'Hannibal Barca': {
        picture: './assets/img/hannibal_barca.png',
        selectSound: '',
        flag: 'https://vignette.wikia.nocookie.net/althistory/images/e/ea/Carthage_Flag_Romae.jpg/revision/latest?cb=20130803001213'
    },
    'Alexander the Great': {
        picture: './assets/img/alexander.png',
        selectSound: '',
        flag: 'https://en.wikipedia.org/wiki/Vergina_Sun#/media/File:Vergina_Sun_-_Golden_Larnax.png'
    },
    'Genghis Khan': {
        picture: './assets/img/genghiskhan.png',
        selectSound: '',
        flag: 'https://en.wikipedia.org/wiki/Golden_Horde#/media/File:Golden_Horde_flag_1339.svg'
    },
    'Attila the Hun': {
        picture: './assets/img/attila.png',
        selectSound: '',
        flag: 'https://upload.wikimedia.org/wikipedia/en/0/07/Hunnic_Empire_flag.jpg'
    },
    'Scipio Africanus': {
        picture: '/assets/img/scipio.png',
        selectSound: '',
        flag: 'http://i.imgur.com/8MpJNmA.png'
    },
    'Miltiades': {
        picture: './assets/img/miltiades.png',
        selectSound: '',
        flag: 'https://img00.deviantart.net/6cb9/i/2017/063/a/d/flag_of_the_athenian_empire__2_by_arthurdrakoni-db15r0x.png'
    },
    'Leonidas': {
        picture: './assets/img/leonidas.png',
        selectSound: '',
        flag: 'https://vignette.wikia.nocookie.net/cybernations/images/1/19/Flag_of_Sparta.svg/revision/latest?cb=20100122152927'
    },
    'Henry V': {
        picture: './assets/img/henryv.png',
        selectSound: '',
        flag: 'http://www.crwflags.com/fotw/images/g/gb-1399.gif'
    },
    'Charles XII': {
        picture: './assets/img/karlxii.png',
        selectSound: '',
        flag: 'https://d1e2j7xcnt57hx.cloudfront.net/se/img/20170922142134/flags/swe.svg'
    },
    'Saladin': {
        picture: './assets/img/saladin.png',
        selectSound: '',
        flag: 'https://sv.wikipedia.org/wiki/Ayyubiderna#/media/File:Flag_of_Ayyubid_Dynasty.svg'
    },
    'William the Conqueror': {
        picture: './assets/img/william.png',
        selectSound: '',
        flag: 'http://www.angusbreeder.net/media/FRN/lower%20normandy.png'
    },
    'Gustavus Adolphus': {
        picture: './assets/img/gustavusadolphus.png',
        selectSound: '',
        flag: 'https://d1e2j7xcnt57hx.cloudfront.net/se/img/20170922142134/flags/swe.svg'
    },
    'Duke of Wellington': {
        picture: './assets/img/dukeofwellington.png',
        selectSound: '',
        flag: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/ae/Flag_of_the_United_Kingdom.svg/1280px-Flag_of_the_United_Kingdom.svg.png'
    },
    'Hernán Cortés': {
        picture: './assets/img/hernancortes.png',
        selectSound: '',
        flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Flag_of_Cross_of_Burgundy.svg/1200px-Flag_of_Cross_of_Burgundy.svg.png'
    },
    'Shaka Zulu': {
        picture: './assets/img/shakazulu.png',
        selectSound: '',
        flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Conjectural_flag_of_Zululand_%281884-1897%29_by_Roberto_Breschi_taken_from_The_South_African_Flag_Book_by_A.P.Burgers.png/800px-Conjectural_flag_of_Zululand_%281884-1897%29_by_Roberto_Breschi_taken_from_The_South_African_Flag_Book_by_A.P.Burgers.png'
    },
    'Erich Ludendorff': {
        picture: './assets/img/ludendorff.png',
        selectSound: '',
        flag: 'https://i.ebayimg.com/00/s/MzQ3WDYwMA==/z/3IsAAOxyBvZTUSwH/$_58.JPG'
    },
    'Bernard Montgomery': {
        picture: './assets/img/montgomery.png',
        selectSound: '',
        flag: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/ae/Flag_of_the_United_Kingdom.svg/1280px-Flag_of_the_United_Kingdom.svg.png'
    },
    'George Patton': {
        picture: './assets/img/georgepatton.png',
        selectSound: '',
        flag: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a4/Flag_of_the_United_States.svg/1280px-Flag_of_the_United_States.svg.png'
    },
    'Jeanne d\'Arc': {
        picture: './assets/img/jeannedarc.png',
        pronounciation: 'Shann Darc',
        selectSound: ''
    },
    'Boudicca': {
        picture: './assets/img/boudicca.png',
        selectSound: '',
        flag: 'https://www.honga.net/totalwar/rome2/images/rome2/flags/iceni/mon_256.png'
    }
};

/*
Timur (teemur)
Sargon of Akkad
harald hardrada (harold ha-drada)
Rollo (rolo)
Ragnar Lodbrok
Ivar the Boneless (I-var the Boneless)
Richard I
Bohemond of Taranto
Rommel
någon samuraj
*/

const playerIterator = (playerMap, turnPhases) => {
    let currentPlayerIndex = 0;
    let currentTurnPhaseIndex = 0;
    let newPlayer = true;

    return {
        next: () => {
            if ((currentTurnPhaseIndex + 1) < turnPhases.length) {
                const turn = turnPhases[currentTurnPhaseIndex++];
                const player = playerMap[currentPlayerIndex];
                newPlayer = false;
                return {
                    player: player[1],
                    turnPhase: turn,
                    done: false,
                    newPlayer
                };
            }
            currentTurnPhaseIndex = 0;
            const turn = turnPhases[currentTurnPhaseIndex];
            const player = playerMap[currentPlayerIndex];
            newPlayer = true;

            if ((currentPlayerIndex + 1) < (playerMap.length)) {
                currentPlayerIndex++;
            } else {
                currentPlayerIndex = 0;
            }
            return {
                player: player[1],
                turnPhase: turn,
                done: false,
                newPlayer
            };
        },
        getCurrent: () => {
            return {
                player: playerMap[currentPlayerIndex][1],
                turnPhase: turnPhases[currentTurnPhaseIndex],
                done: false,
                newPlayer
            };
        }
    };
};

export {PLAYER_COLORS, playerIterator, avatars, PLAYER_TYPES};
