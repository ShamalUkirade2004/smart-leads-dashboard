import { Router } from 'express';
import { getUsers, updateUserRole, deleteUser } from '../controllers/usersController';
import { protect, requireRole } from '../middleware/auth';

const router = Router();

router.use(protect);
router.use(requireRole('admin'));

router.get('/', getUsers);
router.patch('/:id/role', updateUserRole);
router.delete('/:id', deleteUser);

export default router;
