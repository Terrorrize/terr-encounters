export const RUIN_MODIFIERS = ["none", "faint traces", "light ruins", "exposed remnants"];

export const RUIN_FREQUENCY_WEIGHTS = {
    faint: {
        none: 70,
        "faint traces": 20,
        "light ruins": 8,
        "exposed remnants": 2
    },
    light: {
        none: 45,
        "faint traces": 28,
        "light ruins": 20,
        "exposed remnants": 7
    },
    mixed: {
        none: 35,
        "faint traces": 30,
        "light ruins": 23,
        "exposed remnants": 12
    }
};

export const RUIN_FAMILIES = {
    "English / Northern Stone Keep": [
        "low mossed wall lines",
        "squared stone blocks",
        "collapsed tower stumps",
        "shattered gatehouse remains"
    ],
    "Mayan / Tropical Coastal Stone Town": [
        "carved stone fragments",
        "broken plaza edges",
        "fallen cut blocks",
        "vine-covered platforms"
    ],
    "Roman / Imperial Fortified Works": [
        "straight foundation lines",
        "dressed stone courses",
        "broken arches",
        "roadbed fragments"
    ],
    "Desert Mudbrick / Adobe Settlement": [
        "melted wall mounds",
        "low room outlines",
        "collapsed courtyards",
        "eroded parapet lines"
    ],
    "Norse / Timber / Turf Settlement": [
        "stone footings",
        "sunken wall lines",
        "charcoal-dark post remains",
        "turf mounds"
    ],
    "Steppe / Nomad Camp Remnants": [
        "fire-blackened stone rings",
        "post pits",
        "wagon-rut traces",
        "collapsed earthworks"
    ],
    "Jungle Temple Complex": [
        "half-buried cut stone",
        "root-split stairways",
        "vine-choked terraces",
        "broken causeway traces"
    ],
    "Coastal Fishing Village / Stilt Settlement": [
        "rotted pilings",
        "collapsed dock lines",
        "drowned walkway posts",
        "tide-worn retaining stones"
    ],
    "Dwarven / Mountain-Cut Masonry": [
        "fitted blockwork",
        "collapsed arch tunnels",
        "carved stairs",
        "rune-cut fragments"
    ],
    "Ancient Earthen Hillfort / Tribal Enclosure": [
        "low embankments",
        "ditch rings",
        "palisade post lines",
        "broken ritual stones"
    ]
};

export const BIOME_DEFAULT_RUIN_FAMILIES = {
    "Forest": [
        "English / Northern Stone Keep",
        "Ancient Earthen Hillfort / Tribal Enclosure",
        "Jungle Temple Complex",
        "Dwarven / Mountain-Cut Masonry"
    ],
    "Plains": [
        "Ancient Earthen Hillfort / Tribal Enclosure",
        "Roman / Imperial Fortified Works",
        "Steppe / Nomad Camp Remnants",
        "Desert Mudbrick / Adobe Settlement"
    ],
    "Hills": [
        "English / Northern Stone Keep",
        "Ancient Earthen Hillfort / Tribal Enclosure",
        "Dwarven / Mountain-Cut Masonry",
        "Roman / Imperial Fortified Works"
    ],
    "Mountains": [
        "Dwarven / Mountain-Cut Masonry",
        "English / Northern Stone Keep",
        "Roman / Imperial Fortified Works",
        "Jungle Temple Complex"
    ],
    "Desert": [
        "Desert Mudbrick / Adobe Settlement",
        "Roman / Imperial Fortified Works",
        "Steppe / Nomad Camp Remnants",
        "English / Northern Stone Keep"
    ],
    "Tundra": [
        "Norse / Timber / Turf Settlement",
        "Ancient Earthen Hillfort / Tribal Enclosure",
        "Steppe / Nomad Camp Remnants",
        "Coastal Fishing Village / Stilt Settlement"
    ],
    "Urban Fringe": [
        "English / Northern Stone Keep",
        "Roman / Imperial Fortified Works",
        "Desert Mudbrick / Adobe Settlement",
        "Ancient Earthen Hillfort / Tribal Enclosure"
    ],
    "Temperate Coast": [
        "Coastal Fishing Village / Stilt Settlement",
        "English / Northern Stone Keep",
        "Roman / Imperial Fortified Works",
        "Ancient Earthen Hillfort / Tribal Enclosure"
    ],
    "Tropical Coast": [
        "Mayan / Tropical Coastal Stone Town",
        "Coastal Fishing Village / Stilt Settlement",
        "Roman / Imperial Fortified Works",
        "English / Northern Stone Keep"
    ],
    "Temperate Swamp": [
        "Coastal Fishing Village / Stilt Settlement",
        "Ancient Earthen Hillfort / Tribal Enclosure",
        "Roman / Imperial Fortified Works",
        "Jungle Temple Complex"
    ],
    "Tropical Swamp": [
        "Jungle Temple Complex",
        "Coastal Fishing Village / Stilt Settlement",
        "Mayan / Tropical Coastal Stone Town",
        "Roman / Imperial Fortified Works"
    ]
};
