import { connectDB } from '../config/database';
import User from '../models/User';
import Faculty from '../models/Faculty';
import Course from '../models/Course';
import News from '../models/News';
import StudentRegistration from '../models/StudentRegistration';

const seedDatabase = async () => {
    try {
        await connectDB();


        console.log('  Clearing existing data...');
        await User.deleteMany({});
        await Faculty.deleteMany({});
        await Course.deleteMany({});
        await News.deleteMany({});
        await StudentRegistration.deleteMany({});


        console.log(' Creating admin user...');
        const admin = await User.create({
            username: 'admin',
            email: 'admin@sust.edu',
            password: 'admin123',
            role: 'superadmin',
        });
        console.log(' Admin created:', admin.email);


        console.log('‍ Creating sample faculty...');
        const faculty = await Faculty.insertMany([
            {
                name: 'Dr. Md Masum',
                designation: 'Professor & Head',
                email: 'masum@sust.edu',
                phone: '+880-821-713491',
                image: '/images/Masum.jpg',
                education: ['PhD in Computer Science, University of XYZ', 'MSc in CSE, SUST'],
                research: ['Machine Learning', 'Data Mining', 'AI'],
            },
            {
                name: 'Dr. Mohammad Shahidur Rahman',
                designation: 'Professor',
                email: 'shahid@sust.edu',
                phone: '+880-821-713492',
                image: '/images/shahid.jpg',
                education: ['PhD in Software Engineering'],
                research: ['Software Engineering', 'Cloud Computing'],
            },
            {
                name: 'Md. Mehedi Hasan',
                designation: 'Lecturer',
                email: 'rumi@sust.edu',
                phone: '+880-821-713493',
                image: '/images/rumi.jpg',
                education: ['MSc in CSE, SUST', 'BSc in CSE, SUST'],
                research: ['Web Development', 'Database Systems'],
            },
        ]);
        console.log(` Created ${faculty.length} faculty members`);


        console.log(' Creating sample courses...');
        const courses = await Course.insertMany([
            {
                title: 'Introduction to Programming',
                code: 'CSE101',
                level: 'Undergraduate',
                description: 'Fundamentals of programming using C language',
                credits: 3,
            },
            {
                title: 'Data Structures and Algorithms',
                code: 'CSE207',
                level: 'Undergraduate',
                description: 'Core data structures and algorithm design techniques',
                credits: 3,
            },
            {
                title: 'Database Management Systems',
                code: 'CSE303',
                level: 'Undergraduate',
                description: 'Introduction to database concepts and SQL',
                credits: 3,
            },
            {
                title: 'Advanced Machine Learning',
                code: 'CSE601',
                level: 'M.Sc.',
                description: 'Deep learning and advanced ML techniques',
                credits: 3,
            },
            {
                title: 'Research Methodology',
                code: 'CSE701',
                level: 'Ph.D.',
                description: 'Research methods and thesis writing',
                credits: 3,
            },
        ]);
        console.log(` Created ${courses.length} courses`);


        console.log(' Creating sample news...');
        const news = await News.insertMany([
            {
                title: 'Champions of MU CSE Fest 2024',
                excerpt:
                    'Champions of MU CSE Fest 2024 - Inter University Programming Contest - Sylhet Division. Members: Abdullah Al Mahmud, Jawad Aziz Chowdhury, Rafid Bin Nasim Soccho.',
                image: '/images/news1.png',
                url: '/news/1',
                isActive: true,
                order: 1,
            },
            {
                title: 'University Life Is Full of Fun',
                excerpt: 'সেই চিল আর চিল - Enjoying campus life at SUST CSE',
                image: '/images/news2.png',
                url: '/news/2',
                isActive: true,
                order: 2,
            },
            {
                title: 'ICPC World Finals Participation',
                excerpt:
                    'Wishing our brilliant minds from Team SUST_Fanatics the very best as they represent SUST on the global stage at the 49th ICPC World Finals!',
                image: '/images/news3.png',
                url: '/news/3',
                isActive: true,
                order: 3,
            },
        ]);
        console.log(` Created ${news.length} news items`);

        // Create sample student registration IDs
        console.log('🎓 Creating student registration IDs...');
        const registrationIds = await StudentRegistration.insertMany([
            { registrationId: '2019331001', session: '2019-20', batch: 40, isUsed: false, uploadedBy: admin._id },
            { registrationId: '2019331002', session: '2019-20', batch: 40, isUsed: false, uploadedBy: admin._id },
            { registrationId: '2020331001', session: '2020-21', batch: 41, isUsed: false, uploadedBy: admin._id },
            { registrationId: '2020331002', session: '2020-21', batch: 41, isUsed: false, uploadedBy: admin._id },
            { registrationId: '2021331001', session: '2021-22', batch: 42, isUsed: false, uploadedBy: admin._id },
        ]);
        console.log(` Created ${registrationIds.length} registration IDs`);

        console.log('');
        console.log(' Database seeded successfully!');
        console.log('');
        console.log(' Admin Credentials:');
        console.log('   Email: admin@sust.edu');
        console.log('   Password: admin123');
        console.log('');

        process.exit(0);
    } catch (error) {
        console.error(' Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
