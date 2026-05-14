const express = require('express');
const { queryAll, queryOne, runSql } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

function generatePNR() {
  const prefix = '4' + Math.floor(Math.random() * 9 + 1);
  const rest = String(Math.floor(Math.random() * 100000000)).padStart(8, '0');
  return prefix + rest;
}

// POST /api/reservations
router.post('/', authenticateToken, (req, res) => {
  try {
    const { passenger_name, train_number, class_type, journey_date, source, destination } = req.body;

    if (!passenger_name || !train_number || !class_type || !journey_date || !source || !destination) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const train = queryOne('SELECT * FROM trains WHERE train_number = ?', [train_number]);
    if (!train) return res.status(404).json({ error: 'Train not found.' });

    const availableClasses = JSON.parse(train.classes);
    if (!availableClasses.includes(class_type)) {
      return res.status(400).json({ error: `Class ${class_type} not available. Available: ${availableClasses.join(', ')}` });
    }

    let pnr;
    do { pnr = generatePNR(); } while (queryOne('SELECT id FROM reservations WHERE pnr = ?', [pnr]));

    const result = runSql(
      `INSERT INTO reservations (pnr, user_id, train_id, passenger_name, class_type, journey_date, source, destination, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', datetime('now'))`,
      [pnr, req.user.id, train.id, passenger_name, class_type, journey_date, source, destination]
    );

    const reservation = queryOne(
      `SELECT r.*, t.train_number, t.train_name FROM reservations r JOIN trains t ON r.train_id = t.id WHERE r.id = ?`,
      [result.lastInsertRowid]
    );

    res.status(201).json({ message: 'Reservation created successfully!', reservation: { ...reservation, pnr } });
  } catch (err) {
    console.error('Reservation error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/reservations
router.get('/', authenticateToken, (req, res) => {
  try {
    const reservations = queryAll(
      `SELECT r.*, t.train_number, t.train_name FROM reservations r JOIN trains t ON r.train_id = t.id WHERE r.user_id = ? ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    res.json(reservations);
  } catch (err) {
    console.error('Fetch reservations error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/reservations/pnr/:pnr
router.get('/pnr/:pnr', authenticateToken, (req, res) => {
  try {
    const reservation = queryOne(
      `SELECT r.*, t.train_number, t.train_name FROM reservations r JOIN trains t ON r.train_id = t.id WHERE r.pnr = ?`,
      [req.params.pnr]
    );
    if (!reservation) return res.status(404).json({ error: 'No ticket found with this PNR number.' });
    res.json(reservation);
  } catch (err) {
    console.error('PNR lookup error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/reservations/cancel
router.post('/cancel', authenticateToken, (req, res) => {
  try {
    const { pnr } = req.body;
    if (!pnr) return res.status(400).json({ error: 'PNR number is required.' });

    const reservation = queryOne(
      `SELECT r.*, t.train_number, t.train_name FROM reservations r JOIN trains t ON r.train_id = t.id WHERE r.pnr = ?`,
      [pnr]
    );
    if (!reservation) return res.status(404).json({ error: 'No ticket found with this PNR number.' });
    if (reservation.status === 'cancelled') return res.status(400).json({ error: 'This ticket is already cancelled.' });

    runSql('UPDATE reservations SET status = ? WHERE pnr = ?', ['cancelled', pnr]);
    res.json({ message: 'Ticket cancelled successfully.', reservation: { ...reservation, status: 'cancelled' } });
  } catch (err) {
    console.error('Cancel error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
