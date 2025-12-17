const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to RDS MySQL
const db = mysql.createConnection({
  host: 'bookstore-db.cf4kg40s4z33.us-west-2.rds.amazonaws.com', // replace with your RDS endpoint
  user: 'admin',
  password: 'kunal#12345', // replace with your DB password
  database: 'bookstore'
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});

// Get all books
app.get('/books', (req, res) => {
  db.query('SELECT * FROM books', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// Create new order
app.post('/order', (req, res) => {
  const { customer_name, customer_address, payment_method, items } = req.body;

  if (!customer_name || !customer_address || !payment_method || !items || items.length === 0) {
    return res.status(400).json({ message: 'Invalid order data' });
  }

  const orderItems = JSON.stringify(items);

  const query = 'INSERT INTO orders (customer_name, customer_address, payment_method, order_items) VALUES (?, ?, ?, ?)';
  db.query(query, [customer_name, customer_address, payment_method, orderItems], (err, result) => {
    if (err) {
      console.error('Error inserting order:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json({ message: 'Order placed successfully', order_id: result.insertId });
  });
});

app.listen(3000, () => {
  console.log('Backend running on port 3000');
});
