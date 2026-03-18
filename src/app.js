const express = require('express');
const path = require('path');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '../public')));

const indexRouter = require('./routes/index');
const plantsRouter = require('./routes/plants');
const remindersRouter = require('./routes/reminders');
const plantDatabaseRouter = require('./routes/plantDatabase');

app.use('/', indexRouter);
app.use('/plants', plantsRouter);
app.use('/reminders', remindersRouter);
app.use('/plant-database', plantDatabaseRouter);

if (require.main === module) {
  app.listen(3000, () => console.log('Garden Manager running on http://localhost:3000'));
}

module.exports = app;
