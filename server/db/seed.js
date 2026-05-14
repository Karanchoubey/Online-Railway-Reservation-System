const { getDb, queryOne, runSql } = require('./database');
const bcrypt = require('bcryptjs');

async function seed() {
  console.log('🌱 Seeding database...\n');
  await getDb();

  // Seed Users
  const users = [
    { username: 'admin', password: 'admin123', name: 'Admin User', email: 'admin@oasis.com' },
    { username: 'rahul', password: 'rahul123', name: 'Rahul Sharma', email: 'rahul@email.com' },
    { username: 'priya', password: 'priya123', name: 'Priya Patel', email: 'priya@email.com' },
    { username: 'amit', password: 'amit123', name: 'Amit Kumar', email: 'amit@email.com' },
    { username: 'sneha', password: 'sneha123', name: 'Sneha Reddy', email: 'sneha@email.com' },
  ];

  for (const user of users) {
    const existing = queryOne('SELECT id FROM users WHERE username = ?', [user.username]);
    if (!existing) {
      const hash = bcrypt.hashSync(user.password, 10);
      runSql('INSERT INTO users (username, password, name, email) VALUES (?, ?, ?, ?)',
        [user.username, hash, user.name, user.email]);
    }
  }
  console.log(`✅ Seeded ${users.length} users`);

  // Seed Trains with timing data
  // Format: { number, name, source, destination, dep, arr, duration, days, classes }
  const trains = [
    // ═══ NEW DELHI TO VARANASI JN (from user's images) ═══
    { number: '20504', name: 'DBRG Rajdhani', source: 'New Delhi', destination: 'Varanasi Jn', dep: '11:25', arr: '22:50', duration: '11h 25m', days: 'M T W T F S S', classes: '["3AC","2AC","1AC"]' },
    { number: '14006', name: 'Lichchivi Express', source: 'Anand Vihar Trm', destination: 'Varanasi Jn', dep: '18:00', arr: '06:00', duration: '12h 00m', days: 'M T W T F S S', classes: '["SL","3E","3AC"]' },
    { number: '12392', name: 'Shramjivi Express', source: 'New Delhi', destination: 'Varanasi Jn', dep: '13:10', arr: '02:10', duration: '13h 00m', days: 'M T W T F S S', classes: '["SL","3AC","2AC"]' },
    { number: '20963', name: 'SBIB BSB S Fast', source: 'Delhi Cantt', destination: 'Varanasi Jn', dep: '13:56', arr: '05:30', duration: '15h 34m', days: 'M T W T F S S', classes: '["SL","3AC","2AC"]' },
    { number: '14016', name: 'Sadhbhawna Express', source: 'Anand Vihar Trm', destination: 'Varanasi Jn', dep: '16:30', arr: '09:00', duration: '16h 30m', days: 'M T W T F S S', classes: '["SL","3E","3AC"]' },
    { number: '04072', name: 'SOU Summer Special', source: 'New Delhi', destination: 'Varanasi Jn', dep: '21:35', arr: '14:35', duration: '17h 00m', days: 'M T W T F S S', classes: '["SL","3AC"]' },
    { number: '12562', name: 'Swatantrta S Express', source: 'New Delhi', destination: 'Varanasi Jn', dep: '21:15', arr: '08:05', duration: '10h 50m', days: 'M T W T F S S', classes: '["SL","3E","3AC"]' },
    { number: '12382', name: 'Poorva Express', source: 'New Delhi', destination: 'Varanasi Jn', dep: '17:40', arr: '04:35', duration: '10h 55m', days: 'M T W T F S S', classes: '["SL","3AC","2AC"]' },
    { number: '12582', name: 'BNRS SF Express', source: 'New Delhi', destination: 'Banaras', dep: '22:50', arr: '10:00', duration: '11h 10m', days: 'M T W T F S S', classes: '["SL","3E","3AC"]' },
    { number: '22418', name: 'Mahamana Express', source: 'New Delhi', destination: 'Varanasi Jn', dep: '18:40', arr: '08:25', duration: '13h 45m', days: 'M T W T F S S', classes: '["SL","3AC","2AC"]' },
    { number: '22542', name: 'BNRS Garib Rath', source: 'Anand Vihar Trm', destination: 'Banaras', dep: '18:15', arr: '08:10', duration: '13h 55m', days: 'M T W T F S S', classes: '["3AC"]' },
    { number: '12876', name: 'Neelanchal Express', source: 'Anand Vihar Trm', destination: 'Varanasi Jn', dep: '07:30', arr: '21:40', duration: '14h 10m', days: 'M T W T F S S', classes: '["SL","3E","3AC"]' },
    { number: '22436', name: 'Vande Bharat Express', source: 'New Delhi', destination: 'Varanasi Jn', dep: '06:00', arr: '14:00', duration: '8h 00m', days: 'M T W T F S S', classes: '["CC","EC"]' },
    { number: '22416', name: 'Vande Bharat Express', source: 'New Delhi', destination: 'Varanasi Jn', dep: '15:00', arr: '23:05', duration: '8h 05m', days: 'M T W T F S S', classes: '["CC","EC"]' },
    { number: '12560', name: 'Shiv Ganga Express', source: 'New Delhi', destination: 'Banaras', dep: '20:05', arr: '06:10', duration: '10h 05m', days: 'M T W T F S S', classes: '["SL","3E","3AC"]' },

    // ═══ RAJDHANI EXPRESS TRAINS ═══
    { number: '12301', name: 'Rajdhani Express', source: 'New Delhi', destination: 'Howrah', dep: '16:55', arr: '09:55', duration: '17h 00m', days: 'M T W T F S S', classes: '["1AC","2AC","3AC"]' },
    { number: '12302', name: 'Rajdhani Express', source: 'Howrah', destination: 'New Delhi', dep: '14:05', arr: '10:05', duration: '20h 00m', days: 'M T W T F S S', classes: '["1AC","2AC","3AC"]' },
    { number: '12951', name: 'Mumbai Rajdhani Express', source: 'New Delhi', destination: 'Mumbai Central', dep: '16:25', arr: '08:35', duration: '16h 10m', days: 'M T W T F S S', classes: '["1AC","2AC","3AC"]' },
    { number: '12952', name: 'Mumbai Rajdhani Express', source: 'Mumbai Central', destination: 'New Delhi', dep: '17:40', arr: '08:35', duration: '14h 55m', days: 'M T W T F S S', classes: '["1AC","2AC","3AC"]' },
    { number: '12431', name: 'Trivandrum Rajdhani Express', source: 'New Delhi', destination: 'Trivandrum', dep: '10:55', arr: '05:15', duration: '42h 20m', days: 'M W F', classes: '["1AC","2AC","3AC"]' },
    { number: '12309', name: 'Patna Rajdhani Express', source: 'New Delhi', destination: 'Patna', dep: '17:30', arr: '05:45', duration: '12h 15m', days: 'M T W T F S S', classes: '["1AC","2AC","3AC"]' },

    // ═══ SHATABDI EXPRESS TRAINS ═══
    { number: '12001', name: 'Bhopal Shatabdi Express', source: 'New Delhi', destination: 'Bhopal', dep: '06:00', arr: '13:40', duration: '7h 40m', days: 'M T W T F S S', classes: '["CC","EC"]' },
    { number: '12002', name: 'Bhopal Shatabdi Express', source: 'Bhopal', destination: 'New Delhi', dep: '15:00', arr: '22:25', duration: '7h 25m', days: 'M T W T F S S', classes: '["CC","EC"]' },
    { number: '12245', name: 'Lucknow Shatabdi Express', source: 'New Delhi', destination: 'Lucknow', dep: '06:10', arr: '12:30', duration: '6h 20m', days: 'M T W T F S S', classes: '["CC","EC"]' },
    { number: '12005', name: 'Kalka Shatabdi Express', source: 'New Delhi', destination: 'Kalka', dep: '07:40', arr: '11:45', duration: '4h 05m', days: 'M T W T F S S', classes: '["CC","EC"]' },
    { number: '12011', name: 'Dehradun Shatabdi Express', source: 'New Delhi', destination: 'Dehradun', dep: '06:45', arr: '12:35', duration: '5h 50m', days: 'M T W T F S S', classes: '["CC","EC"]' },
    { number: '12015', name: 'Ajmer Shatabdi Express', source: 'New Delhi', destination: 'Ajmer', dep: '06:05', arr: '12:30', duration: '6h 25m', days: 'M T W T F S S', classes: '["CC","EC"]' },

    // ═══ DURONTO EXPRESS TRAINS ═══
    { number: '12259', name: 'Sealdah Duronto Express', source: 'New Delhi', destination: 'Sealdah', dep: '20:15', arr: '13:25', duration: '17h 10m', days: 'T T S', classes: '["1AC","2AC","3AC","SL"]' },
    { number: '12213', name: 'Mumbai Duronto Express', source: 'New Delhi', destination: 'Mumbai Central', dep: '23:00', arr: '15:50', duration: '16h 50m', days: 'M W F', classes: '["1AC","2AC","3AC"]' },

    // ═══ SUPERFAST / MAIL EXPRESS ═══
    { number: '12627', name: 'Karnataka Express', source: 'New Delhi', destination: 'Bangalore', dep: '21:40', arr: '06:20', duration: '32h 40m', days: 'M T W T F S S', classes: '["2AC","3AC","SL","GN"]' },
    { number: '12723', name: 'Telangana Express', source: 'New Delhi', destination: 'Hyderabad', dep: '06:50', arr: '05:30', duration: '22h 40m', days: 'M T W T F S S', classes: '["2AC","3AC","SL","GN"]' },
    { number: '12621', name: 'Tamil Nadu Express', source: 'New Delhi', destination: 'Chennai', dep: '22:30', arr: '07:10', duration: '32h 40m', days: 'M T W T F S S', classes: '["2AC","3AC","SL","GN"]' },
    { number: '12625', name: 'Kerala Express', source: 'New Delhi', destination: 'Trivandrum', dep: '11:25', arr: '05:10', duration: '41h 45m', days: 'M T W T F S S', classes: '["2AC","3AC","SL","GN"]' },
    { number: '12802', name: 'Purushottam Express', source: 'New Delhi', destination: 'Puri', dep: '22:35', arr: '05:55', duration: '31h 20m', days: 'M T W T F S S', classes: '["2AC","3AC","SL","GN"]' },
    { number: '12903', name: 'Golden Temple Mail', source: 'Mumbai Central', destination: 'Amritsar', dep: '21:30', arr: '05:00', duration: '31h 30m', days: 'M T W T F S S', classes: '["2AC","3AC","SL","GN"]' },
    { number: '12615', name: 'Grand Trunk Express', source: 'New Delhi', destination: 'Chennai', dep: '18:50', arr: '12:35', duration: '41h 45m', days: 'M T W T F S S', classes: '["2AC","3AC","SL","GN"]' },
    { number: '12617', name: 'Mangala Lakshadweep Express', source: 'New Delhi', destination: 'Ernakulam', dep: '08:00', arr: '12:20', duration: '52h 20m', days: 'M T W T F S S', classes: '["2AC","3AC","SL","GN"]' },
    { number: '12559', name: 'Shivganga Express', source: 'New Delhi', destination: 'Varanasi', dep: '18:40', arr: '06:00', duration: '11h 20m', days: 'M T W T F S S', classes: '["2AC","3AC","SL","GN"]' },

    // ═══ MUMBAI LOCAL ROUTES ═══
    { number: '12123', name: 'Deccan Queen Express', source: 'Mumbai CST', destination: 'Pune', dep: '17:10', arr: '20:30', duration: '3h 20m', days: 'M T W T F S S', classes: '["CC","2S"]' },
    { number: '12133', name: 'Mumbai-Mangalore Express', source: 'Mumbai CST', destination: 'Mangalore', dep: '22:00', arr: '14:20', duration: '16h 20m', days: 'M T W T F S S', classes: '["2AC","3AC","SL","GN"]' },
    { number: '12105', name: 'Vidarbha Express', source: 'Mumbai CST', destination: 'Nagpur', dep: '07:40', arr: '22:45', duration: '15h 05m', days: 'M T W T F S S', classes: '["2AC","3AC","SL","GN"]' },
    { number: '12901', name: 'Gujarat Mail', source: 'Mumbai Central', destination: 'Ahmedabad', dep: '22:05', arr: '06:25', duration: '8h 20m', days: 'M T W T F S S', classes: '["2AC","3AC","SL","GN"]' },
    { number: '10103', name: 'Mandovi Express', source: 'Mumbai CST', destination: 'Madgaon', dep: '07:10', arr: '19:00', duration: '11h 50m', days: 'M T W T F S S', classes: '["2AC","3AC","SL","GN"]' },

    // ═══ CHENNAI / SOUTH ROUTES ═══
    { number: '12841', name: 'Coromandel Express', source: 'Howrah', destination: 'Chennai', dep: '14:50', arr: '17:40', duration: '26h 50m', days: 'M T W T F S S', classes: '["2AC","3AC","SL","GN"]' },
    { number: '12657', name: 'Chennai-Bangalore Mail', source: 'Chennai', destination: 'Bangalore', dep: '23:00', arr: '05:00', duration: '6h 00m', days: 'M T W T F S S', classes: '["2AC","3AC","SL","GN"]' },
    { number: '12703', name: 'Falaknuma Express', source: 'Hyderabad', destination: 'Bangalore', dep: '20:30', arr: '08:30', duration: '12h 00m', days: 'M T W T F S S', classes: '["2AC","3AC","SL","GN"]' },

    // ═══ JAIPUR / RAJASTHAN ═══
    { number: '12414', name: 'Delhi-Jaipur Express', source: 'New Delhi', destination: 'Jaipur', dep: '17:45', arr: '22:25', duration: '4h 40m', days: 'M T W T F S S', classes: '["2AC","3AC","SL","GN"]' },
    { number: '12779', name: 'Goa Express', source: 'New Delhi', destination: 'Madgaon', dep: '15:00', arr: '11:00', duration: '44h 00m', days: 'M T W T F S S', classes: '["2AC","3AC","SL","GN"]' },
  ];

  const insertSql = `INSERT INTO trains (train_number, train_name, source, destination, departure_time, arrival_time, duration, days_of_run, classes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  for (const t of trains) {
    const existing = queryOne('SELECT id FROM trains WHERE train_number = ?', [t.number]);
    if (!existing) {
      runSql(insertSql, [t.number, t.name, t.source, t.destination, t.dep, t.arr, t.duration, t.days, t.classes]);
    }
  }
  console.log(`✅ Seeded ${trains.length} trains`);

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📋 Demo Login Credentials:');
  console.log('   Username: admin    | Password: admin123');
  console.log('   Username: rahul    | Password: rahul123');
}

seed().catch(err => { console.error('Seed error:', err); process.exit(1); });
