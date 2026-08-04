import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Product from './models/Product.js';
import Activity from './models/Activity.js';

dotenv.config();

const resetAndSeed = async () => {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect('mongodb://127.0.0.1:27017/desi-delights');

        // 1. Drop old/teammate database 'imagine' if present
        console.log('🗑️ Cleaning up old teammate database...');
        try {
            const conn = await mongoose.createConnection('mongodb://127.0.0.1:27017/imagine').asPromise();
            await conn.dropDatabase();
            await conn.close();
            console.log('✅ Successfully dropped old teammate database "imagine"');
        } catch (e) {
            console.log('Note: Database "imagine" clean.');
        }

        // 2. Clear current database collections
        console.log('🧹 Resetting collections in "desi-delights"...');
        await Product.deleteMany({});
        await User.deleteMany({});
        await Activity.deleteMany({});

        // 3. Create Default Admin & User using .save() to trigger pre-save bcrypt hash
        console.log('👤 Creating fresh Admin & Regular User accounts...');
        const adminUser = new User({
            name: 'Admin User',
            email: 'admin@inetmart.com',
            password: 'admin123',
            role: 'admin'
        });
        await adminUser.save();

        const regularUser = new User({
            name: 'Rahul Sharma',
            email: 'rahul@gmail.com',
            password: 'user123',
            role: 'user'
        });
        await regularUser.save();

        console.log('✅ Admin user created: admin@inetmart.com / admin123');
        console.log('✅ Regular user created: rahul@gmail.com / user123');

        // 4. Seed 10 Authentic Products with ₹ Prices & Local Uploads
        console.log('📦 Seeding 10 catalog products with ₹ prices & images...');
        const sampleProducts = [
            {
                userId: adminUser._id,
                name: "Wireless Bluetooth Headphones",
                description: "Over-ear noise cancelling wireless headphones with 30hr battery life",
                category: "Electronics",
                price: 2999,
                stock: 25,
                status: "active",
                imageUrl: "/uploads/headphones.jpg"
            },
            {
                userId: adminUser._id,
                name: "Men's Casual Cotton T-Shirt",
                description: "100% Premium breathable cotton graphic t-shirt for daily wear",
                category: "Clothing",
                price: 799,
                stock: 50,
                status: "active",
                imageUrl: "/uploads/tshirt.jpg"
            },
            {
                userId: adminUser._id,
                name: "Organic California Almonds (500g)",
                description: "Raw premium crunchy almonds packed with nutrients and vitamin E",
                category: "Food",
                price: 650,
                stock: 100,
                status: "active",
                imageUrl: "/uploads/almonds.jpg"
            },
            {
                userId: adminUser._id,
                name: "JavaScript: The Complete Guide",
                description: "Master modern JS ES6+, Node.js, and Async programming step by step",
                category: "Books",
                price: 1299,
                stock: 15,
                status: "active",
                imageUrl: "/uploads/jsbook.jpg"
            },
            {
                userId: adminUser._id,
                name: "Stainless Steel Water Bottle (1L)",
                description: "Double-wall insulated flask keeps beverages cold for 24 hrs",
                category: "Home",
                price: 499,
                stock: 40,
                status: "active",
                imageUrl: "/uploads/bottle.jpg"
            },
            {
                userId: adminUser._id,
                name: "Anti-Slip Premium Yoga Mat (6mm)",
                description: "Eco-friendly TPE cushioning yoga mat with alignment guidelines",
                category: "Sports",
                price: 999,
                stock: 30,
                status: "active",
                imageUrl: "/uploads/yogamat.jpg"
            },
            {
                userId: adminUser._id,
                name: "Smart Wi-Fi LED Bulb (9W)",
                description: "16 million colors, voice control with Alexa & Google Assistant",
                category: "Electronics",
                price: 899,
                stock: 60,
                status: "active",
                imageUrl: "/uploads/bulb.jpg"
            },
            {
                userId: adminUser._id,
                name: "Women's Lightweight Running Shoes",
                description: "Breathable mesh upper with shock-absorbing sole for workouts",
                category: "Clothing",
                price: 2499,
                stock: 20,
                status: "active",
                imageUrl: "/uploads/shoes.jpg"
            },
            {
                userId: adminUser._id,
                name: "Ceramic Dinner Set (24 Pieces)",
                description: "Elegant microwave & dishwasher safe designer tableware set",
                category: "Home",
                price: 3499,
                stock: 8,
                status: "active",
                imageUrl: "/uploads/dinner.jpg"
            },
            {
                userId: adminUser._id,
                name: "Whey Protein Powder (1kg Chocolate)",
                description: "24g pure whey protein per scoop with digestive enzymes",
                category: "Food",
                price: 2199,
                stock: 18,
                status: "active",
                imageUrl: "/uploads/protein.jpg"
            }
        ];

        await Product.insertMany(sampleProducts);
        console.log(`✅ Successfully seeded 10 products!`);

        // 5. Create Initial Activity Log
        console.log('📋 Creating activity audit log...');
        await Activity.create({
            userId: adminUser._id,
            userName: adminUser.name,
            entityType: 'product',
            entityId: adminUser._id,
            action: 'created',
            description: 'Initialized 10 catalog products in database'
        });

        console.log('\n🎉 DATABASE RESET & SEEDING COMPLETE!');
        console.log('====================================================');
        console.log('🔑 ADMIN LOGIN : admin@inetmart.com / admin123');
        console.log('🔑 USER LOGIN  : rahul@gmail.com / user123');
        console.log('🛍️ PRODUCTS    : 10 Indian Rupee (₹) products with images');
        console.log('====================================================\n');

    } catch (error) {
        console.error('❌ Error during database reset:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

resetAndSeed();
