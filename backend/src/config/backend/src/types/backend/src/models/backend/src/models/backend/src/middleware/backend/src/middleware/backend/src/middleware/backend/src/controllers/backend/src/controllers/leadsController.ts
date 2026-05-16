import { Response } from 'express';
import { Parser } from 'json2csv';
import Lead from '../models/Lead';
import { AuthRequest } from '../middleware/auth';
import { LeadStatus, LeadSource } from '../types';

const ITEMS_PER_PAGE = 10;

export const getLeads = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      status,
      source,
      search,
      sort = 'latest',
      page = '1',
      limit = String(ITEMS_PER_PAGE),
    } = req.query;

    const currentPage = Math.max(1, parseInt(page as string, 10));
    const itemsLimit = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
    const skip = (currentPage - 1) * itemsLimit;

    const filter: Record<string, unknown> = {};

    if (status && ['New', 'Contacted', 'Qualified', 'Lost'].includes(status as string)) {
      filter.status = status as LeadStatus;
    }

    if (source && ['Website', 'Instagram', 'Referral'].includes(source as string)) {
      filter.source = source as LeadSource;
    }

    if (search && (search as string).trim()) {
      const searchRegex = new RegExp((search as string).trim(), 'i');
      filter.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    const sortOrder = sort === 'oldest' ? 1 : -1;

    const [leads, totalRecords] = await Promise.all([
      Lead.find(filter)
        .populate('createdBy', 'name email role')
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(itemsLimit)
        .lean(),
      Lead.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalRecords / itemsLimit);

    res.status(200).json({
      success: true,
      data: leads,
      meta: {
        currentPage,
        totalPages,
        totalRecords,
        limit: itemsLimit,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch leads' });
  }
};

export const getLeadById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params.id).populate('createdBy', 'name email role');

    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead not found' });
      return;
    }

    res.status(200).json({ success: true, data: lead });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch lead' });
  }
};

export const createLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, status, source, notes } = req.body;

    const lead = await Lead.create({
      name,
      email,
      status: status || 'New',
      source,
      notes,
      createdBy: req.user?.id,
    });

    await lead.populate('createdBy', 'name email role');

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: lead,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create lead' });
  }
};

export const updateLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, status, source, notes } = req.body;

    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead not found' });
      return;
    }

    if (req.user?.role === 'sales' && lead.createdBy.toString() !== req.user.id) {
      res.status(403).json({ success: false, message: 'You can only update your own leads' });
      return;
    }

    const updatedLead = await Lead.findByIdAndUpdate(
      req.params.id,
      { name, email, status, source, notes },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Lead updated successfully',
      data: updatedLead,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update lead' });
  }
};

export const deleteLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead not found' });
      return;
    }

    if (req.user?.role === 'sales' && lead.createdBy.toString() !== req.user.id) {
      res.status(403).json({ success: false, message: 'You can only delete your own leads' });
      return;
    }

    await Lead.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Lead deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete lead' });
  }
};

export const exportLeadsCSV = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, source, search } = req.query;

    const filter: Record<string, unknown> = {};

    if (status && ['New', 'Contacted', 'Qualified', 'Lost'].includes(status as string)) {
      filter.status = status as LeadStatus;
    }

    if (source && ['Website', 'Instagram', 'Referral'].includes(source as string)) {
      filter.source = source as LeadSource;
    }

    if (search && (search as string).trim()) {
      const searchRegex = new RegExp((search as string).trim(), 'i');
      filter.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    const leads = await Lead.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    const fields = [
      { label: 'Name', value: 'name' },
      { label: 'Email', value: 'email' },
      { label: 'Status', value: 'status' },
      { label: 'Source', value: 'source' },
      { label: 'Notes', value: 'notes' },
      { label: 'Created At', value: 'createdAt' },
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(leads);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="leads-${Date.now()}.csv"`);
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to export leads' });
  }
};
