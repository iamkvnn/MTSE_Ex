import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../model/user.js';
import { Product } from '../model/product.js';

dotenv.config();

const salt = bcrypt.genSaltSync(10);

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_DB_URL);
        console.log('Connected to database');

        // Clear existing data
        await User.deleteMany({});
        await Product.deleteMany({});
        console.log('Cleared existing data');

        // Create admin user
        const adminPassword = await bcrypt.hashSync('admin123', salt);
        const admin = await User.create({
            name: 'Admin',
            email: 'admin@example.com',
            password: adminPassword,
            role: 'Admin'
        });
        console.log('✓ Admin user created:', admin.email);

        // Create sample products
        const products = [
            // Electronics
            {
                name: 'Laptop Dell XPS 15',
                description: 'High-performance laptop with Intel i7 processor, 16GB RAM, 512GB SSD',
                price: 1499.99,
                category: 'electronics',
                image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45',
                stock: 25,
                isActive: true
            },
            {
                name: 'iPhone 14 Pro',
                description: 'Latest iPhone with A16 chip, 128GB storage, Pro camera system',
                price: 999.99,
                category: 'electronics',
                image: 'https://images.unsplash.com/photo-1592286927505-38a2e8f08c7c',
                stock: 50,
                isActive: true
            },
            {
                name: 'Sony WH-1000XM5 Headphones',
                description: 'Premium noise-cancelling wireless headphones',
                price: 399.99,
                category: 'electronics',
                image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
                stock: 30,
                isActive: true
            },
            {
                name: 'Samsung 4K Smart TV 55"',
                description: '55-inch 4K UHD Smart TV with HDR and voice control',
                price: 799.99,
                category: 'electronics',
                image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1',
                stock: 15,
                isActive: true
            },
            {
                name: 'Canon EOS R6 Camera',
                description: 'Professional mirrorless camera with 20MP sensor',
                price: 2499.99,
                category: 'electronics',
                image: 'https://images.unsplash.com/photo-1606980696994-1dd3024ad00f',
                stock: 10,
                isActive: true
            },

            // Clothing
            {
                name: 'Nike Air Max Sneakers',
                description: 'Comfortable running shoes with air cushioning',
                price: 129.99,
                category: 'clothing',
                image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
                stock: 100,
                isActive: true
            },
            {
                name: 'Levi\'s 501 Original Jeans',
                description: 'Classic straight fit denim jeans',
                price: 69.99,
                category: 'clothing',
                image: 'https://images.unsplash.com/photo-1542272604-787c3835535d',
                stock: 75,
                isActive: true
            },
            {
                name: 'Adidas Sports Jacket',
                description: 'Water-resistant windbreaker jacket',
                price: 89.99,
                category: 'clothing',
                image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5',
                stock: 60,
                isActive: true
            },
            {
                name: 'Cotton T-Shirt Pack (3)',
                description: 'Pack of 3 premium cotton t-shirts in assorted colors',
                price: 39.99,
                category: 'clothing',
                image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
                stock: 150,
                isActive: true
            },

            // Food
            {
                name: 'Organic Coffee Beans 1kg',
                description: 'Premium arabica coffee beans from Colombia',
                price: 24.99,
                category: 'food',
                image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e',
                stock: 200,
                isActive: true
            },
            {
                name: 'Organic Honey 500g',
                description: 'Pure raw organic honey from local farms',
                price: 15.99,
                category: 'food',
                image: 'https://images.unsplash.com/photo-1587049352846-4a222e784778',
                stock: 80,
                isActive: true
            },
            {
                name: 'Extra Virgin Olive Oil',
                description: 'Cold-pressed olive oil from Italy, 750ml',
                price: 19.99,
                category: 'food',
                image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5',
                stock: 120,
                isActive: true
            },

            // Books
            {
                name: 'The Great Gatsby',
                description: 'Classic novel by F. Scott Fitzgerald',
                price: 12.99,
                category: 'books',
                image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e',
                stock: 45,
                isActive: true
            },
            {
                name: 'Clean Code',
                description: 'A Handbook of Agile Software Craftsmanship',
                price: 34.99,
                category: 'books',
                image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765',
                stock: 35,
                isActive: true
            },
            {
                name: 'Atomic Habits',
                description: 'An Easy & Proven Way to Build Good Habits',
                price: 16.99,
                category: 'books',
                image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f',
                stock: 60,
                isActive: true
            },

            // Home
            {
                name: 'Dyson V15 Vacuum Cleaner',
                description: 'Cordless vacuum with laser detection',
                price: 649.99,
                category: 'home',
                image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001',
                stock: 20,
                isActive: true
            },
            {
                name: 'KitchenAid Stand Mixer',
                description: 'Professional 5-quart stand mixer',
                price: 379.99,
                category: 'home',
                image: 'https://images.unsplash.com/photo-1578269174936-2709b6aeb913',
                stock: 25,
                isActive: true
            },
            {
                name: 'Nespresso Coffee Machine',
                description: 'Automatic espresso and cappuccino maker',
                price: 199.99,
                category: 'home',
                image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6',
                stock: 40,
                isActive: true
            },

            // Sports
            {
                name: 'Yoga Mat Premium',
                description: 'Non-slip exercise mat with carrying strap',
                price: 29.99,
                category: 'sports',
                image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f',
                stock: 100,
                isActive: true
            },
            {
                name: 'Dumbbell Set 20kg',
                description: 'Adjustable dumbbell set with stand',
                price: 149.99,
                category: 'sports',
                image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f',
                stock: 30,
                isActive: true
            },
            {
                name: 'Mountain Bike 26"',
                description: '21-speed aluminum frame mountain bike',
                price: 449.99,
                category: 'sports',
                image: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91',
                stock: 15,
                isActive: true
            }
        ];

        await Product.insertMany(products);

        await mongoose.disconnect();
        console.log('\n✓ Database seeding completed successfully');
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedData();
