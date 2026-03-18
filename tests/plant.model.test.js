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
      type: 'vegetable',
      cultivation: 'outdoor',
      planting_date: '2024-03-01',
      notes: 'Cherry tomatoes'
    });
    expect(plant.name).toBe('Tomato');
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

  // --- Expanded plant type tests ---

  test('getReminders includes prune for fruit plants', () => {
    plantModel.addPlant({ name: 'Apple', type: 'fruit', cultivation: 'outdoor', planting_date: '2024-03-01', notes: '' });
    const types = plantModel.getReminders().map(r => r.type);
    expect(types).toContain('prune');
  });

  test('getReminders includes prune for tree plants with 60-day frequency', () => {
    plantModel.addPlant({ name: 'Oak', type: 'tree', cultivation: 'outdoor', planting_date: '2024-03-01', notes: '' });
    const reminders = plantModel.getReminders();
    const pruneReminder = reminders.find(r => r.type === 'prune');
    expect(pruneReminder).toBeDefined();
    expect(pruneReminder.frequency).toBe(60);
  });

  test('getReminders includes prune for shrub plants with 45-day frequency', () => {
    plantModel.addPlant({ name: 'Hydrangea', type: 'shrub', cultivation: 'outdoor', planting_date: '2024-03-01', notes: '' });
    const reminders = plantModel.getReminders();
    const pruneReminder = reminders.find(r => r.type === 'prune');
    expect(pruneReminder).toBeDefined();
    expect(pruneReminder.frequency).toBe(45);
  });

  test('getReminders does not include weed for herb plants even when outdoor', () => {
    plantModel.addPlant({ name: 'Rosemary', type: 'herb', cultivation: 'outdoor', planting_date: '2024-03-01', notes: '' });
    const types = plantModel.getReminders().map(r => r.type);
    expect(types).not.toContain('weed');
  });

  test('getReminders includes weed for grass plants outdoor', () => {
    plantModel.addPlant({ name: 'Lawn', type: 'grass', cultivation: 'outdoor', planting_date: '2024-03-01', notes: '' });
    const types = plantModel.getReminders().map(r => r.type);
    expect(types).toContain('weed');
  });

  test('getReminders uses longer watering interval for succulent plants', () => {
    plantModel.addPlant({ name: 'Aloe', type: 'succulent', cultivation: 'outdoor', planting_date: '2024-03-01', notes: '' });
    const reminders = plantModel.getReminders();
    const waterReminder = reminders.find(r => r.type === 'water');
    // outdoor base = 2, succulent modifier = +5 → frequency = 7
    expect(waterReminder.frequency).toBe(7);
  });

  test('addPlant accepts all expanded plant types', () => {
    const types = ['vegetable', 'fruit', 'flower', 'herb', 'tree', 'shrub', 'grass', 'fern', 'succulent', 'cactus', 'bulb', 'climber', 'other'];
    types.forEach(type => {
      const plant = plantModel.addPlant({ name: `Test ${type}`, type, cultivation: 'outdoor', planting_date: '2024-03-01', notes: '' });
      expect(plant.type).toBe(type);
    });
    expect(plantModel.getAllPlants().length).toBe(types.length);
  });
});
