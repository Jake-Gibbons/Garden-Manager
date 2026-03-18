/**
 * Plant type reference data used throughout Garden Manager.
 *
 * Each entry describes a plant category, its typical care requirements
 * (used by the reminder engine), and a short description drawn from the
 * same biological context as the GBIF classification system.
 */

const PLANT_TYPES = {
  vegetable: {
    label: 'Vegetable',
    description:
      'Edible herbaceous plants grown for their leaves, stems, roots, or seeds. ' +
      'Examples: tomato, carrot, lettuce, pepper, cucumber.',
    waterFreqModifier: 0,   // days added / removed from base cultivation frequency
    prune: true,
    weedSensitive: true,
  },
  fruit: {
    label: 'Fruit',
    description:
      'Plants cultivated for their edible fruits or berries. ' +
      'Includes both woody (apple, pear) and cane/vine (strawberry, grape) varieties.',
    waterFreqModifier: 0,
    prune: true,
    weedSensitive: true,
  },
  flower: {
    label: 'Flower',
    description:
      'Ornamental or cut-flower plants prized for their blooms. ' +
      'Examples: rose, tulip, dahlia, sunflower, lavender.',
    waterFreqModifier: 0,
    prune: true,
    weedSensitive: true,
  },
  herb: {
    label: 'Herb',
    description:
      'Aromatic or culinary plants typically grown for their leaves or seeds. ' +
      'Examples: basil, mint, rosemary, thyme, parsley.',
    waterFreqModifier: 0,
    prune: false,
    weedSensitive: false,
  },
  tree: {
    label: 'Tree',
    description:
      'Woody perennial plants with a single main stem (trunk) that generally ' +
      'live for many years. Examples: oak, maple, apple tree, cherry tree.',
    waterFreqModifier: 1,   // trees need watering slightly less often than average
    prune: true,
    pruneFreq: 60,          // prune every 60 days instead of default 30
    weedSensitive: false,
  },
  shrub: {
    label: 'Shrub',
    description:
      'Woody perennial plants with multiple stems arising from the base. ' +
      'Examples: hydrangea, boxwood, forsythia, blueberry bush.',
    waterFreqModifier: 1,
    prune: true,
    pruneFreq: 45,
    weedSensitive: false,
  },
  grass: {
    label: 'Grass / Lawn',
    description:
      'Grasses and grass-like plants including lawn turf and ornamental grasses. ' +
      'Examples: Kentucky bluegrass, fescue, bamboo, pampas grass.',
    waterFreqModifier: -1,  // lawns typically need more frequent watering
    prune: false,
    weedSensitive: true,
  },
  fern: {
    label: 'Fern',
    description:
      'Vascular non-flowering plants that reproduce via spores. ' +
      'Examples: Boston fern, maidenhair fern, bird\'s nest fern.',
    waterFreqModifier: -1,  // ferns prefer moist conditions
    prune: false,
    weedSensitive: false,
  },
  succulent: {
    label: 'Succulent',
    description:
      'Drought-tolerant plants with thick, fleshy tissue for water storage. ' +
      'Examples: aloe vera, echeveria, jade plant, agave.',
    waterFreqModifier: 5,   // succulents need much less frequent watering
    prune: false,
    weedSensitive: false,
  },
  cactus: {
    label: 'Cactus',
    description:
      'Members of the family Cactaceae — highly drought-adapted plants with ' +
      'specialised areoles and spines. Examples: saguaro, prickly pear, barrel cactus.',
    waterFreqModifier: 10,  // cacti need the least frequent watering
    prune: false,
    weedSensitive: false,
  },
  bulb: {
    label: 'Bulb / Tuber',
    description:
      'Plants that grow from underground storage organs (bulbs, corms, rhizomes, ' +
      'or tubers). Examples: tulip, daffodil, dahlia, potato, iris.',
    waterFreqModifier: 0,
    prune: false,
    weedSensitive: true,
  },
  climber: {
    label: 'Climber / Vine',
    description:
      'Plants that climb or trail using tendrils, twining stems, or aerial roots. ' +
      'Examples: wisteria, clematis, sweet pea, ivy, passionflower.',
    waterFreqModifier: 0,
    prune: true,
    weedSensitive: false,
  },
  other: {
    label: 'Other',
    description: 'Any plant that does not fit neatly into the above categories.',
    waterFreqModifier: 0,
    prune: false,
    weedSensitive: false,
  },
};

/** Returns an array of { value, label } objects for use in HTML <select> elements. */
function getPlantTypeOptions() {
  return Object.entries(PLANT_TYPES).map(([value, meta]) => ({
    value,
    label: meta.label,
  }));
}

module.exports = { PLANT_TYPES, getPlantTypeOptions };
