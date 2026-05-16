import React, { useState } from 'react';
import { Lead, LeadStatus, LeadSource } from '../../types';
import { Input, Select, Button } from '../ui';

interface LeadFormProps {
  initialData?: Partial<Lead>;
  onSubmit: (data: Partial<Lead>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
  source?: string;
}

const STATUS_OPTIONS = [
  { value: 'New', label: 'New' },
  { value: 'Contacted', label: 'Contacted' },
  { value: 'Qualified', label: 'Qualified' },
  { value: 'Lost', label: 'Lost' },
];

const SOURCE_OPTIONS = [
  { value: 'Website', label: 'Website' },
  { value: 'Instagram', label: 'Instagram' },
  { value: 'Referral', label: 'Referral' },
];

const LeadForm: React.FC<LeadFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    status: (initialData?.status || 'New') as LeadStatus,
    source: (initialData?.source || '') as LeadSource | '',
    notes: initialData?.notes || '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim() || formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    if (!formData.email.match(/^\S+@\S+\.\S+$/)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.source) {
      newErrors.source = 'Source is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        error={errors.name}
        placeholder="Enter lead name"
      />
      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        error={errors.email}
        placeholder="email@example.com"
      />
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Status"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as LeadStatus })}
          options={STATUS_OPTIONS}
        />
        <Select
          label="Source"
          value={formData.source}
          onChange={(e) => setFormData({ ...formData, source: e.target.value as LeadSource })}
          options={SOURCE_OPTIONS}
          placeholder="Select source"
          error={errors.source}
        />
      </div>
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Notes <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          placeholder="Any additional notes..."
          maxLength={500}
          className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
        />
        <p className="text-xs text-gray-400 text-right">{formData.notes.length}/500</p>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {initialData?._id ? 'Update Lead' : 'Create Lead'}
        </Button>
      </div>
    </form>
  );
};

export default LeadForm;
