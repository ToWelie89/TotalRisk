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
    }]
}