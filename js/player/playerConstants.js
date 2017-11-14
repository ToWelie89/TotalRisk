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
        flag: 'http://i.imgur.com/8MpJNmA.png',
        biography: 'Gaius Julius Caesar was a roman politician and general. He successfully conquered germanic tribes in Gaul where one of his most famous battle was the battle of Alesia where his 60 000 strong roman force defeated a gallic horde of around 200 000 men. Caesar then won a roman civil war against his biggest rival Pompey and became a roman dictator and one of the most powerful leaders of his age.'
    },
    'Napoleon Bonaparte': {
        picture: './assets/img/napoleon.png',
        selectSound: '',
        flag: 'https://i.pinimg.com/originals/42/0e/bd/420ebd5c48ff17a5cbfc0b8c6fe0dd3d.png',
        biography: 'Napoleon Bonaparte was a man who came from nothing, being a minor nobleman from the island of Corsica and a captain in the french army after the french revolution, but he would later become the empereor of France, the greatest empire in Europe during his time. Napoleon is regarded as one of the greatest military geniuses of all time, having defeated most of the mighty kingdoms and empires of Europe through tactical brilliance making him perhaps the most powerful man in the world. His greatest triumph was the battle of Austerlitz where he completely destroyed the organized Russian and Prussian resistance.'
    },
    'Hannibal Barca': {
        picture: './assets/img/hannibal_barca.png',
        selectSound: '',
        flag: 'https://vignette.wikia.nocookie.net/althistory/images/e/ea/Carthage_Flag_Romae.jpg/revision/latest?cb=20130803001213',
        biography: 'Hannibal Barca was a general of the mighty Carthaginian empire in North Africa. During his childhood Rome inflicted a heavy humiliating defeat upon Carthage, to which he swore an oath to never be a friend of the romans, words he lived by for the rest of his life. He led one of the most audacious campaigns in history by crossing the alps in midwinter and challenging the roman empire on their own turf. He won every single battle he fought in the italian peninsula and eventually crushed the romans last ditch all out attack at the legendary battle of Cannae. He is considered one of the best generals in history.'
    },
    'Alexander the Great': {
        picture: './assets/img/alexander.png',
        selectSound: '',
        flag: 'https://en.wikipedia.org/wiki/Vergina_Sun#/media/File:Vergina_Sun_-_Golden_Larnax.png',
        biography: 'Few men have shaped the world so much as Alexander the Great, he was a seemingly fearless warrior with ambitions and confidence out of this world. He expanded his small kingdom of Macedon into becoming one of the largest empires ever by completely defeating the superpower of his age, the Persian Empire. He personally led his companion cavalry in person and was near-mortally wounded at several occasions. He died of fever at the young of 32, having conquered two thirds of the known world and never having lost a single battle.'
    },
    'Genghis Khan': {
        picture: './assets/img/genghiskhan.png',
        selectSound: '',
        flag: 'https://en.wikipedia.org/wiki/Golden_Horde#/media/File:Golden_Horde_flag_1339.svg',
        biography: 'Genghis Khan, whose real name was Timujin, was a feared leader and general who conquered the largest land empire in history. He came from a simple background, being the leader of a small tribe, but he managed to unite all of the mongolian tribes and also completely reformed with ingenious tactics, thus granting him the title \'Genghis Khan\' which means \'Ruler of all\'. He then destroyed the nearby chinese Han Empire and much of the former persian empire and expanded as far away as into Europe.'
    },
    'Attila the Hun': {
        picture: './assets/img/attila.png',
        selectSound: '',
        flag: 'https://upload.wikimedia.org/wikipedia/en/0/07/Hunnic_Empire_flag.jpg',
        biography: 'During the later days of the Roman nomadic peoples, referred to as barbarians by the romans, terrorized and attack everywhere along the vast borders of the empire. None of these barbarian leader were as feared as Atilla the Hun. He was the leader of a tribal empire consisting of huns, ostrogoths and alans and he commanded a huge army of almost 100 000 men. He successfully plundered the Balkans and invaded the eastern roman empire and Italy.'
    },
    'Scipio Africanus': {
        picture: '/assets/img/scipio.png',
        selectSound: '',
        flag: 'http://i.imgur.com/8MpJNmA.png',
        biography: ''
    },
    'Miltiades': {
        picture: './assets/img/miltiades.png',
        selectSound: '',
        flag: 'https://img00.deviantart.net/6cb9/i/2017/063/a/d/flag_of_the_athenian_empire__2_by_arthurdrakoni-db15r0x.png',
        biography: 'Miltiades was an Athenian citizen who was elected to serve as one of the greek generals at the legendary battles of Marathon, where a 10 000 strong greek force defeated a persian invading army of over 25 000. Miltiades have been credited with devising the tactics that defeated the persians in this crucial engagement that saved greek civilisation from persian rule.'
    },
    'Leonidas': {
        picture: './assets/img/leonidas.png',
        selectSound: '',
        flag: 'https://vignette.wikia.nocookie.net/cybernations/images/1/19/Flag_of_Sparta.svg/revision/latest?cb=20100122152927',
        biography: 'Leonidas was king of the renowned warrior citystate known as Sparta. He led a force of 300 spartans supported by 7 000 greek allies against a persian invasion force led by King Xerxes I whose army was at least 10 times bigger. Leonidas and his army successfully defended the mountain pass of Thermopylae for several crucial days despite the severe numerical disadvantage. After being surrounded Leonidas and the last of the men who had chosen to stay fought a valiant last stand, a moment that has been immortalized in both history and myth.'
    },
    'Henry V': {
        picture: './assets/img/henryv.png',
        selectSound: '',
        flag: 'http://www.crwflags.com/fotw/images/g/gb-1399.gif',
        biography: ''
    },
    'Charles XII': {
        picture: './assets/img/karlxii.png',
        selectSound: '',
        flag: 'https://d1e2j7xcnt57hx.cloudfront.net/se/img/20170922142134/flags/swe.svg',
        biography: 'Charles XII inherited the throne of the Swedish kingdom at the mere age of 15. At this time several of Swedens enemies declared war on them in an attempt to reconquer lands that had been previously conquered by Sweden. This ensured that the life of Charles XII would be almost exclusively paved with war. He is most famous for having defeated the Russians at the battle of Narva where his army of around 12 000 men defeated the russians tsars army of 37 000.'
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
        flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Flag_of_Cross_of_Burgundy.svg/1200px-Flag_of_Cross_of_Burgundy.svg.png',
        biography: 'Hernán Cortés was one of the most successful and ruthless of the Spanish conquistadors who fought native americans in the new world. He led an expedition with just a few hundred spaniards accompanied by a few thousands native allies and completely destroyed the Aztec empire after a decisive victory at the battle of Otumba. He later seized the Aztec capital of Tenochtitlan and renamed it to Mexico City, which he became governor of.'
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
            while (playerMap[currentPlayerIndex][1].dead) {
                if ((currentPlayerIndex + 1) < (playerMap.length)) {
                    currentPlayerIndex++;
                } else {
                    currentPlayerIndex = 0;
                }
            }

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
        },
        handleDefeatedPlayer: (defeatedPlayer) => {
            const player = playerMap.map(x => x[1]).find(x => x.name === defeatedPlayer);
            if (player) {
                player.dead = true;
            }
        }
    };
};

export {PLAYER_COLORS, playerIterator, avatars, PLAYER_TYPES};
