const PLAYER_TYPES = {
    HUMAN: 0,
    AI: 1
};

const AI_VALUES = {
    /*
    belongsToBigThreat: 2,
    bigThreatMultiplier: 1.5, // 1.1 - 2.0
    bonusTroopsForRegionMultiplier: 0.5, // 0.1 - 1.5
    canBeAttackedToBreakUpRegion: 3,
    closeToCaptureRegion: 7,
    closeToCaptureRegionPercentage: 60, // 55 - 80
    extraPointsForBreakUpRegionForBigThreat: 6,
    lastTerritoryLeftInRegion: 5,
    mostTroopsInThisRegion: 5,
    movementPlayerThreatPointsLessThanTotalBordering: 2,
    movementPlayerThreatPointsLessThanTotalBorderingTroopMultiplier: 0.3,
    movementTerritoryHasBorderWithEnemy: 3,
    movementTerritoryIsFrontlineForControlledRegion: 6,
    movementTerritoryIsFrontlineRegionBonusTroopsMultiplier: 1.5, // 1.0 - 3.0
    movementTerritoryWithSafeBordersAmountOfTroops: 5,
    movementTerritoryWithSafeBordersExtraTroops: 4,
    movmentTotalBorderingTroopsMultiplier: 0.5, // 0.2 - 1.5
    opportunityToEliminatePlayer: 4
    */
    belongsToBigThreat: 10,
    bigThreatMultiplier: 1.4,
    bonusTroopsForRegionMultiplier: 0.1,
    canBeAttackedToBreakUpRegion: 5,
    closeToCaptureRegion: 6,
    closeToCaptureRegionPercentage: 69,
    extraPointsForBreakUpRegionForBigThreat: 3,
    lastTerritoryLeftInRegion: 10,
    mostTroopsInThisRegion: 4,
    movementPlayerThreatPointsLessThanTotalBordering: 5,
    movementPlayerThreatPointsLessThanTotalBorderingTroopMultiplier: 0.4,
    movementTerritoryHasBorderWithEnemy: 1,
    movementTerritoryIsFrontlineForControlledRegion: 3,
    movementTerritoryIsFrontlineRegionBonusTroopsMultiplier: 2.8,
    movementTerritoryWithSafeBordersAmountOfTroops: 8,
    movementTerritoryWithSafeBordersExtraTroops: 9,
    movmentTotalBorderingTroopsMultiplier: 0.6,
    opportunityToEliminatePlayer: 3
};

const PLAYER_COLORS = {
    PURPLE: {
        name: 'Purple',
        mainColor: '#a55eec',
        borderColor: '#8442c6',
        highlightColor: '#b68ae1'
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
    BLACK: {
        name: 'Black',
        mainColor: '#564848',
        borderColor: '#362d2d',
        highlightColor: '#525252'
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
        id: 'caesar',
        title: 'Emperor of Rome',
        picture: './assets/img/caesar.png',
        selectSound: '',
        flag: './assets/flagsSvg/rome.svg',
        svg: './assets/avatarSvg/caesar.svg',
        svgAttributesLarge: {
            svgWidth: '130%',
            svgHeight: '100%',
            svgMarginLeft: '-20px',
            svgMarginTop: '0px',
        },
        svgAttributesSmall: {
            svgWidth: '220%',
            svgHeight: '130%',
            svgMarginLeft: '-60px',
            svgMarginTop: '0px',
        },
        svgAttributesXsmall: {
            svgWidth: '150%',
            svgHeight: '100%',
            svgMarginLeft: '-13px',
            svgMarginTop: '4px',
        },
        biography: 'Gaius Julius Caesar was a roman politician and general. He successfully conquered germanic tribes in Gaul where one of his most famous battle was the battle of Alesia where his 60 000 strong roman force defeated a gallic horde of around 200 000 men. Caesar then won a roman civil war against his biggest rival Pompey and became a roman dictator and one of the most powerful leaders of his age.'
    },
    'Napoleon Bonaparte': {
        id: 'napoleon',
        title: 'Emperor of France',
        picture: './assets/img/napoleon.png',
        selectSound: '',
        flag: './assets/flagsSvg/france.svg',
        svg: './assets/avatarSvg/napoleon.svg',
        svgAttributesLarge: {
            svgWidth: '190%',
            svgHeight: '520px',
            svgMarginLeft: '-113px',
            svgMarginTop: '-47px',
        },
        svgAttributesSmall: {
            svgWidth: '280%',
            svgHeight: '120%',
            svgMarginLeft: '-80px',
            svgMarginTop: '10px',
        },
        svgAttributesXsmall: {
            svgWidth: '220%',
            svgHeight: '100%',
            svgMarginLeft: '-50px',
            svgMarginTop: '-9px',
        },
        biography: 'Napoleon Bonaparte was a man who came from nothing, being a minor nobleman from the island of Corsica and a captain in the french army after the french revolution, but he would later become the empereor of France, the greatest empire in Europe during his time. Napoleon is regarded as one of the greatest military geniuses of all time, having defeated most of the mighty kingdoms and empires of Europe through tactical brilliance making him perhaps the most powerful man in the world. His greatest triumph was the battle of Austerlitz where he completely destroyed the organized Russian and Austrian resistance.'
    },
    'Genghis Khan': {
        id: 'genghiskhan',
        title: 'Great Khan of the Mongol Empire',
        picture: './assets/img/genghiskhan.png',
        svg: './assets/avatarSvg/genghisKhan.svg',
        selectSound: '',
        flag: './assets/flagsSvg/goldenhorde.svg',
        svgAttributesLarge: {
            svgWidth: '110%',
            svgHeight: 'auto',
            svgMarginLeft: '0px',
            svgMarginTop: '-60px',
        },
        svgAttributesSmall: {
            svgWidth: '260%',
            svgHeight: '120%',
            svgMarginLeft: '-80px',
            svgMarginTop: '0px',
        },
        svgAttributesXsmall: {
            svgWidth: '140%',
            svgHeight: '100%',
            svgMarginLeft: '-11px',
            svgMarginTop: '-19px',
        },
        biography: 'Genghis Khan, whose real name was Timujin, was a feared leader and general who conquered the largest land empire in history. He came from a simple background, being the leader of a small tribe, but he managed to unite all of the mongolian tribes and also completely reformed with ingenious tactics, thus granting him the title \'Genghis Khan\' which means \'Ruler of all\'. He then destroyed the nearby chinese Han Empire and much of the former persian empire and expanded as far away as into Europe.'
    },
    'Alexander the Great': {
        id: 'alexander',
        title: 'King of Macedonia',
        picture: './assets/img/alexander.png',
        selectSound: '',
        flag: './assets/flagsSvg/macedon.svg',
        svg: './assets/avatarSvg/alexander.svg',
        backgroundSvg: './assets/avatarBackgrounds/hellenic.svg',
        svgAttributesLarge: {
            svgWidth: '120%',
            svgHeight: '100%',
            svgMarginLeft: '-26px',
            svgMarginTop: '-161px',
        },
        svgAttributesSmall: {
            svgWidth: '190%',
            svgHeight: '160%',
            svgMarginLeft: '-36px',
            svgMarginTop: '-60px',
        },
        svgAttributesXsmall: {
            svgWidth: '130%',
            svgHeight: '100%',
            svgMarginLeft: '-12px',
            svgMarginTop: '-58px',
        },
        biography: 'Few men have shaped the world so much as Alexander the Great, he was a seemingly fearless warrior with ambitions and confidence out of this world. He expanded his small kingdom of Macedon into becoming one of the largest empires ever by completely defeating the superpower of his age, the Persian Empire. He personally led his companion cavalry in person and was near-mortally wounded at several occasions. He died of fever at the young of 32, having conquered two thirds of the known world and never having lost a single battle.'
    },
    'Hannibal Barca': {
        id: 'hannibal',
        title: 'General of Carthage',
        picture: './assets/img/hannibal_barca.png',
        svg: './assets/avatarSvg/hannibal.svg',
        selectSound: '',
        flag: './assets/flagsSvg/carthage.svg',
        svgAttributesLarge: {
            svgWidth: '120%',
            svgHeight: 'auto',
            svgMarginLeft: '-50px',
            svgMarginTop: '-60px',
        },
        svgAttributesSmall: {
            svgWidth: '260%',
            svgHeight: '140%',
            svgMarginLeft: '-70px',
            svgMarginTop: '0px',
        },
        svgAttributesXsmall: {
            svgWidth: '151%',
            svgHeight: '100%',
            svgMarginLeft: '-30px',
            svgMarginTop: '-25px',
        },
        biography: 'Hannibal Barca was a general of the mighty Carthaginian empire in North Africa. During his childhood Rome inflicted a heavy humiliating defeat upon Carthage, to which he swore an oath to never be a friend of the romans, words he lived by for the rest of his life. He led one of the most audacious campaigns in history by crossing the alps in midwinter and challenging the roman empire on their own turf. He won every single battle he fought in the italian peninsula and eventually crushed the romans last ditch all out attack at the legendary battle of Cannae. He is considered one of the best generals in history.'
    },
    'Attila the Hun': {
        id: 'attila',
        title: 'Scourge of God',
        picture: './assets/img/attila.png',
        svg: './assets/avatarSvg/attila.svg',
        selectSound: '',
        flag: './assets/flagsSvg/hunnicempire.svg',
        svgAttributesLarge: {
            svgWidth: '160%',
            svgHeight: 'auto',
            svgMarginLeft: '-109px',
            svgMarginTop: '-29px',
        },
        svgAttributesSmall: {
            svgWidth: '280%',
            svgHeight: '140%',
            svgMarginLeft: '-100px',
            svgMarginTop: '0px',
        },
        svgAttributesXsmall: {
            svgWidth: '181%',
            svgHeight: '100%',
            svgMarginLeft: '-44px',
            svgMarginTop: '-11px',
        },
        biography: 'During the later days of the Roman empire nomadic peoples, referred to as barbarians by the romans, terrorized and attacked everywhere along the vast borders of the empire. None of these barbarian leaders were as feared as Atilla the Hun. He was the leader of a tribal empire consisting of huns, ostrogoths and alans and he commanded a huge army of almost 100 000 men. He successfully plundered the Balkans and invaded the eastern roman empire and Italy.'
    },
    'Leonidas': {
        id: 'leonidas',
        title: 'King of Sparta',
        picture: './assets/img/leonidas.png',
        svg: './assets/avatarSvg/leonidas.svg',
        backgroundSvg: './assets/avatarBackgrounds/hellenic.svg',
        svgAttributesLarge: {
            svgWidth: '110%',
            svgHeight: 'auto',
            svgMarginLeft: '-13px',
            svgMarginTop: '-60px',
        },
        svgAttributesSmall: {
            svgWidth: '260%',
            svgHeight: '160%',
            svgMarginLeft: '-70px',
            svgMarginTop: '-20px',
        },
        svgAttributesXsmall: {
            svgWidth: '141%',
            svgHeight: '100%',
            svgMarginLeft: '-17px',
            svgMarginTop: '-25px',
        },
        selectSound: '',
        flag: './assets/flagsSvg/sparta.svg',
        biography: 'Leonidas was king of the renowned warrior citystate known as Sparta. He led a force of 300 spartans supported by 7 000 greek allies against a persian invasion force led by King Xerxes I whose army was at least 10 times bigger. Leonidas and his army successfully defended the mountain pass of Thermopylae for several crucial days despite the severe numerical disadvantage. After being surrounded Leonidas and the last of the men who had chosen to stay fought a valiant last stand, a moment that has been immortalized in both history and legend.'
    },
    /*
    'Scipio Africanus': {
        id: 'scipio',
        picture: './assets/img/scipio.png',
        selectSound: '',
        flag: './assets/flagsSvg/rome.svg',
        biography: 'Scipio Africanus was a highly successful roman general most known for his victories against the Carthaginians during the Second Punic War. His greatest achievement was at the battle of Zama where Scipio finally defeated Hannibal, the great enemy of Rome, in a decisive victory. He would later become a consul of the Roman Republic.'
    },
    'Miltiades': {
        id: 'miltiades',
        picture: './assets/img/miltiades.png',
        selectSound: '',
        flag: './assets/flagsSvg/athens.svg',
        biography: 'Miltiades was an Athenian citizen who was elected to serve as one of the greek generals at the legendary battles of Marathon, where a 10 000 strong greek force defeated a persian invading army of over 25 000. Miltiades have been credited with devising the tactics that defeated the persians in this crucial engagement that saved greek civilisation from persian rule.'
    },
    'Henry V': {
        id: 'henryv',
        picture: './assets/img/henryv.png',
        selectSound: '',
        flag: './assets/flagsSvg/oldEngland.svg',
        biography: 'Henry V was the king of England between 1413 - 1422, the second English monarch of the House of Lancaster. He embarked on a war with France in the ongoing Hundred Years War where he famously defeted the french, despite having a severe numerical disadvantage, at the battle of Agincourt. The battle has been romantized and the subject of songs and plays, most notably by William Shakespeare.'
    },
    'Charles XII': {
        id: 'charlesxii',
        picture: './assets/img/karlxii.png',
        selectSound: '',
        flag: './assets/flagsSvg/countries/se.svg',
        biography: 'Charles XII inherited the throne of the Swedish kingdom at the mere age of 15. At this time several of Swedens enemies declared war on them in an attempt to reconquer lands that had been previously conquered by Sweden. This ensured that the life of Charles XII would be almost exclusively paved with war. He is most famous for having defeated the Russians at the battle of Narva where his army of around 12 000 men defeated the russians tsars army of 37 000.'
    },
    'Saladin': {
        id: 'saladin',
        picture: './assets/img/saladin.png',
        selectSound: '',
        flag: './assets/flagsSvg/ayyubid.png',
        biography: 'Saladin who was of kurdish origin was the founder of the Ayyubid dynasty and the first sultan of Egypt and Syria. Under his command the Ayyubid army defeated the Crusaders at the decisive battle of Hattin, which became a turning point for conflicts between muslim and christan armies in the region during that time. He reconquered Jerusalem which had been captured by Crusader knights about a century before.'
    },
    'William the Conqueror': {
        id: 'williamconqueror',
        picture: './assets/img/william.png',
        selectSound: '',
        flag: './assets/flagsSvg/normandy.svg',
        biography: 'William the Conquerer, who has viking ancestry, was a duke of Normandy who would later invade England become the first Norman king of England. In a contest for the English throne he would find himself against the English earl Harold Godwinson. The deisive victory was acheived at the famous battle of Hastings where Harold was killed.'
    },
    'Gustavus Adolphus': {
        id: 'gustavusadolphus',
        picture: './assets/img/gustavusadolphus.png',
        selectSound: '',
        flag: './assets/flagsSvg/countries/se.svg',
        biography: 'Gustavus Adolphus is the only Swedish monarch to be styled as \'the great\'. He is also often referred to the as the \'father of modern warfare\' because of his reforms to the swedish military. He changed the swedish army from relying on conscription and mercenaries into a highly trained professional standing national army. He also innovated the strategies used, like employing smaller and more mobile artillery pieces that could be redirected during a battle, and combining pikemen with musketeers in a single formation. His most famous victory was at the battle of Breitenfeld, as a part of the 30 year war, where he decisively defeated the Catholic league.'
    },
    'Duke of Wellington': {
        id: 'dukeofwellington',
        picture: './assets/img/dukeofwellington.png',
        selectSound: '',
        flag: './assets/flagsSvg/countries/gb.svg',
        biography: ''
    },
    'Hernán Cortés': {
        id: 'hernancortes',
        picture: './assets/img/hernancortes.png',
        selectSound: '',
        flag: './assets/flagsSvg/spanishEmpire.svg',
        biography: 'Hernán Cortés was one of the most successful and ruthless of the Spanish conquistadors who fought native americans in the new world. He led an expedition with just a few hundred spaniards accompanied by a few thousands native allies and completely destroyed the Aztec empire after a decisive victory at the battle of Otumba. He later seized the Aztec capital of Tenochtitlan and renamed it to Mexico City, which he became governor of.'
    },
    'Shaka Zulu': {
        id: 'shakazulu',
        picture: './assets/img/shakazulu.png',
        selectSound: '',
        flag: './assets/flagsSvg/zulu.svg',
        biography: 'Shaka was one of the most influential monarchs of the Zulu kingdom, located in modern day South Africa. The Zulus went from being a minor tribe among many, perhaps just around 1500 people, to becoming a vast empire that was inhabited by several hundreds of thousands. One of the main reasons for this expansion was the military and tactical reforms that Shaka implemented which allowed him to conquer his rival tribes.'
    },
    'Erich Ludendorff': {
        id: 'ludendorff',
        picture: './assets/img/ludendorff.png',
        selectSound: '',
        flag: './assets/flagsSvg/germanEmpire.svg'
    },
    'Bernard Montgomery': {
        id: 'montgomery',
        picture: './assets/img/montgomery.png',
        selectSound: '',
        flag: './assets/flagsSvg/countries/gb.svg'
    },
    'George Patton': {
        id: 'patton',
        picture: './assets/img/georgepatton.png',
        selectSound: '',
        flag: './assets/flagsSvg/countries/us.svg'
    },
    'Jeanne d\'Arc': {
        id: 'jeannedarc',
        picture: './assets/img/jeannedarc.png',
        pronounciation: 'Shann Darc',
        selectSound: '',
        flag: './assets/flagsSvg/oldFrance.svg'
    },
    'Boudicca': {
        id: 'boudicca',
        picture: './assets/img/boudicca.png',
        selectSound: '',
        flag: './assets/flagsSvg/iceni.svg'
    }*/
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
    let turnNumber = 1;

    return {
        next: () => {
            // New turn phase
            if ((currentTurnPhaseIndex + 1) < turnPhases.length) {
                const turn = turnPhases[currentTurnPhaseIndex++];
                const player = playerMap[currentPlayerIndex];
                newPlayer = false;
                return {
                    player: player[1],
                    turnPhase: turn,
                    done: false,
                    newPlayer,
                    turnNumber
                };
            } else {
                let turnNumberWasIncremented = false;
                // New player turn
                if ((currentPlayerIndex + 1) < (playerMap.length)) {
                    currentPlayerIndex++;
                } else {
                    currentPlayerIndex = 0;
                    // All players have played this turn, increment the turn number
                    turnNumber++;
                    turnNumberWasIncremented = true;
                }

                currentTurnPhaseIndex = 0;
                const turn = turnPhases[currentTurnPhaseIndex];
                const player = playerMap[currentPlayerIndex];
                newPlayer = true;

                // Skip dead players
                while (playerMap[currentPlayerIndex][1].dead) {
                    if ((currentPlayerIndex + 1) < (playerMap.length)) {
                        currentPlayerIndex++;
                    } else {
                        currentPlayerIndex = 0;
                        if (!turnNumberWasIncremented) {
                            turnNumber++;
                        }
                    }
                }

                return {
                    player: player[1],
                    turnPhase: turn,
                    done: false,
                    newPlayer,
                    turnNumber
                };
            }
        },
        getCurrent: () => {
            return {
                player: playerMap[currentPlayerIndex][1],
                turnPhase: turnPhases[currentTurnPhaseIndex],
                done: false,
                newPlayer,
                turnNumber
            };
        },
        handleDefeatedPlayer: defeatedPlayer => {
            const player = playerMap.map(x => x[1]).find(x => x.name === defeatedPlayer);
            if (player) {
                player.dead = true;
            }
        },
        updatePlayerType: (playerName, type) => {
            const player = playerMap.map(x => x[1]).find(x => x.name === playerName);
            if (player) {
                player.type = type;
            }
        }
    };
};

module.exports = {
    PLAYER_COLORS,
    playerIterator,
    avatars,
    PLAYER_TYPES,
    AI_VALUES
};
