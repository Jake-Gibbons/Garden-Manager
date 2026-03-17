function createPlantModel(db) {
  function getAllPlants() {
    return db.prepare('SELECT * FROM plants ORDER BY created_at DESC').all();
  }

  function getPlantById(id) {
    return db.prepare('SELECT * FROM plants WHERE id = ?').get(id);
  }

  function addPlant({ name, type, cultivation, planting_date, notes }) {
    const stmt = db.prepare(
      'INSERT INTO plants (name, type, cultivation, planting_date, notes) VALUES (?, ?, ?, ?, ?)'
    );
    const result = stmt.run(name, type, cultivation, planting_date, notes);
    return getPlantById(result.lastInsertRowid);
  }

  function deletePlant(id) {
    db.prepare('DELETE FROM plants WHERE id = ?').run(id);
  }

  function getReminders() {
    const plants = getAllPlants();
    const reminders = [];

    plants.forEach(plant => {
      const waterFreq = { outdoor: 2, indoor: 3, greenhouse: 1 }[plant.cultivation] || 2;
      const dueDate = (freq) =>
        new Date(new Date(plant.planting_date).getTime() + freq * 24 * 60 * 60 * 1000)
          .toISOString().split('T')[0];

      reminders.push({ plantId: plant.id, plantName: plant.name, type: 'water', dueDate: dueDate(waterFreq), frequency: waterFreq });
      reminders.push({ plantId: plant.id, plantName: plant.name, type: 'feed', dueDate: dueDate(14), frequency: 14 });

      if (plant.cultivation === 'outdoor' || plant.cultivation === 'greenhouse') {
        reminders.push({ plantId: plant.id, plantName: plant.name, type: 'weed', dueDate: dueDate(7), frequency: 7 });
      }

      if (plant.type === 'flower' || plant.type === 'vegetable') {
        reminders.push({ plantId: plant.id, plantName: plant.name, type: 'prune', dueDate: dueDate(30), frequency: 30 });
      }
    });

    return reminders;
  }

  return { getAllPlants, getPlantById, addPlant, deletePlant, getReminders };
}

module.exports = { createPlantModel };
