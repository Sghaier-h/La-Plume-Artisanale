import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Démarrage du seed...');

  // Créer un utilisateur admin
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@laplume.tn' },
    update: {},
    create: {
      email: 'admin@laplume.tn',
      password: hashedPassword,
      nom: 'Admin',
      prenom: 'Système',
      role: 'ADMIN',
      actif: true
    }
  });

  console.log('✅ Utilisateur admin créé:', admin.email);

  // Créer un utilisateur chef de production
  const chefProd = await prisma.user.upsert({
    where: { email: 'chef.prod@laplume.tn' },
    update: {},
    create: {
      email: 'chef.prod@laplume.tn',
      password: hashedPassword,
      nom: 'Chef',
      prenom: 'Production',
      role: 'CHEF_PRODUCTION',
      actif: true
    }
  });

  console.log('✅ Utilisateur chef production créé:', chefProd.email);

  // Créer un utilisateur tisseur
  const tisseur = await prisma.user.upsert({
    where: { email: 'tisseur@laplume.tn' },
    update: {},
    create: {
      email: 'tisseur@laplume.tn',
      password: hashedPassword,
      nom: 'Tisseur',
      prenom: 'Test',
      role: 'TISSEUR',
      actif: true
    }
  });

  console.log('✅ Utilisateur tisseur créé:', tisseur.email);

  console.log('✅ Seed terminé avec succès!');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
