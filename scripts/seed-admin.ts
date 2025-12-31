import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

import { db } from '../lib/db';
import { users } from '../drizzle/schema';
import { hashPassword } from '../lib/auth/utils';
import { eq } from 'drizzle-orm';

async function seedAdmin() {
    try {
        console.log('🌱 Seeding admin user...');

        const email = 'admin1@example.com';
        const password = 'admin123';
        const name = 'Admin User';

        // Check if admin already exists
        const [existingAdmin] = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (existingAdmin) {
            console.log('⚠️  Admin user already exists!');
            console.log('Email:', email);
            return;
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create admin user
        const [newAdmin] = await db
            .insert(users)
            .values({
                name,
                email,
                password: hashedPassword,
                role: 'admin',
                status: 'online',
            })
            .returning();

        console.log('✅ Admin user created successfully!');
        console.log('-----------------------------------');
        console.log('Email:', email);
        console.log('Password:', password);
        console.log('Role:', newAdmin.role);
        console.log('-----------------------------------');
        console.log('⚠️  Please change the password after first login!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding admin user:', error);
        process.exit(1);
    }
}

seedAdmin();
