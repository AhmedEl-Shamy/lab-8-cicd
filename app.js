const express = require('express');
const { MongoClient } = require('mongodb');
const os = require('os');

const app = express();
const PORT = 3000;

// رابط قاعدة البيانات
const DB_URI = process.env.DB_URI || 'mongodb://db:27017/todoDB';
let db;

async function initDB() {
  try {
    const client = await MongoClient.connect(DB_URI);
    db = client.db();
    console.log("Connected to MongoDB");

    const tasksCollection = db.collection('tasks');
    
    // هنمسح البيانات القديمة عشان الـ Seed الجديد اللي فيه Tea ينزل
    await tasksCollection.deleteMany({}); 

    await tasksCollection.insertMany([
      { id: 1, name: 'Milk', status: 'done' },
      { id: 2, name: 'Eggs', status: 'done' },
      { id: 3, name: 'Bread', status: 'pending' },
      { id: 4, name: 'Butter', status: 'pending' },
      { id: 5, name: 'Orange juice', status: 'pending' }, // الفاصلة كانت ناقصة هنا
      { id: 7, name: 'Tea', status: 'pending' }
    ]);
    console.log("Database seeded with Tea!");
  } catch (err) {
    console.error("Database connection error:", err);
  }
}

initDB();

app.get('/', (req, res) => {
  res.json({
    app:  'CISC 886 Lab 8',
    mode: process.env.MODE || 'CI/CD',
    node: process.version,
    host: os.hostname(),
  });
});

app.get('/tasks', async (req, res) => {
  try {
    const tasks = await db.collection('tasks').find({}).toArray();
    const grouped = {};
    tasks.forEach(task => {
      if (!grouped[task.status]) grouped[task.status] = [];
      grouped[task.status].push(task);
    });
    res.json(grouped);
  } catch (err) {
    res.status(500).send("Error fetching tasks");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
