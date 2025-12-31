import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create first super admin user
  const hashedPassword1 = await bcrypt.hash('Swap@2603', 10);

  const superAdmin1 = await prisma.user.upsert({
    where: { email: 'swapnilbibrale99@gmail.com' },
    update: {
      role: 'SUPER_ADMIN',
      password: hashedPassword1
    },
    create: {
      email: 'swapnilbibrale99@gmail.com',
      password: hashedPassword1,
      name: 'Super Admin',
      role: 'SUPER_ADMIN'
    }
  });

  console.log('✅ Super admin user created:', superAdmin1.email);

  // Create second super admin user
  const hashedPassword2 = await bcrypt.hash('Swap@2603', 10);

  const superAdmin2 = await prisma.user.upsert({
    where: { email: 'swapnilbibrale9@gmail.com' },
    update: {
      role: 'SUPER_ADMIN',
      password: hashedPassword2
    },
    create: {
      email: 'swapnilbibrale9@gmail.com',
      password: hashedPassword2,
      name: 'Super Admin 2',
      role: 'SUPER_ADMIN'
    }
  });

  console.log('✅ Second super admin user created:', superAdmin2.email);

  // Create default workspace for first super admin (if doesn't exist)
  let workspace1 = await prisma.workspace.findFirst({
    where: {
      userId: superAdmin1.id,
      name: 'Personal'
    }
  });

  if (!workspace1) {
    workspace1 = await prisma.workspace.create({
      data: {
        name: 'Personal',
        description: 'Default workspace',
        userId: superAdmin1.id
      }
    });
    console.log('✅ Default workspace created for', superAdmin1.email);
  }

  // Create default workspace for second super admin (if doesn't exist)
  let workspace2 = await prisma.workspace.findFirst({
    where: {
      userId: superAdmin2.id,
      name: 'Personal'
    }
  });

  if (!workspace2) {
    workspace2 = await prisma.workspace.create({
      data: {
        name: 'Personal',
        description: 'Default workspace',
        userId: superAdmin2.id
      }
    });
    console.log('✅ Default workspace created for', superAdmin2.email);
  }

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

