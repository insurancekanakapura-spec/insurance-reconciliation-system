const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create branches
  const branches = await Promise.all([
    prisma.branch.upsert({
      where: { code: 'bng01' },
      update: {},
      create: {
        code: 'bng01',
        name: 'Jayanagar',
        address: '1533, 9th Main, 3rd Block, Jayanagar',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560011',
        phone: '+91-80-4944-9999',
        email: 'jayanagar@cloudninecare.com',
      },
    }),
    prisma.branch.upsert({
      where: { code: 'bng02' },
      update: {},
      create: {
        code: 'bng02',
        name: 'Old Airport Road',
        address: 'Survey No. 10P & 12P, Whitefield Main Road',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560066',
        phone: '+91-80-4944-9999',
        email: 'oar@cloudninecare.com',
      },
    }),
    prisma.branch.upsert({
      where: { code: 'bng03' },
      update: {},
      create: {
        code: 'bng03',
        name: 'Malleswaram',
        address: 'No. 5, 6th Cross, Margosa Road, Malleswaram',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560003',
        phone: '+91-80-4944-9999',
        email: 'malleswaram@cloudninecare.com',
      },
    }),
    prisma.branch.upsert({
      where: { code: 'bng04' },
      update: {},
      create: {
        code: 'bng04',
        name: 'Bellandur',
        address: 'Survey No. 10/3, Ambalipura Village, Varthur Hobli',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560103',
        phone: '+91-80-4944-9999',
        email: 'bellandur@cloudninecare.com',
      },
    }),
    prisma.branch.upsert({
      where: { code: 'bng05' },
      update: {},
      create: {
        code: 'bng05',
        name: 'Indiranagar',
        address: 'No. 520, CMH Road, Indiranagar',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560038',
        phone: '+91-80-4944-9999',
        email: 'indiranagar@cloudninecare.com',
      },
    }),
  ]);

  console.log(`✅ Created ${branches.length} branches`);

  // Create Insurance/TPAs
  const insuranceTPAs = await Promise.all([
    prisma.insuranceTPA.upsert({
      where: { name: 'HDFC ERGO' },
      update: {},
      create: {
        name: 'HDFC ERGO',
        type: 'Insurance',
        contactPerson: 'Rahul Sharma',
        phone: '+91-80-1234-5678',
        email: 'claims@hdfcergo.com',
      },
    }),
    prisma.insuranceTPA.upsert({
      where: { name: 'ICICI Lombard' },
      update: {},
      create: {
        name: 'ICICI Lombard',
        type: 'Insurance',
        contactPerson: 'Priya Patel',
        phone: '+91-80-2345-6789',
        email: 'claims@icicilombard.com',
      },
    }),
    prisma.insuranceTPA.upsert({
      where: { name: 'Star Health' },
      update: {},
      create: {
        name: 'Star Health',
        type: 'Insurance',
        contactPerson: 'Amit Kumar',
        phone: '+91-80-3456-7890',
        email: 'claims@starhealth.in',
      },
    }),
    prisma.insuranceTPA.upsert({
      where: { name: 'Medi Assist' },
      update: {},
      create: {
        name: 'Medi Assist',
        type: 'TPA',
        contactPerson: 'Sneha Reddy',
        phone: '+91-80-4567-8901',
        email: 'claims@mediassist.in',
      },
    }),
    prisma.insuranceTPA.upsert({
      where: { name: 'Paramount Health' },
      update: {},
      create: {
        name: 'Paramount Health',
        type: 'TPA',
        contactPerson: 'Vikram Singh',
        phone: '+91-80-5678-9012',
        email: 'claims@paramounthealth.com',
      },
    }),
    prisma.insuranceTPA.upsert({
      where: { name: 'United India' },
      update: {},
      create: {
        name: 'United India',
        type: 'Insurance',
        contactPerson: 'Meera Iyer',
        phone: '+91-80-6789-0123',
        email: 'claims@uiic.co.in',
      },
    }),
  ]);

  console.log(`✅ Created ${insuranceTPAs.length} insurance/TPAs`);

  // Hash passwords
  const branchPassword = await bcrypt.hash('branch123', 10);
  const validationPassword = await bcrypt.hash('validate123', 10);
  const dispatchPassword = await bcrypt.hash('dispatch123', 10);
  const settlementPassword = await bcrypt.hash('settle123', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);

  // Create users
  const users = await Promise.all([
    // Branch users
    prisma.user.upsert({
      where: { username: 'bng01' },
      update: {},
      create: {
        username: 'bng01',
        password: branchPassword,
        name: 'Jayanagar Branch',
        email: 'bng01@cloudninecare.com',
        role: 'branch',
        branchId: branches[0].id,
      },
    }),
    prisma.user.upsert({
      where: { username: 'bng02' },
      update: {},
      create: {
        username: 'bng02',
        password: branchPassword,
        name: 'OAR Branch',
        email: 'bng02@cloudninecare.com',
        role: 'branch',
        branchId: branches[1].id,
      },
    }),
    prisma.user.upsert({
      where: { username: 'bng03' },
      update: {},
      create: {
        username: 'bng03',
        password: branchPassword,
        name: 'Malleswaram Branch',
        email: 'bng03@cloudninecare.com',
        role: 'branch',
        branchId: branches[2].id,
      },
    }),
    prisma.user.upsert({
      where: { username: 'bng04' },
      update: {},
      create: {
        username: 'bng04',
        password: branchPassword,
        name: 'Bellandur Branch',
        email: 'bng04@cloudninecare.com',
        role: 'branch',
        branchId: branches[3].id,
      },
    }),
    prisma.user.upsert({
      where: { username: 'bng05' },
      update: {},
      create: {
        username: 'bng05',
        password: branchPassword,
        name: 'Indiranagar Branch',
        email: 'bng05@cloudninecare.com',
        role: 'branch',
        branchId: branches[4].id,
      },
    }),
    // Validation team
    prisma.user.upsert({
      where: { username: 'validator1' },
      update: {},
      create: {
        username: 'validator1',
        password: validationPassword,
        name: 'Validation Officer 1',
        email: 'validator1@cloudninecare.com',
        role: 'validation',
      },
    }),
    prisma.user.upsert({
      where: { username: 'validator2' },
      update: {},
      create: {
        username: 'validator2',
        password: validationPassword,
        name: 'Validation Officer 2',
        email: 'validator2@cloudninecare.com',
        role: 'validation',
      },
    }),
    // Dispatch team
    prisma.user.upsert({
      where: { username: 'dispatch1' },
      update: {},
      create: {
        username: 'dispatch1',
        password: dispatchPassword,
        name: 'Dispatch Officer 1',
        email: 'dispatch1@cloudninecare.com',
        role: 'dispatch',
      },
    }),
    prisma.user.upsert({
      where: { username: 'dispatch2' },
      update: {},
      create: {
        username: 'dispatch2',
        password: dispatchPassword,
        name: 'Dispatch Officer 2',
        email: 'dispatch2@cloudninecare.com',
        role: 'dispatch',
      },
    }),
    // Settlement team
    prisma.user.upsert({
      where: { username: 'settlement1' },
      update: {},
      create: {
        username: 'settlement1',
        password: settlementPassword,
        name: 'Settlement Officer 1',
        email: 'settlement1@cloudninecare.com',
        role: 'settlement',
      },
    }),
    prisma.user.upsert({
      where: { username: 'settlement2' },
      update: {},
      create: {
        username: 'settlement2',
        password: settlementPassword,
        name: 'Settlement Officer 2',
        email: 'settlement2@cloudninecare.com',
        role: 'settlement',
      },
    }),
    // Admin
    prisma.user.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        username: 'admin',
        password: adminPassword,
        name: 'System Administrator',
        email: 'admin@cloudninecare.com',
        role: 'admin',
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Create sample cases
  const sampleCases = [
    {
      mrn: 'CN240001',
      patientName: 'Rahul Sharma',
      patientAge: 45,
      patientGender: 'Male',
      admissionDate: new Date('2024-01-15'),
      dischargeDate: new Date('2024-01-18'),
      billAmount: 125000,
      approvedAmount: 120000,
      settledAmount: 0,
      currentStage: 'STAGE_1',
      status: 'pending',
    },
    {
      mrn: 'CN240002',
      patientName: 'Priya Patel',
      patientAge: 32,
      patientGender: 'Female',
      admissionDate: new Date('2024-01-20'),
      dischargeDate: new Date('2024-01-22'),
      billAmount: 85000,
      approvedAmount: 80000,
      settledAmount: 0,
      currentStage: 'STAGE_2',
      status: 'pending',
    },
    {
      mrn: 'CN240003',
      patientName: 'Amit Kumar',
      patientAge: 28,
      patientGender: 'Male',
      admissionDate: new Date('2024-01-25'),
      dischargeDate: new Date('2024-01-28'),
      billAmount: 150000,
      approvedAmount: 145000,
      settledAmount: 145000,
      currentStage: 'STAGE_4',
      status: 'settled',
    },
    {
      mrn: 'CN240004',
      patientName: 'Sneha Reddy',
      patientAge: 35,
      patientGender: 'Female',
      admissionDate: new Date('2024-02-01'),
      dischargeDate: new Date('2024-02-05'),
      billAmount: 200000,
      approvedAmount: 195000,
      settledAmount: 0,
      currentStage: 'STAGE_3',
      status: 'approved',
    },
    {
      mrn: 'CN240005',
      patientName: 'Vikram Singh',
      patientAge: 52,
      patientGender: 'Male',
      admissionDate: new Date('2024-02-10'),
      dischargeDate: new Date('2024-02-14'),
      billAmount: 175000,
      approvedAmount: 0,
      settledAmount: 0,
      currentStage: 'STAGE_1',
      status: 'pending',
    },
  ];

  const createdCases = await Promise.all(
    sampleCases.map((caseData, index) =>
      prisma.case.upsert({
        where: { mrn: caseData.mrn },
        update: {},
        create: {
          ...caseData,
          branchId: branches[index % branches.length].id,
          insuranceTpaId: insuranceTPAs[index % insuranceTPAs.length].id,
          createdById: users[index % 5].id, // Branch users
        },
      })
    )
  );

  console.log(`✅ Created ${createdCases.length} sample cases`);

  console.log('\n🎉 Database seed completed successfully!');
  console.log('\n📋 Demo Credentials:');
  console.log('  Branch: bng01 / branch123');
  console.log('  Validation: validator1 / validate123');
  console.log('  Dispatch: dispatch1 / dispatch123');
  console.log('  Settlement: settlement1 / settle123');
  console.log('  Admin: admin / admin123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
