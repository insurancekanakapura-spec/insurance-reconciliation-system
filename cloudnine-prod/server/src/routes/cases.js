const express = require('express');
const { body, query, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate } = require('./auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/documents');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${req.params.id}-${req.params.stage}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPG, PNG, DOC files are allowed.'));
    }
  },
});

// Get all cases with filters
router.get('/', authenticate, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().trim(),
  query('branch').optional(),
  query('stage').optional().isIn(['STAGE_1', 'STAGE_2', 'STAGE_3', 'STAGE_4']),
  query('status').optional().isIn(['pending', 'approved', 'rejected', 'dispatched', 'settled', 'completed']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'ERROR', errors: errors.array() });
  }

  const prisma = req.app.locals.prisma;
  const { page = 1, limit = 20, search, branch, stage, status, insurance } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  try {
    // Build where clause
    const where = {};
    
    // Branch filter (for branch users, only show their branch)
    if (req.user.role === 'branch') {
      where.branchId = req.user.branchId;
    } else if (branch) {
      where.branchId = branch;
    }

    // Other filters
    if (stage) where.currentStage = stage;
    if (status) where.status = status;
    if (insurance) where.insuranceTpaId = insurance;
    
    if (search) {
      where.OR = [
        { mrn: { contains: search, mode: 'insensitive' } },
        { patientName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get cases with pagination
    const [cases, total] = await Promise.all([
      prisma.case.findMany({
        where,
        include: {
          branch: true,
          insuranceTpa: true,
          createdBy: { select: { id: true, name: true, username: true } },
          _count: { select: { documents: true, queries: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.case.count({ where }),
    ]);

    res.json({
      status: 'SUCCESS',
      data: cases,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get cases error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to fetch cases' });
  }
});

// Get case by ID
router.get('/:id', authenticate, async (req, res) => {
  const prisma = req.app.locals.prisma;
  
  try {
    const caseData = await prisma.case.findUnique({
      where: { id: req.params.id },
      include: {
        branch: true,
        insuranceTpa: true,
        createdBy: { select: { id: true, name: true, username: true } },
        documents: true,
        validations: {
          include: {
            reviewedBy: { select: { id: true, name: true, username: true } },
          },
        },
        dispatch: true,
        settlement: {
          include: {
            settledBy: { select: { id: true, name: true, username: true } },
          },
        },
        queries: {
          include: {
            createdBy: { select: { id: true, name: true, username: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        activities: {
          include: {
            user: { select: { id: true, name: true, username: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!caseData) {
      return res.status(404).json({ status: 'ERROR', message: 'Case not found' });
    }

    // Check permission for branch users
    if (req.user.role === 'branch' && caseData.branchId !== req.user.branchId) {
      return res.status(403).json({ status: 'ERROR', message: 'Access denied' });
    }

    res.json({ status: 'SUCCESS', data: caseData });
  } catch (error) {
    console.error('Get case error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to fetch case' });
  }
});

// Create new case
router.post('/', authenticate, [
  body('mrn').trim().notEmpty().withMessage('MRN is required'),
  body('patientName').trim().notEmpty().withMessage('Patient name is required'),
  body('admissionDate').isISO8601().withMessage('Valid admission date is required'),
  body('billAmount').optional().isFloat({ min: 0 }),
  body('insuranceTpaId').optional(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'ERROR', errors: errors.array() });
  }

  const prisma = req.app.locals.prisma;
  const { mrn, patientName, patientAge, patientGender, admissionDate, dischargeDate, billAmount, insuranceTpaId } = req.body;

  try {
    // Check if MRN already exists
    const existingCase = await prisma.case.findUnique({
      where: { mrn },
    });

    if (existingCase) {
      return res.status(409).json({ status: 'ERROR', message: 'Case with this MRN already exists' });
    }

    // Create case
    const newCase = await prisma.case.create({
      data: {
        mrn,
        patientName,
        patientAge: patientAge ? parseInt(patientAge) : null,
        patientGender,
        admissionDate: new Date(admissionDate),
        dischargeDate: dischargeDate ? new Date(dischargeDate) : null,
        billAmount: billAmount ? parseFloat(billAmount) : 0,
        insuranceTpaId,
        branchId: req.user.branchId || req.body.branchId,
        createdById: req.user.userId,
        currentStage: 'STAGE_1',
        status: 'pending',
      },
      include: {
        branch: true,
        insuranceTpa: true,
        createdBy: { select: { id: true, name: true, username: true } },
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        caseId: newCase.id,
        userId: req.user.userId,
        action: 'created',
        description: `Case ${mrn} created for ${patientName}`,
      },
    });

    res.status(201).json({
      status: 'SUCCESS',
      message: 'Case created successfully',
      data: newCase,
    });
  } catch (error) {
    console.error('Create case error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to create case' });
  }
});

// Update case
router.patch('/:id', authenticate, async (req, res) => {
  const prisma = req.app.locals.prisma;
  const { patientName, patientAge, patientGender, admissionDate, dischargeDate, billAmount, insuranceTpaId } = req.body;

  try {
    // Get existing case
    const existingCase = await prisma.case.findUnique({
      where: { id: req.params.id },
    });

    if (!existingCase) {
      return res.status(404).json({ status: 'ERROR', message: 'Case not found' });
    }

    // Check permission
    if (req.user.role === 'branch' && existingCase.branchId !== req.user.branchId) {
      return res.status(403).json({ status: 'ERROR', message: 'Access denied' });
    }

    // Update case
    const updatedCase = await prisma.case.update({
      where: { id: req.params.id },
      data: {
        patientName,
        patientAge: patientAge ? parseInt(patientAge) : undefined,
        patientGender,
        admissionDate: admissionDate ? new Date(admissionDate) : undefined,
        dischargeDate: dischargeDate ? new Date(dischargeDate) : undefined,
        billAmount: billAmount ? parseFloat(billAmount) : undefined,
        insuranceTpaId,
      },
      include: {
        branch: true,
        insuranceTpa: true,
        createdBy: { select: { id: true, name: true, username: true } },
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        caseId: updatedCase.id,
        userId: req.user.userId,
        action: 'updated',
        description: `Case ${updatedCase.mrn} updated`,
      },
    });

    res.json({
      status: 'SUCCESS',
      message: 'Case updated successfully',
      data: updatedCase,
    });
  } catch (error) {
    console.error('Update case error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to update case' });
  }
});

// Delete case
router.delete('/:id', authenticate, async (req, res) => {
  const prisma = req.app.locals.prisma;

  try {
    const existingCase = await prisma.case.findUnique({
      where: { id: req.params.id },
    });

    if (!existingCase) {
      return res.status(404).json({ status: 'ERROR', message: 'Case not found' });
    }

    // Only admin or case creator can delete
    if (req.user.role !== 'admin' && existingCase.createdById !== req.user.userId) {
      return res.status(403).json({ status: 'ERROR', message: 'Access denied' });
    }

    await prisma.case.delete({
      where: { id: req.params.id },
    });

    res.json({ status: 'SUCCESS', message: 'Case deleted successfully' });
  } catch (error) {
    console.error('Delete case error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to delete case' });
  }
});

// Upload document
router.post('/:id/documents/:stage', authenticate, upload.single('document'), async (req, res) => {
  const prisma = req.app.locals.prisma;
  const { type } = req.body;

  try {
    if (!req.file) {
      return res.status(400).json({ status: 'ERROR', message: 'No file uploaded' });
    }

    const caseData = await prisma.case.findUnique({
      where: { id: req.params.id },
    });

    if (!caseData) {
      return res.status(404).json({ status: 'ERROR', message: 'Case not found' });
    }

    // Create document record
    const document = await prisma.document.create({
      data: {
        caseId: req.params.id,
        stage: req.params.stage,
        type: type || 'document',
        fileName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
      },
    });

    // Update case stage if needed
    const stageMap = {
      'STAGE_1': 'STAGE_2',
      'STAGE_2': 'STAGE_3',
      'STAGE_3': 'STAGE_4',
    };

    if (stageMap[caseData.currentStage] === req.params.stage) {
      await prisma.case.update({
        where: { id: req.params.id },
        data: { currentStage: req.params.stage },
      });
    }

    // Log activity
    await prisma.activity.create({
      data: {
        caseId: req.params.id,
        userId: req.user.userId,
        action: 'document_uploaded',
        description: `Document uploaded for stage ${req.params.stage}`,
        metadata: JSON.stringify({ documentId: document.id, fileName: req.file.originalname }),
      },
    });

    res.json({
      status: 'SUCCESS',
      message: 'Document uploaded successfully',
      data: document,
    });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to upload document' });
  }
});

// Bulk upload cases from Excel
router.post('/bulk', authenticate, upload.single('file'), async (req, res) => {
  const prisma = req.app.locals.prisma;
  const XLSX = require('xlsx');

  try {
    if (!req.file) {
      return res.status(400).json({ status: 'ERROR', message: 'No file uploaded' });
    }

    // Read Excel file
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    const results = {
      created: 0,
      errors: [],
    };

    for (const row of data) {
      try {
        // Validate required fields
        if (!row.MRN || !row['Patient Name']) {
          results.errors.push({ row, error: 'MRN and Patient Name are required' });
          continue;
        }

        // Check if case exists
        const existingCase = await prisma.case.findUnique({
          where: { mrn: row.MRN.toString() },
        });

        if (existingCase) {
          results.errors.push({ row, error: `Case with MRN ${row.MRN} already exists` });
          continue;
        }

        // Create case
        await prisma.case.create({
          data: {
            mrn: row.MRN.toString(),
            patientName: row['Patient Name'],
            patientAge: row.Age ? parseInt(row.Age) : null,
            patientGender: row.Gender,
            admissionDate: row['Admission Date'] ? new Date(row['Admission Date']) : new Date(),
            dischargeDate: row['Discharge Date'] ? new Date(row['Discharge Date']) : null,
            billAmount: row['Bill Amount'] ? parseFloat(row['Bill Amount']) : 0,
            branchId: req.user.branchId || req.body.branchId,
            createdById: req.user.userId,
            currentStage: 'STAGE_4',
            status: 'pending',
          },
        });

        results.created++;
      } catch (error) {
        results.errors.push({ row, error: error.message });
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      status: 'SUCCESS',
      message: `Bulk upload completed. ${results.created} cases created.`,
      data: results,
    });
  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to process bulk upload' });
  }
});

module.exports = router;
