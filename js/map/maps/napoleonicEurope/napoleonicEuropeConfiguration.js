const napoleonicEuropeMap = {
    regions: [
    {
        name: 'United Kingdom',
        bonusTroops: 1,
        color: {
            mainColor: '#b40606',
            borderColor: '#680808'
        },
        territories: [{
            name: 'Ireland',
            adjacentTerritories: [
                'Scotland',
                'Northern England'
            ]
        }, {
            name: 'Scotland',
            adjacentTerritories: [
                'Ireland',
                'Northern England'
            ]
        }, {
            name: 'Northern England',
            adjacentTerritories: [
                'Southern England',
                'Norway',
                'Scotland',
                'Ireland'
            ]
        }, {
            name: 'Southern England',
            adjacentTerritories: [
                'Northern England',
                'Brittany & Normandy',
                'Nord & Picardy'
            ]
        }]
    }, {
        name: 'French Empire',
        bonusTroops: 3,
        color: {
            mainColor: '#5dbde6',
            borderColor: '#287798'
        },
        territories: [{
            name: 'Brittany & Normandy',
            adjacentTerritories: [
                'Southern England',
                'Nord & Picardy',
                'Île-de-France',
                'Aquitaine'
            ]
        }, {
            name: 'Nord & Picardy',
            adjacentTerritories: [
                'Southern England',
                'Brittany & Normandy',
                'Île-de-France',
                'Burgundy & Lorraine',
                'Belgium'
            ]
        }, {
            name: 'Île-de-France',
            adjacentTerritories: [
                'Brittany & Normandy',
                'Aquitaine',
                'Languedoc',
                'Burgundy & Lorraine',
                'Nord & Picardy'
            ]
        }, {
            name: 'Burgundy & Lorraine',
            adjacentTerritories: [
                'Nord & Picardy',
                'Île-de-France',
                'Languedoc',
                'Lombardy, Piedmont & Tuscany',
                'Switzerland',
                'Westphalia & Wurttembürg',
                'Belgium'
            ]
        }, {
            name: 'Aquitaine',
            adjacentTerritories: [
                'Brittany & Normandy',
                'Île-de-France',
                'Languedoc',
                'Aragon & Castile'
            ]
        }, {
            name: 'Languedoc',
            adjacentTerritories: [
                'Aquitaine',
                'Île-de-France',
                'Burgundy & Lorraine',
                'Lombardy, Piedmont & Tuscany',
                'Aragon & Castile',
                'Corsica'
            ]
        }]
    }, {
        name: 'Iberian Peninsula',
        bonusTroops: 1,
        color: {
            mainColor: '#c6c12f',
            borderColor: '#918d06'
        },
        territories: [{
            name: 'Aragon & Castile',
            adjacentTerritories: [
                'Aquitaine',
                'Languedoc',
                'Galicia & León',
                'Andalusia'
            ]
        }, {
            name: 'Andalusia',
            adjacentTerritories: [
                'Aragon & Castile',
                'Galicia & León',
                'Portugal',
                'North Africa'
            ]
        }, {
            name: 'Galicia & León',
            adjacentTerritories: [
                'Portugal',
                'Andalusia',
                'Aragon & Castile'
            ]
        }, {
            name: 'Portugal',
            adjacentTerritories: [
                'Galicia & León',
                'Andalusia'
            ]
        }]
    }, {
        name: 'Africa',
        bonusTroops: 1,
        color: {
            mainColor: '#ffc59a',
            borderColor: '#fc872e'
        },
        territories: [{
            name: 'North Africa',
            adjacentTerritories: [
                'Andalusia',
                'Sardinia'
            ]
        }, {
            name: 'Sardinia',
            adjacentTerritories: [
                'North Africa',
                'Corsica'
            ]
        }, {
            name: 'Corsica',
            adjacentTerritories: [
                'Sardinia',
                'Languedoc',
                'Lombardy, Piedmont & Tuscany'
            ]
        }]
    }, {
        name: 'Italian Protectorates',
        bonusTroops: 1,
        color: {
            mainColor: '#29aa4e',
            borderColor: '#067726'
        },
        territories: [{
            name: 'Lombardy, Piedmont & Tuscany',
            adjacentTerritories: [
                'Languedoc',
                'Burgundy & Lorraine',
                'Switzerland',
                'Venetia',
                'The Papal States',
                'Corsica'
            ]
        }, {
            name: 'Venetia',
            adjacentTerritories: [
                'Lombardy, Piedmont & Tuscany',
                'Switzerland',
                'Tyrol',
                'The Illyrian Provinces',
                'The Papal States'
            ]
        }, {
            name: 'The Papal States',
            adjacentTerritories: [
                'Lombardy, Piedmont & Tuscany',
                'Venetia',
                'The Two Sicilies'
            ]
        }, {
            name: 'The Two Sicilies',
            adjacentTerritories: [
                'The Papal States',
                'Greece'
            ]
        }]
    }, {
        name: 'Rhine and Helvetic Confederations',
        bonusTroops: 4,
        color: {
            mainColor: '#483ca5',
            borderColor: '#1d1461'
        },
        territories: [{
            name: 'Belgium',
            adjacentTerritories: [
                'Nord & Picardy',
                'Burgundy & Lorraine',
                'Westphalia & Wurttembürg',
                'Holland'
            ]
        }, {
            name: 'Holland',
            adjacentTerritories: [
                'Belgium',
                'Westphalia & Wurttembürg',
                'Hanover'
            ]
        }, {
            name: 'Hanover',
            adjacentTerritories: [
                'Holland',
                'Westphalia & Wurttembürg',
                'Brandenburg',
                'Denmark'
            ]
        }, {
            name: 'Westphalia & Wurttembürg',
            adjacentTerritories: [
                'Hanover',
                'Holland',
                'Belgium',
                'Burgundy & Lorraine',
                'Switzerland',
                'Bavaria',
                'Saxony',
                'Brandenburg'
            ]
        }, {
            name: 'Switzerland',
            adjacentTerritories: [
                'Westphalia & Wurttembürg',
                'Burgundy & Lorraine',
                'Lombardy, Piedmont & Tuscany',
                'Venetia',
                'Tyrol',
                'Westphalia & Wurttembürg',
                'Bavaria'
            ]
        }, {
            name: 'Bavaria',
            adjacentTerritories: [
                'Westphalia & Wurttembürg',
                'Switzerland',
                'Tyrol',
                'Austria',
                'Bohemia & Moravia',
                'Saxony',
            ]
        }, {
            name: 'Saxony',
            adjacentTerritories: [
                'Brandenburg',
                'Westphalia & Wurttembürg',
                'Bavaria',
                'Bohemia & Moravia',
                'Silesia',
                'Pomerania'
            ]
        }]
    }, {
        name: 'Kingdom of Prussia',
        bonusTroops: 3,
        color: {
            mainColor: '#dac827',
            borderColor: '#6f6402'
        },
        territories: [{
            name: 'Brandenburg',
            adjacentTerritories: [
                'Denmark',
                'Hanover',
                'Westphalia & Wurttembürg',
                'Saxony',
                'Pomerania'
            ]
        }, {
            name: 'Pomerania',
            adjacentTerritories: [
                'Brandenburg',
                'Saxony',
                'Silesia',
                'Warsaw',
                'East Prussia'
            ]
        }, {
            name: 'Silesia',
            adjacentTerritories: [
                'Pomerania',
                'Saxony',
                'Bohemia & Moravia',
                'Galich',
                'Warsaw'
            ]
        }, {
            name: 'Warsaw',
            adjacentTerritories: [
                'Pomerania',
                'Silesia',
                'Galich',
                'East Prussia'
            ]
        }, {
            name: 'East Prussia',
            adjacentTerritories: [
                'Pomerania',
                'Warsaw',
                'Galich',
                'Lithuania'
            ]
        }]
    }, {
        name: 'Austrian Empire',
        bonusTroops: 5,
        color: {
            mainColor: '#bababa',
            borderColor: '#464646'
        },
        territories: [{
            name: 'Tyrol',
            adjacentTerritories: [
                'Bavaria',
                'Switzerland',
                'Venetia',
                'The Illyrian Provinces',
                'Austria'
            ]
        }, {
            name: 'The Illyrian Provinces',
            adjacentTerritories: [
                'Venetia',
                'Tyrol',
                'Austria',
                'Hungary',
                'Bosnia',
                'Albania'
            ]
        }, {
            name: 'Austria',
            adjacentTerritories: [
                'Bohemia & Moravia',
                'Bavaria',
                'Tyrol',
                'The Illyrian Provinces',
                'Hungary'
            ]
        }, {
            name: 'Hungary',
            adjacentTerritories: [
                'Galich',
                'Bohemia & Moravia',
                'Austria',
                'The Illyrian Provinces',
                'Bosnia',
                'Serbia',
                'Transylvania'
            ]
        }, {
            name: 'Transylvania',
            adjacentTerritories: [
                'Hungary',
                'Serbia',
                'Wallachia',
                'Moldava',
                'Galich'
            ]
        }, {
            name: 'Galich',
            adjacentTerritories: [
                'East Prussia',
                'Warsaw',
                'Silesia',
                'Bohemia & Moravia',
                'Transylvania',
                'Moldava',
                'Hungary',
                'Crimea',
                'Lithuania'
            ]
        }, {
            name: 'Bohemia & Moravia',
            adjacentTerritories: [
                'Silesia',
                'Saxony',
                'Bavaria',
                'Austria',
                'Hungary',
                'Galich'
            ]
        }]
    }, {
        name: 'Ottoman Empire',
        bonusTroops: 1,
        color: {
            mainColor: '#906f68',
            borderColor: '#5c3b33'
        },
        territories: [{
            name: 'Bosnia',
            adjacentTerritories: [
                'Hungary',
                'The Illyrian Provinces',
                'Albania',
                'Serbia'
            ]
        }, {
            name: 'Albania',
            adjacentTerritories: [
                'The Illyrian Provinces',
                'Bosnia',
                'Serbia',
                'Greece'
            ]
        }, {
            name: 'Greece',
            adjacentTerritories: [
                'Albania',
                'Serbia',
                'Bulgaria',
                'The Two Sicilies'
            ]
        }, {
            name: 'Bulgaria',
            adjacentTerritories: [
                'Moldava',
                'Wallachia',
                'Serbia',
                'Greece',
                'Anatolia'
            ]
        }, {
            name: 'Wallachia',
            adjacentTerritories: [
                'Transylvania',
                'Serbia',
                'Bulgaria',
                'Moldava'
            ]
        }, {
            name: 'Moldava',
            adjacentTerritories: [
                'Crimea',
                'Galich',
                'Transylvania',
                'Wallachia',
                'Bulgaria'
            ]
        }, {
            name: 'Anatolia',
            adjacentTerritories: [
                'Bulgaria'
            ]
        }, {
            name: 'Serbia',
            adjacentTerritories: [
                'Transylvania',
                'Hungary',
                'Bosnia',
                'Albania',
                'Greece',
                'Bulgaria',
                'Wallachia'
            ]
        }]
    }, {
        name: 'Russian Empire',
        bonusTroops: 2,
        color: {
            mainColor: '#db82f3',
            borderColor: '#9736b1'
        },
        territories: [{
            name: 'Lithuania',
            adjacentTerritories: [
                'East Prussia',
                'Galich',
                'Crimea',
                'Poland',
                'Livonia'
            ]
        }, {
            name: 'Crimea',
            adjacentTerritories: [
                'Ukraine',
                'Poland',
                'Lithuania',
                'Galich',
                'Moldava'
            ]
        }, {
            name: 'Poland',
            adjacentTerritories: [
                'Livonia',
                'Lithuania',
                'Crimea',
                'Ukraine',
                'Russia',
                'Karelia'
            ]
        }, {
            name: 'Livonia',
            adjacentTerritories: [
                'Karelia',
                'Poland',
                'Lithuania'
            ]
        }, {
            name: 'Karelia',
            adjacentTerritories: [
                'Finland',
                'Livonia',
                'Poland',
                'Russia'
            ]
        }, {
            name: 'Russia',
            adjacentTerritories: [
                'Karelia',
                'Poland',
                'Ukraine'
            ]
        }, {
            name: 'Ukraine',
            adjacentTerritories: [
                'Russia',
                'Poland',
                'Crimea'
            ]
        }]
    }, {
        name: 'Kingdoms of Scandinavia',
        bonusTroops: 2,
        color: {
            mainColor: '#ff6e34',
            borderColor: '#912900'
        },
        territories: [{
            name: 'Norway',
            adjacentTerritories: [
                'Northern England',
                'Sweden'
            ]
        }, {
            name: 'Sweden',
            adjacentTerritories: [
                'Norway',
                'Denmark',
                'Finland'
            ]
        }, {
            name: 'Denmark',
            adjacentTerritories: [
                'Sweden',
                'Hanover',
                'Brandenburg'
            ]
        }, {
            name: 'Finland',
            adjacentTerritories: [
                'Sweden',
                'Karelia'
            ]
        }]
    }]
};

module.exports = { napoleonicEuropeMap };