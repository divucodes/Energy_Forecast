require('dotenv').config(); // Import dotenv before any other modules
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { parse } = require('csv-parse/sync');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;

// Middleware setup
app.use(cors({
    origin: 'http://localhost:3001', // Frontend URL
    methods: 'GET,POST',
    allowedHeaders: 'Content-Type'
  }));
  
app.use(express.json()); // Middleware to parse JSON request bodies

// Function to read and parse a CSV file
async function readCSV(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return parse(content, { columns: true });
  } catch (error) {
    console.error('Error reading CSV file:', error);
    throw new Error('Failed to read CSV file');
  }
}

// Authentication data 
const users = [
  { email: 'divu20@gmail.com', password: 'divu20' } 
];

// Generate a JWT token
const generateToken = (email) => {
  if (!process.env.JWT_SECRET_KEY) {
    throw new Error('JWT_SECRET_KEY is not defined in the environment variables');
  }
  return jwt.sign({ email }, process.env.JWT_SECRET_KEY, { expiresIn: '1d' });
};

// Authenticate the user
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  console.log(`Received login request: ${email}, ${password}`); // Debugging line

  const user = users.find(user => user.email === email && user.password === password);

  if (user) {
    const token = generateToken(email);
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Get data from all CSV files
app.get('/api/csv-data', async (req, res) => {
  try {
    const folderPath = path.join(__dirname, 'forecast_data');
    const files = await fs.readdir(folderPath);
    const csvFiles = files.filter(file => path.extname(file).toLowerCase() === '.csv');

    const results = {};
    for (const file of csvFiles) {
      const filePath = path.join(folderPath, file);
      results[path.parse(file).name] = await readCSV(filePath);
    }

    res.json(results);
  } catch (error) {
    console.error('Error getting CSV data:', error); // Debugging line
    res.status(500).json({ error: 'An error occurred while processing the CSV files' });
  }
});

// Get data from a single CSV file
app.get('/api/csv-data/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'forecast_data', `${filename}.csv`);

    if (await fs.access(filePath).then(() => true).catch(() => false)) {
      const data = await readCSV(filePath);
      res.json(data);
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    console.error('Error getting CSV file data:', error); // Debugging line
    res.status(500).json({ error: 'An error occurred while processing the CSV file' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error middleware:', err); // Debugging line
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
