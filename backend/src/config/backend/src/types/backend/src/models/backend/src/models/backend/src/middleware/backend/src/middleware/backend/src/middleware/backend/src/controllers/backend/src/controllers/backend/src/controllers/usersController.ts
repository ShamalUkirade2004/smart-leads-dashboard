import { Response } from 'express';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const getUsers = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, data: users });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role } = req.body;

    if (!['admin', 'sales'].includes(role)) {
      res.status(400).json({ success: false, message: 'Role must be admin or sales' });
      return;
    }

    if (req.params.id === req.user?.id) {
      res.status(400).json({ success: false, message: 'You cannot change your own role' });
      return;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Role updated', data: user });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to update user role' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.params.id === req.user?.id) {
      res.status(400).json({ success: false, message: 'You cannot delete your own account' });
      return;
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
};
