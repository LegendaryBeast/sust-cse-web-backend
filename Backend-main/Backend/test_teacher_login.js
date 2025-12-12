const mongoose = require('mongoose');
require('dotenv').config();
require('ts-node/register');
const jwt = require('jsonwebtoken');

const Teacher = require('./src/models/Teacher').default;
const { config } = require('./src/config/env');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

async function testTeacherLogin() {
    try {
        console.log('\n=== TESTING TEACHER LOGIN & TOKEN ===\n');

        // Find teacher
        const teacher = await Teacher.findOne({ email: 'istiak@sust.edu' });

        if (!teacher) {
            console.log('❌ Teacher not found');
            return;
        }

        console.log('✅ Teacher found:');
        console.log(`   Name: ${teacher.name}`);
        console.log(`   Email: ${teacher.email}`);
        console.log(`   ID: ${teacher._id}`);
        console.log(`   ID Type: ${typeof teacher._id}`);

        // Generate a token like the login would
        const token = jwt.sign(
            { id: teacher._id.toString() },
            config.jwtSecret,
            { expiresIn: config.jwtExpire }
        );

        console.log(`\n✅ Generated Token:\n   ${token}`);

        // Decode the token to verify
        const decoded = jwt.verify(token, config.jwtSecret);
        console.log(`\n✅ Token Decoded:`);
        console.log(`   ID from token: ${decoded.id}`);
        console.log(`   ID Type: ${typeof decoded.id}`);
        console.log(`   Matches teacher ID? ${decoded.id === teacher._id.toString()}`);

        // Test: Make sure we can find the teacher using the ID from the token
        const foundTeacher = await Teacher.findById(decoded.id);
        console.log(`\n✅ Can find teacher with token ID? ${!!foundTeacher}`);
        if (foundTeacher) {
            console.log(`   Found: ${foundTeacher.name} (${foundTeacher.email})`);
        }

        // Now test the enrollment query
        const Enrollment = require('./src/models/Enrollment').default;

        // Test different query approaches
        console.log(`\n=== TESTING ENROLLMENT QUERIES ===\n`);

        // Query 1: Using string ID from token
        const query1 = await Enrollment.find({
            teacherId: decoded.id,
            status: 'pending'
        });
        console.log(`Query with string ID (${decoded.id}):`);
        console.log(`   Results: ${query1.length}`);

        // Query 2: Using ObjectId from token string
        const query2 = await Enrollment.find({
            teacherId: new mongoose.Types.ObjectId(decoded.id),
            status: 'pending'
        });
        console.log(`\nQuery with new ObjectId(string):`);
        console.log(`   Results: ${query2.length}`);

        // Query 3: Using teacher._id directly
        const query3 = await Enrollment.find({
            teacherId: teacher._id,
            status: 'pending'
        });
        console.log(`\nQuery with teacher._id directly:`);
        console.log(`   Results: ${query3.length}`);

        console.log(`\n📋 CURL command to test the API:`);
        console.log(`\ncurl -X GET 'http://localhost:5001/api/enrollments/requests?status=pending' \\`);
        console.log(`  -H 'Authorization: Bearer ${token}' \\`);
        console.log(`  -H 'Content-Type: application/json'\n`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
    }
}

testTeacherLogin();
