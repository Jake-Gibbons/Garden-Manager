const { createDatabase } = require('../src/database');
const { createPlantModel } = require('../src/models/plant');

describe('Plant Model', () => {
  let db;
  let plantModel;

  beforeEach(() => {
    db = createDatabase(':memory:');
    plantModel = createPlantModel(db);
  });

  afterEach(() => {
    db.close();
  });

  test('getAllPlants returns empty array initially', () => {
    const plants = plantModel.getAllPlants();
    expect(plants).toEqual([]);
  });

  test('addPlant inserts a plant and returns it', () => {
    const plant = plantModel.addPlant({
      name: 'Tomato',
      common_name: 'Tomato',
      scientific_name: 'Solanum lycopersicum',
      genus: 'Solanum',
      family: 'Solanaceae',
      sunlight_preference: 'full',
      soil_type: 'Loamy',
      common_pests_diseases: 'Aphids',
      toxicity: 'Mildly toxic leaves',
      type: 'vegetable',
      cultivation: 'outdoor',
      planting_date: '2024-03-01',
      notes: 'Cherry tomatoes'
    });
    expect(plant.name).toBe('Tomato');
    expect(plant.common_name).toBe('Tomato');
    expect(plant.scientific_name).toBe('Solanum lycopersicum');
    expect(plant.sunlight_preference).toBe('full');
    expect(plant.type).toBe('vegetable');
    expect(plant.cultivation).toBe('outdoor');
  });

  test('getAllPlants returns all inserted plants', () => {
    plantModel.addPlant({ name: 'Rose', type: 'flower', cultivation: 'outdoor', planting_date: '2024-03-01', notes: '' });
    plantModel.addPlant({ name: 'Basil', type: 'herb', cultivation: 'indoor', planting_date: '2024-03-05', notes: '' });
    const plants = plantModel.getAllPlants();
    expect(plants.length).toBe(2);
  });

  test('getReminders returns reminders for plants', () => {
    plantModel.addPlant({ name: 'Rose', type: 'flower', cultivation: 'outdoor', planting_date: '2024-03-01', notes: '' });
    const reminders = plantModel.getReminders();
    expect(reminders.length).toBeGreaterThan(0);
    const types = reminders.map(r => r.type);
    expect(types).toContain('water');
    expect(types).toContain('feed');
    expect(types).toContain('weed');   // outdoor
    expect(types).toContain('prune');  // flower
  });

  test('getReminders does not include weed for indoor plants', () => {
    plantModel.addPlant({ name: 'Basil', type: 'herb', cultivation: 'indoor', planting_date: '2024-03-01', notes: '' });
    const reminders = plantModel.getReminders();
    const types = reminders.map(r => r.type);
    expect(types).not.toContain('weed');
  });

  test('getReminders does not include prune for herb plants', () => {
    plantModel.addPlant({ name: 'Basil', type: 'herb', cultivation: 'outdoor', planting_date: '2024-03-01', notes: '' });
    const reminders = plantModel.getReminders();
    const types = reminders.map(r => r.type);
    expect(types).not.toContain('prune');
  });

  test('deletePlant removes a plant', () => {
    const plant = plantModel.addPlant({ name: 'Weed', type: 'other', cultivation: 'outdoor', planting_date: '2024-03-01', notes: '' });
    plantModel.deletePlant(plant.id);
    const plants = plantModel.getAllPlants();
    expect(plants.find(p => p.id === plant.id)).toBeUndefined();
  });

  test('updatePlant updates care and safety details', () => {
    const plant = plantModel.addPlant({
      name: 'Lavender',
      type: 'flower',
      cultivation: 'outdoor',
      planting_date: '2024-03-01',
      notes: ''
    });

    const updated = plantModel.updatePlant(plant.id, {
      name: 'Front Porch Lavender',
      common_name: 'Lavender',
      scientific_name: 'Lavandula angustifolia',
      genus: 'Lavandula',
      family: 'Lamiaceae',
      sunlight_preference: 'full',
      soil_type: 'Sandy, well-draining',
      common_pests_diseases: 'Root rot',
      toxicity: 'Mildly toxic to pets',
      type: 'flower',
      cultivation: 'outdoor',
      planting_date: '2024-03-01',
      notes: 'Needs pruning in spring'
    });

    expect(updated.name).toBe('Front Porch Lavender');
    expect(updated.soil_type).toBe('Sandy, well-draining');
    expect(updated.common_pests_diseases).toContain('Root rot');
    expect(updated.toxicity).toContain('pets');
  });
});
