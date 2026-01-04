import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  
  if (!email) {
    console.error('❌ Please provide an email as argument');
    console.error('Usage: npm run promote:user -- email@example.com');
    process.exit(1);
  }
  
  console.log(`🔄 Promoting ${email} to SUPER_ADMIN...`);
  
  const user = await prisma.user.update({
    where: { email },
    data: {
      role: 'SUPER_ADMIN'
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true
    }
  });
  
  console.log('✅ User promoted to SUPER_ADMIN:', user);
  process.exit(0);
}

main().catch((e) => {
  console.error('❌ Error:', e.message);
  process.exit(1);
});
