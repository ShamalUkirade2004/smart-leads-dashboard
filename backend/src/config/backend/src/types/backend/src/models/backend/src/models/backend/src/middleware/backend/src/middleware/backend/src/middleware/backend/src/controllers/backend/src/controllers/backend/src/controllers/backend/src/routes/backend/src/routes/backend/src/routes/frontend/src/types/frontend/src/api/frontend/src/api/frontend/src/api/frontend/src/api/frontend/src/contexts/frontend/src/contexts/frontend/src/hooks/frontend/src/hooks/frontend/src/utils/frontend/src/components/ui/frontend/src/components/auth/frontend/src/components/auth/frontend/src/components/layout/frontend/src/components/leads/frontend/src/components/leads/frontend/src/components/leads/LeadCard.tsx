import React, { useState } from 'react';
import { Pencil, Trash2, Mail, Calendar, User, Globe, ChevronDown, ChevronUp } from 'lucide-react';
import { Lead } from '../../types';
import { Badge, Button, Modal } from '../ui';
import { getStatusVariant, getSourceVariant, formatDate } from '../../utils/helpers';
import { useAuth } from '../../contexts/AuthContext';
import LeadForm from './LeadForm';

interface LeadCardProps {
  lead: Lead;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, data: Partial<Lead>) => Promise<void>;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, onDelete, onUpdate }) => {
  const { user } = useAuth();
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const canModify =
    user?.role === 'admin' || lead.createdBy?._id === user?.id;

  const handleUpdate = async (data: Partial<Lead>) => {
    setIsUpdating(true);
    try {
      await onUpdate(lead._id, data);
      setShowEdit(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(lead._id);
      setShowDelete(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-md transition-all duration-200 animate-fade-in">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="h-10 w-10 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center flex-shrink-0">
              <User className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">{lead.name}</h3>
              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{lead.email}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge variant={getStatusVariant(lead.status)}>{lead.status}</Badge>
            {canModify && (
              <div className="flex gap-1">
                <button
                  onClick={() => setShowEdit(true)}
                  className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/30 rounded-lg transition-colors"
                  title="Edit lead"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setShowDelete(true)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  title="Delete lead"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 mt-3">
          <Badge variant={getSourceVariant(lead.source)}>
            <Globe className="h-3 w-3 mr-1" />
            {lead.source}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(lead.createdAt)}
          </div>
          {lead.createdBy && (
            <div className="text-xs text-gray-400 truncate">
              by {lead.createdBy.name}
            </div>
          )}
        </div>

        {lead.notes && (
          <div className="mt-3">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              {expanded ? 'Hide notes' : 'Show notes'}
            </button>
            {expanded && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                {lead.notes}
              </p>
            )}
          </div>
        )}
      </div>

      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Lead" size="md">
        <LeadForm
          initialData={lead}
          onSubmit={handleUpdate}
          onCancel={() => setShowEdit(false)}
          isLoading={isUpdating}
        />
      </Modal>

      <Modal isOpen={showDelete} onClose={() => setShowDelete(false)} title="Delete Lead" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to delete <strong className="text-gray-900 dark:text-white">{lead.name}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowDelete(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default LeadCard;
