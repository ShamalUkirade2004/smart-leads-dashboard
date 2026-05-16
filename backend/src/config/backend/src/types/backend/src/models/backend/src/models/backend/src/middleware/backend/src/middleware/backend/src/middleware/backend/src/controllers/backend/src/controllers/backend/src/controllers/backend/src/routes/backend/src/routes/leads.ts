import { Router } from 'express';
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  exportLeadsCSV,
} from '../controllers/leadsController';
import { protect, requireRole } from '../middleware/auth';
import {
  leadValidation,
  updateLeadValidation,
  handleValidationErrors,
} from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(protect);

router.get('/', getLeads);
router.get('/export/csv', exportLeadsCSV);
router.get('/:id', getLeadById);
router.post('/', leadValidation, handleValidationErrors, createLead);
router.put('/:id', updateLeadValidation, handleValidationErrors, updateLead);
router.delete('/:id', requireRole('admin', 'sales'), deleteLead);

export default router;
