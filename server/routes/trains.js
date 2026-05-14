const express = require('express');
const { queryAll, queryOne } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/trains - List all trains
router.get('/', authenticateToken, (req, res) => {
  try {
    const trains = queryAll('SELECT * FROM trains ORDER BY train_number');
    const parsed = trains.map(t => ({ ...t, classes: JSON.parse(t.classes) }));
    res.json(parsed);
  } catch (err) {
    console.error('Fetch trains error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/trains/search?q=...&source=...&destination=...
// Search by name, number, or find trains between two stations
router.get('/search', authenticateToken, (req, res) => {
  try {
    const { q, source, destination } = req.query;
    let trains = [];

    if (q) {
      // Search by train name or train number (partial match)
      trains = queryAll(
        `SELECT * FROM trains WHERE 
         LOWER(train_name) LIKE LOWER(?) OR 
         train_number LIKE ? 
         ORDER BY train_name LIMIT 20`,
        [`%${q}%`, `%${q}%`]
      );
    } else if (source && destination) {
      // Find trains between two stations (partial match on station names)
      trains = queryAll(
        `SELECT * FROM trains WHERE 
         LOWER(source) LIKE LOWER(?) AND LOWER(destination) LIKE LOWER(?)
         ORDER BY train_name`,
        [`%${source}%`, `%${destination}%`]
      );

      // Also search reverse routes
      const reverse = queryAll(
        `SELECT * FROM trains WHERE 
         LOWER(source) LIKE LOWER(?) AND LOWER(destination) LIKE LOWER(?)
         ORDER BY train_name`,
        [`%${destination}%`, `%${source}%`]
      );

      // Merge without duplicates
      const ids = new Set(trains.map(t => t.id));
      for (const t of reverse) {
        if (!ids.has(t.id)) trains.push(t);
      }
    } else if (source) {
      trains = queryAll(
        `SELECT * FROM trains WHERE LOWER(source) LIKE LOWER(?) ORDER BY train_name`,
        [`%${source}%`]
      );
    } else if (destination) {
      trains = queryAll(
        `SELECT * FROM trains WHERE LOWER(destination) LIKE LOWER(?) ORDER BY train_name`,
        [`%${destination}%`]
      );
    }

    const parsed = trains.map(t => ({ ...t, classes: JSON.parse(t.classes) }));
    res.json(parsed);
  } catch (err) {
    console.error('Search trains error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/trains/stations - Get all unique station names
router.get('/stations', authenticateToken, (req, res) => {
  try {
    const sources = queryAll('SELECT DISTINCT source AS name FROM trains ORDER BY source');
    const destinations = queryAll('SELECT DISTINCT destination AS name FROM trains ORDER BY destination');
    const stationSet = new Set();
    sources.forEach(s => stationSet.add(s.name));
    destinations.forEach(d => stationSet.add(d.name));
    const stations = [...stationSet].sort();
    res.json(stations);
  } catch (err) {
    console.error('Fetch stations error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/trains/:trainNumber - Get train by number
router.get('/:trainNumber', authenticateToken, (req, res) => {
  try {
    const train = queryOne('SELECT * FROM trains WHERE train_number = ?', [req.params.trainNumber]);
    if (!train) return res.status(404).json({ error: 'Train not found.' });
    res.json({ ...train, classes: JSON.parse(train.classes) });
  } catch (err) {
    console.error('Fetch train error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
