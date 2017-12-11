const PLAYER_TYPES = {
    HUMAN: 0,
    AI_NORMAL: 1,
    AI_EXPERT: 2
};

const PLAYER_COLORS = {
    PURPLE: {
        name: 'Purple',
        mainColor: '#a55eec',
        borderColor: '#8442c6',
        highlightColor: '#b68ae1'
    },
    BLACK: {
        name: 'Black',
        mainColor: '#564848',
        borderColor: '#362d2d',
        highlightColor: '#525252'
    },
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
        flag: './assets/flags/rome.png',
        biography: 'Gaius Julius Caesar was a roman politician and general. He successfully conquered germanic tribes in Gaul where one of his most famous battle was the battle of Alesia where his 60 000 strong roman force defeated a gallic horde of around 200 000 men. Caesar then won a roman civil war against his biggest rival Pompey and became a roman dictator and one of the most powerful leaders of his age.'
    },
    'Napoleon Bonaparte': {
        picture: './assets/img/napoleon.png',
        selectSound: '',
        flag: './assets/flags/france.png',
        biography: 'Napoleon Bonaparte was a man who came from nothing, being a minor nobleman from the island of Corsica and a captain in the french army after the french revolution, but he would later become the empereor of France, the greatest empire in Europe during his time. Napoleon is regarded as one of the greatest military geniuses of all time, having defeated most of the mighty kingdoms and empires of Europe through tactical brilliance making him perhaps the most powerful man in the world. His greatest triumph was the battle of Austerlitz where he completely destroyed the organized Russian and Austrian resistance.'
    },
    'Hannibal Barca': {
        picture: './assets/img/hannibal_barca.png',
        selectSound: '',
        flag: './assets/flags/carthage.png',
        biography: 'Hannibal Barca was a general of the mighty Carthaginian empire in North Africa. During his childhood Rome inflicted a heavy humiliating defeat upon Carthage, to which he swore an oath to never be a friend of the romans, words he lived by for the rest of his life. He led one of the most audacious campaigns in history by crossing the alps in midwinter and challenging the roman empire on their own turf. He won every single battle he fought in the italian peninsula and eventually crushed the romans last ditch all out attack at the legendary battle of Cannae. He is considered one of the best generals in history.'
    },
    'Alexander the Great': {
        picture: './assets/img/alexander.png',
        selectSound: '',
        flag: './assets/flags/macedon.png',
        biography: 'Few men have shaped the world so much as Alexander the Great, he was a seemingly fearless warrior with ambitions and confidence out of this world. He expanded his small kingdom of Macedon into becoming one of the largest empires ever by completely defeating the superpower of his age, the Persian Empire. He personally led his companion cavalry in person and was near-mortally wounded at several occasions. He died of fever at the young of 32, having conquered two thirds of the known world and never having lost a single battle.'
    },
    'Genghis Khan': {
        picture: './assets/img/genghiskhan.png',
        selectSound: '',
        flag: './assets/flags/goldenhorde.png',
        biography: 'Genghis Khan, whose real name was Timujin, was a feared leader and general who conquered the largest land empire in history. He came from a simple background, being the leader of a small tribe, but he managed to unite all of the mongolian tribes and also completely reformed with ingenious tactics, thus granting him the title \'Genghis Khan\' which means \'Ruler of all\'. He then destroyed the nearby chinese Han Empire and much of the former persian empire and expanded as far away as into Europe.'
    },
    'Attila the Hun': {
        picture: './assets/img/attila.png',
        selectSound: '',
        flag: './assets/flags/hunnicempire.png',
        biography: 'During the later days of the Roman empire nomadic peoples, referred to as barbarians by the romans, terrorized and attacked everywhere along the vast borders of the empire. None of these barbarian leaders were as feared as Atilla the Hun. He was the leader of a tribal empire consisting of huns, ostrogoths and alans and he commanded a huge army of almost 100 000 men. He successfully plundered the Balkans and invaded the eastern roman empire and Italy.'
    },
    'Scipio Africanus': {
        picture: '/assets/img/scipio.png',
        selectSound: '',
        flag: './assets/flags/rome.png',
        biography: ''
    },
    'Miltiades': {
        picture: './assets/img/miltiades.png',
        selectSound: '',
        flag: './assets/flags/athens.png',
        biography: 'Miltiades was an Athenian citizen who was elected to serve as one of the greek generals at the legendary battles of Marathon, where a 10 000 strong greek force defeated a persian invading army of over 25 000. Miltiades have been credited with devising the tactics that defeated the persians in this crucial engagement that saved greek civilisation from persian rule.'
    },
    'Leonidas': {
        picture: './assets/img/leonidas.png',
        selectSound: '',
        flag: './assets/flags/sparta.png',
        biography: 'Leonidas was king of the renowned warrior citystate known as Sparta. He led a force of 300 spartans supported by 7 000 greek allies against a persian invasion force led by King Xerxes I whose army was at least 10 times bigger. Leonidas and his army successfully defended the mountain pass of Thermopylae for several crucial days despite the severe numerical disadvantage. After being surrounded Leonidas and the last of the men who had chosen to stay fought a valiant last stand, a moment that has been immortalized in both history and legend.'
    },
    'Henry V': {
        picture: './assets/img/henryv.png',
        selectSound: '',
        flag: './assets/flags/oldEngland.png',
        biography: ''
    },
    'Charles XII': {
        picture: './assets/img/karlxii.png',
        selectSound: '',
        flag: './assets/flags/sweden.png',
        biography: 'Charles XII inherited the throne of the Swedish kingdom at the mere age of 15. At this time several of Swedens enemies declared war on them in an attempt to reconquer lands that had been previously conquered by Sweden. This ensured that the life of Charles XII would be almost exclusively paved with war. He is most famous for having defeated the Russians at the battle of Narva where his army of around 12 000 men defeated the russians tsars army of 37 000.'
    },
    'Saladin': {
        picture: './assets/img/saladin.png',
        selectSound: '',
        flag: './assets/flags/ayyubid.png'
    },
    'William the Conqueror': {
        picture: './assets/img/william.png',
        selectSound: '',
        flag: './assets/flags/normandy.png'
    },
    'Gustavus Adolphus': {
        picture: './assets/img/gustavusadolphus.png',
        selectSound: '',
        flag: './assets/flags/sweden.png'
    },
    'Duke of Wellington': {
        picture: './assets/img/dukeofwellington.png',
        selectSound: '',
        flag: './assets/flags/britain.png'
    },
    'Hernán Cortés': {
        picture: './assets/img/hernancortes.png',
        selectSound: '',
        flag: './assets/flags/spanishEmpire.png',
        biography: 'Hernán Cortés was one of the most successful and ruthless of the Spanish conquistadors who fought native americans in the new world. He led an expedition with just a few hundred spaniards accompanied by a few thousands native allies and completely destroyed the Aztec empire after a decisive victory at the battle of Otumba. He later seized the Aztec capital of Tenochtitlan and renamed it to Mexico City, which he became governor of.'
    },
    'Shaka Zulu': {
        picture: './assets/img/shakazulu.png',
        selectSound: '',
        flag: './assets/flags/zulu.png'
    },
    'Erich Ludendorff': {
        picture: './assets/img/ludendorff.png',
        selectSound: '',
        flag: './assets/flags/germanEmpire.png'
    },
    'Bernard Montgomery': {
        picture: './assets/img/montgomery.png',
        selectSound: '',
        flag: './assets/flags/britain.png'
    },
    'George Patton': {
        picture: './assets/img/georgepatton.png',
        selectSound: '',
        flag: './assets/flags/unitedStates.png'
    },
    'Jeanne d\'Arc': {
        picture: './assets/img/jeannedarc.png',
        pronounciation: 'Shann Darc',
        selectSound: '',
        flag: './assets/flags/oldFrance.png'
    },
    'Boudicca': {
        picture: './assets/img/boudicca.png',
        selectSound: '',
        flag: './assets/flags/iceni.png'
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
            } else {
                if ((currentPlayerIndex + 1) < (playerMap.length)) {
                    currentPlayerIndex++;
                } else {
                    currentPlayerIndex = 0;
                }

                currentTurnPhaseIndex = 0;
                const turn = turnPhases[currentTurnPhaseIndex];
                const player = playerMap[currentPlayerIndex];
                newPlayer = true;

                while (playerMap[currentPlayerIndex][1].dead) {
                    if ((currentPlayerIndex + 1) < (playerMap.length)) {
                        currentPlayerIndex++;
                    } else {
                        currentPlayerIndex = 0;
                    }
                }

                return {
                    player: player[1],
                    turnPhase: turn,
                    done: false,
                    newPlayer
                };
            }
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
