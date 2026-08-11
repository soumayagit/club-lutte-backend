// Script à exécuter UNE SEULE FOIS pour donner un code d'invitation
// aux clubs déjà créés avant l'ajout de cette fonctionnalité.
//
// Usage : node backfill-invite-codes.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function generateCode(nom) {
  const prefix = nom
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z]/g, '')
    .toUpperCase()
    .slice(0, 6) || 'CLUB';
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${suffix}`;
}

async function main() {
  const clubs = await prisma.club.findMany({ where: { inviteCode: null } });
  console.log(`${clubs.length} club(s) sans code d'invitation trouvé(s).`);

  for (const club of clubs) {
    let code = generateCode(club.nom);
    // Vérifie l'unicité (rare collision, mais on la gère quand même)
    while (await prisma.club.findUnique({ where: { inviteCode: code } })) {
      code = generateCode(club.nom);
    }

    await prisma.club.update({
      where: { id: club.id },
      data: { inviteCode: code },
    });

    console.log(`  ${club.nom} → ${code}`);
  }

  console.log('Terminé.');
}

main()
  .catch((e) => {
    console.error('Erreur :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });