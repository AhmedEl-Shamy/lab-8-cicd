const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const port = 3000;

// إعدادات قاعدة البيانات - تأكد أن MONGO_URL معرف في docker-compose
const url = process.env.MONGO_URL || 'mongodb://db:27017/todo';
let db;

// الاتصال بقاعدة البيانات
async function connectDB() {
    try {
        const client = await MongoClient.connect(url);
        db = client.db();
        console.log('Connected to MongoDB successfully');
    } catch (err) {
        console.error('Database connection failed:', err.message);
    }
}

app.get('/', (req, res) => {
    res.send('CI/CD Pipeline is active! Task 3 verification in progress.');
});

/**
 * المسار الرئيسي لجلب المهام - Task 3
 * يقوم بدمج بيانات قاعدة البيانات مع المهمة الجديدة 'Tea' 
 * لضمان ظهورها في التقرير بعد عملية الـ Deployment الأوتوماتيكية
 */
app.get('/tasks', async (req, res) => {
    try {
        let tasksFromDB = [];
        if (db) {
            // جلب البيانات الموجودة فعلياً في قاعدة البيانات
            tasksFromDB = await db.collection('tasks').find().toArray();
        }

        // المهمة الجديدة المطلوب إضافتها لإثبات نجاح الـ Round-trip
        const task3Verification = { 
            id: 7, 
            name: 'Tea', 
            status: 'pending',
            note: 'Added via CI/CD Pipeline' 
        };

        // الرد النهائي الذي يجمع بين البيانات الأصلية والتعديل الجديد
        res.json({
            status: "Success",
            deployment: "Automated via GitHub Actions",
            data: [...tasksFromDB, task3Verification]
        });
    } catch (err) {
        res.status(500).json({ error: "Could not fetch tasks from database" });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    connectDB();
});
