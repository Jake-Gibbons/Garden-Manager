const { plantDatabase } = require('./plantDatabase');

const plantCatalog = plantDatabase.map((plant) => ({
  id: plant.id,
  commonName: plant.commonName,
  scientificName: plant.scientificName,
  type: plant.type,
  genus: plant.genus,
  family: plant.family,
  sunlightPreference: plant.sunlightPreference,
  soilType: plant.soilType,
  commonPestsDiseases: plant.commonPestsDiseases,
  toxicity: plant.toxicity
}));

module.exports = { plantCatalog };