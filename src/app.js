const express = require('express');
const path = require('path');
const os = require('os');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.urlencoded({ extended: false }));

// Serve static files; ensure the service worker is never cached so browsers
// always fetch the latest version.
app.use(express.static(path.join(__dirname, '../public'), {
  setHeaders(res, filePath) {
    if (filePath.endsWith('sw.js')) {
      res.set('Cache-Control', 'no-cache');
    }
  }
}));

const indexRouter = require('./routes/index');
const plantsRouter = require('./routes/plants');
const remindersRouter = require('./routes/reminders');
const plantDatabaseRouter = require('./routes/plantDatabase');

app.use('/', indexRouter);
app.use('/plants', plantsRouter);
app.use('/reminders', remindersRouter);
app.use('/plant-database', plantDatabaseRouter);

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    const networkInterfaces = os.networkInterfaces();
    const localIp = Object.values(networkInterfaces)
      .flat()
      .find(iface => iface.family === 'IPv4' && !iface.internal);

    console.log(`Garden Manager running on http://localhost:${PORT}`);
    if (localIp) {
      console.log(`On your local network (phone/tablet): http://${localIp.address}:${PORT}`);
      console.log('Make sure your device is on the same Wi-Fi network.');
    }
  });
}

module.exports = app;
