const bcrypt = require('bcryptjs');
const User = require('../models/User');

const seedAdmin = async() => {
    try {
        const existingAdmin = await User.findOne({ email: 'devikrupaelectrical@gmail.com' });

        if (!existingAdmin) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('Hello12345World', salt);

            const adminUser = new User({
                firstname: 'Devikrupa',
                lastname: 'Admin',
                phone: '9429086515',
                email: 'devikrupaelectrical@gmail.com',
                password: hashedPassword,
                secretId: 'Hello12345World67890@#',
                role: 'admin'
            });

            await adminUser.save();
            console.log('✅ Admin user created successfully');
        } else {
            console.log('ℹ️ Admin user already exists');
        }
    } catch (err) {
        console.error('❌ Admin creation failed:', err);
    }
};

module.exports = seedAdmin;