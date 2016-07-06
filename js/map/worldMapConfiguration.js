export let worldMap = {
    "regions": [{
        "name": "Africa",
        "bonusTroops": 3,
        "territories": [{
            "name": "North Africa",
            "adjacentTerritories": [
                "Western Europe",
                "Southern Europe",
                "Egypt",
                "East Africa",
                "Congo",
                "Brazil"
            ]
        }, {
            "name": "Egypt",
            "adjacentTerritories": [
                "Southern Europe",
                "East Africa",
                "North Africa",
                "Middle East"
            ]
        }, {
            "name": "East Africa",
            "adjacentTerritories": [
                "Madagascar",
                "Congo",
                "North Africa",
                "Egypt",
                "Middle East"
            ]
        }, {
            "name": "Congo",
            "adjacentTerritories": [
                "South Africa",
                "East Africa",
                "North Africa"
            ]
        }, {
            "name": "South Africa",
            "adjacentTerritories": [
                "Madagascar",
                "East Africa",
                "Congo"
            ]
        }, {
            "name": "Madagascar",
            "adjacentTerritories": [
                "South Africa",
                "East Africa"
            ]
        }]
    }, {
        "name": "South America",
        "bonusTroops": 2,
        "territories": [{
            "name": "Venezuela",
            "adjacentTerritories": [
                "Central America",
                "Brazil",
                "Peru"
            ]
        }, {
            "name": "Brazil",
            "adjacentTerritories": [
                "Venezuela",
                "Peru",
                "Argentina",
                "North Africa"
            ]
        }, {
            "name": "Peru",
            "adjacentTerritories": [
                "Venezuela",
                "Brazil",
                "Argentina"
            ]
        }, {
            "name": "Argentina",
            "adjacentTerritories": [
                "Peru",
                "Brazil"
            ]
        }]
    }, {
        "name": "Europe",
        "bonusTroops": 5,
        "territories": [{
            "name": "Iceland",
            "adjacentTerritories": [
                "Greenland",
                "Great Britain",
                "Scandinavia"
            ]
        }, {
            "name": "Great Britain",
            "adjacentTerritories": [
                "Western Europe",
                "Northern Europe",
                "Scandinavia",
                "Iceland"
            ]
        }, {
            "name": "Scandinavia",
            "adjacentTerritories": [
                "Iceland",
                "Northern Europe",
                "Great Britain",
                "Ukraine"
            ]
        }, {
            "name": "Western Europe",
            "adjacentTerritories": [
                "North Africa",
                "Southern Europe",
                "Northern Europe",
                "Great Britain"
            ]
        }, {
            "name": "Northern Europe",
            "adjacentTerritories": [
                "Western Europe",
                "Southern Europe",
                "Great Britain",
                "Ukraine",
                "Scandinavia"
            ]
        }, {
            "name": "Southern Europe",
            "adjacentTerritories": [
                "Egypt",
                "North Africa",
                "Ukraine",
                "Northern Europe",
                "Western Europe",
                "Middle East"
            ]
        }, {
            "name": "Ukraine",
            "adjacentTerritories": [
                "Scandinavia",
                "Northern Europe",
                "Southern Europe",
                "Middle East",
                "Ural",
                "Afghanistan"
            ]
        }]
    }, {
        "name": "North America",
        "bonusTroops": 5,
        "territories": [{
            "name": "Greenland",
            "adjacentTerritories": [
                "Iceland",
                "Northwest Territory",
                "Ontario",
                "Quebec"
            ]
        }, {
            "name": "Northwest Territory",
            "adjacentTerritories": [
                "Greenland",
                "Ontario",
                "Alaska",
                "Alberta"
            ]
        }, {
            "name": "Alaska",
            "adjacentTerritories": [
                "Kamchatka",
                "Northwest Territory",
                "Alberta"
            ]
        }, {
            "name": "Alberta",
            "adjacentTerritories": [
                "Alaska",
                "Northwest Territory",
                "Ontario",
                "Western United States"
            ]
        }, {
            "name": "Ontario",
            "adjacentTerritories": [
                "Greenland",
                "Northwest Territory",
                "Alberta",
                "Western United States",
                "Eastern United States",
                "Quebec"
            ]
        }, {
            "name": "Quebec",
            "adjacentTerritories": [
                "Greenland",
                "Northwest Territory",
                "Ontario",
                "Eastern United States"
            ]
        }, {
            "name": "Western United States",
            "adjacentTerritories": [
                "Alberta",
                "Ontario",
                "Central America",
                "Eastern United States"
            ]
        }, {
            "name": "Eastern United States",
            "adjacentTerritories": [
                "Quebec",
                "Ontario",
                "Alberta",
                "Western United States",
                "Central America"
            ]
        }, {
            "name": "Central America",
            "adjacentTerritories": [
                "Western United States",
                "Eastern United States",
                "Venezuela"
            ]
        }]
    }, {
        "name": "Asia",
        "bonusTroops": 7,
        "territories": [{
            "name": "Afghanistan",
            "adjacentTerritories": [
                "Ural",
                "Ukraine",
                "China",
                "India",
                "Middle East"
            ]
        }, {
            "name": "China",
            "adjacentTerritories": [
                "Mongolia",
                "Siberia",
                "Ural",
                "Afghanistan",
                "India",
                "Siam"
            ]
        }, {
            "name": "India",
            "adjacentTerritories": [
                "Middle East",
                "Afghanistan",
                "China",
                "Siam"
            ]
        }, {
            "name": "Irkutsk",
            "adjacentTerritories": [
                "Kamchatka",
                "Mongolia",
                "Siberia",
                "Yakutsk"
            ]
        }, {
            "name": "Japan",
            "adjacentTerritories": [
                "Kamchatka",
                "Mongolia"
            ]
        }, {
            "name": "Kamchatka",
            "adjacentTerritories": [
                "Alaska",
                "Yakutsk",
                "Irkutsk",
                "Mongolia",
                "Japan"
            ]
        }, {
            "name": "Middle East",
            "adjacentTerritories": [
                "Egypt",
                "East Africa",
                "Southern Europe",
                "Ukraine",
                "Afghanistan",
                "India"
            ]
        }, {
            "name": "Mongolia",
            "adjacentTerritories": [
                "Japan",
                "China",
                "Siberia",
                "Irkutsk",
                "Kamchatka"
            ]
        }, {
            "name": "Siam",
            "adjacentTerritories": [
                "China",
                "India",
                "Indonesia"
            ]
        }, {
            "name": "Siberia",
            "adjacentTerritories": [
                "Ural",
                "China",
                "Mongolia",
                "Irkutsk",
                "Yakutsk"
            ]
        }, {
            "name": "Ural",
            "adjacentTerritories": [
                "Ukraine",
                "Afghanistan",
                "China",
                "Siberia"
            ]
        }, {
            "name": "Yakutsk",
            "adjacentTerritories": [
                "Siberia",
                "Irkutsk",
                "Kamchatka"
            ]
        }]
    }, {
        "name": "Australia",
        "bonusTroops": 2,
        "territories": [{
            "name": "Eastern Australia",
            "adjacentTerritories": [
                "Western Australia",
                "New Guinea"
            ]
        }, {
            "name": "Indonesia",
            "adjacentTerritories": [
                "Siam",
                "New Guinea",
                "Western Australia"
            ]
        }, {
            "name": "New Guinea",
            "adjacentTerritories": [
                "Eastern Australia",
                "Western Australia",
                "Indonesia"
            ]
        }, {
            "name": "Western Australia",
            "adjacentTerritories": [
                "Eastern Australia",
                "New Guinea",
                "Indonesia"
            ]
        }]
    }]
}