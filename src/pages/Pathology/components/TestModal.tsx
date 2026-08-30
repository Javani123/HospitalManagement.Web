import React, { useState, useEffect, useRef } from 'react';
import { X, Microscope, Edit3, Save } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { ErrorAlert } from '../../../components/common/ErrorAlert';
import type {
  PathologyTestDto,
  CreatePathologyTestRequest,
  UpdatePathologyTestRequest,
} from '../../../types/pathologyTest';
import type { PathologyTestCategoryDto } from '../../../types/pathologyCategory';
import type { SampleTypeDto } from '../../../types/sampleType';
import type { PathologyUnitDto } from '../../../types/pathologyUnit';
import type { AppError } from '../../../types/api';

interface TestModalProps {
  isOpen: boolean;
  test: PathologyTestDto | null; // null for Create, test object for Edit
  categories: PathologyTestCategoryDto[];
  sampleTypes: SampleTypeDto[];
  units: PathologyUnitDto[];
  isSubmitting: boolean;
  error: AppError | string | null;
  onClose: () => void;
  onSubmitCreate: (dto: CreatePathologyTestRequest) => Promise<void>;
  onSubmitUpdate: (id: number, dto: UpdatePathologyTestRequest) => Promise<void>;
  onClearError: () => void;
}

interface FormState {
  testCategoryId: string;
  sampleTypeId: string;
  unitId: string;
  name: string;
  code: string;
  shortName: string;
  description: string;
  price: string;
}

interface FormErrors {
  testCategoryId?: string;
  sampleTypeId?: string;
  unitId?: string;
  name?: string;
  code?: string;
  shortName?: string;
  description?: string;
  price?: string;
}

interface TestFormContentProps {
  test: PathologyTestDto | null;
  categories: PathologyTestCategoryDto[];
  sampleTypes: SampleTypeDto[];
  units: PathologyUnitDto[];
  isSubmitting: boolean;
  error: AppError | string | null;
  onClose: () => void;
  onSubmitCreate: (dto: CreatePathologyTestRequest) => Promise<void>;
  onSubmitUpdate: (id: number, dto: UpdatePathologyTestRequest) => Promise<void>;
  onClearError: () => void;
}

const TestFormContent: React.FC<TestFormContentProps> = ({
  test,
  categories,
  sampleTypes,
  units,
  isSubmitting,
  error,
  onClose,
  onSubmitCreate,
  onSubmitUpdate,
  onClearError,
}) => {
  const isEditMode = Boolean(test);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>(() => ({
    testCategoryId: test ? String(test.category.id) : (categories[0] ? String(categories[0].id) : ''),
    sampleTypeId: test ? String(test.sampleType.id) : (sampleTypes[0] ? String(sampleTypes[0].id) : ''),
    unitId: test?.unit ? String(test.unit.id) : '',
    name: test?.name || '',
    code: test?.code || '',
    shortName: test?.shortName || '',
    description: test?.description || '',
    price: test ? String(test.price) : '0',
  }));

  const [formErrors, setFormErrors] = useState<FormErrors>({});

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const validate = (): boolean => {
    const errors: FormErrors = {};
    const trimmedName = form.name.trim();
    const trimmedCode = form.code.trim();
    const numCatId = Number(form.testCategoryId);
    const numSampleId = Number(form.sampleTypeId);
    const numPrice = Number(form.price);

    if (!form.testCategoryId || isNaN(numCatId) || numCatId <= 0) {
      errors.testCategoryId = 'Please select a diagnostic category.';
    }

    if (!form.sampleTypeId || isNaN(numSampleId) || numSampleId <= 0) {
      errors.sampleTypeId = 'Please select a required specimen / sample type.';
    }

    if (!trimmedName) {
      errors.name = 'Test name is required.';
    } else if (trimmedName.length > 200) {
      errors.name = 'Test name must not exceed 200 characters.';
    }

    if (!trimmedCode) {
      errors.code = 'Test code is required.';
    } else if (trimmedCode.length > 30) {
      errors.code = 'Test code must not exceed 30 characters.';
    } else if (!/^[A-Za-z0-9_-]+$/.test(trimmedCode)) {
      errors.code = 'Test code must contain only alphanumeric characters, hyphens, or underscores.';
    }

    if (form.shortName && form.shortName.length > 50) {
      errors.shortName = 'Abbreviation / Short name must not exceed 50 characters.';
    }

    if (form.description && form.description.length > 1000) {
      errors.description = 'Description must not exceed 1000 characters.';
    }

    if (form.price === '' || isNaN(numPrice) || numPrice < 0) {
      errors.price = 'Price must be a valid non-negative number (0 or greater).';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const updatedValue = name === 'code' ? value.toUpperCase() : value;

    setForm((prev) => ({ ...prev, [name]: updatedValue }));
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (error) {
      onClearError();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const unitIdValue = form.unitId ? Number(form.unitId) : undefined;
    const priceValue = Number(form.price) || 0;

    if (isEditMode && test) {
      const updateDto: UpdatePathologyTestRequest = {
        testCategoryId: Number(form.testCategoryId),
        sampleTypeId: Number(form.sampleTypeId),
        unitId: unitIdValue,
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        shortName: form.shortName.trim() || undefined,
        description: form.description.trim() || undefined,
        price: priceValue,
        isActive: test.isActive ?? true,
      };
      await onSubmitUpdate(test.id, updateDto);
    } else {
      const createDto: CreatePathologyTestRequest = {
        testCategoryId: Number(form.testCategoryId),
        sampleTypeId: Number(form.sampleTypeId),
        unitId: unitIdValue,
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        shortName: form.shortName.trim() || undefined,
        description: form.description.trim() || undefined,
        price: priceValue,
      };
      await onSubmitCreate(createDto);
    }
  };

  const title = isEditMode ? 'Edit Diagnostic Test' : 'New Diagnostic Test';
  const subtitle = isEditMode
    ? `Update test definitions and parameters for code ${test?.code}`
    : 'Configure a new laboratory diagnostic test with master relationships and pricing.';

  return (
    <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-2xl p-6 flex flex-col gap-5 z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            {isEditMode ? <Edit3 className="w-5 h-5" /> : <Microscope className="w-5 h-5" />}
          </div>
          <div>
            <h2 id="test-modal-title" className="text-base font-bold text-slate-900 leading-snug">
              {title}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Server / Validation Error Alert */}
      {error && <ErrorAlert error={error} onDismiss={onClearError} />}

      {/* Form Body */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Row 1: Test Name & Code */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label htmlFor="test-name" className="text-xs font-semibold text-slate-700">
                Full Test Name <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {form.name.length}/200
              </span>
            </div>
            <input
              ref={nameInputRef}
              id="test-name"
              name="name"
              type="text"
              required
              maxLength={200}
              placeholder="e.g., Complete Blood Count, Fasting Blood Glucose, Serum Creatinine"
              value={form.name}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors ${
                formErrors.name ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
              }`}
            />
            {formErrors.name && (
              <p className="text-xs text-rose-600 mt-0.5" role="alert">
                {formErrors.name}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label htmlFor="test-code" className="text-xs font-semibold text-slate-700">
                Test Code <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {form.code.length}/30
              </span>
            </div>
            <input
              id="test-code"
              name="code"
              type="text"
              required
              maxLength={30}
              placeholder="e.g., CBC, FBG, CREAT"
              value={form.code}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 text-sm font-mono uppercase tracking-wide border rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors ${
                formErrors.code ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
              }`}
            />
            {formErrors.code && (
              <p className="text-xs text-rose-600 mt-0.5" role="alert">
                {formErrors.code}
              </p>
            )}
          </div>
        </div>

        {/* Row 2: Master Relationships (Category, Sample Type, Unit) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Category Dropdown */}
          <div className="flex flex-col gap-1">
            <label htmlFor="test-category" className="text-xs font-semibold text-slate-700">
              Department / Category <span className="text-rose-500">*</span>
            </label>
            <select
              id="test-category"
              name="testCategoryId"
              value={form.testCategoryId}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors ${
                formErrors.testCategoryId ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
              }`}
            >
              <option value="">— Select Category —</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({cat.code})
                </option>
              ))}
            </select>
            {formErrors.testCategoryId && (
              <p className="text-xs text-rose-600 mt-0.5" role="alert">
                {formErrors.testCategoryId}
              </p>
            )}
          </div>

          {/* Sample Type Dropdown */}
          <div className="flex flex-col gap-1">
            <label htmlFor="test-sample-type" className="text-xs font-semibold text-slate-700">
              Specimen / Sample Type <span className="text-rose-500">*</span>
            </label>
            <select
              id="test-sample-type"
              name="sampleTypeId"
              value={form.sampleTypeId}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors ${
                formErrors.sampleTypeId ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
              }`}
            >
              <option value="">— Select Specimen —</option>
              {sampleTypes.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.code})
                </option>
              ))}
            </select>
            {formErrors.sampleTypeId && (
              <p className="text-xs text-rose-600 mt-0.5" role="alert">
                {formErrors.sampleTypeId}
              </p>
            )}
          </div>

          {/* Unit Dropdown */}
          <div className="flex flex-col gap-1">
            <label htmlFor="test-unit" className="text-xs font-semibold text-slate-700">
              Measurement Unit <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <select
              id="test-unit"
              name="unitId"
              value={form.unitId}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors"
            >
              <option value="">— None (Qualitative / Culture) —</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.symbol} — {u.name}
                </option>
              ))}
            </select>
            {formErrors.unitId && (
              <p className="text-xs text-rose-600 mt-0.5" role="alert">
                {formErrors.unitId}
              </p>
            )}
          </div>
        </div>

        {/* Row 3: Short Name & Price */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label htmlFor="test-short-name" className="text-xs font-semibold text-slate-700">
                Short Name / Report Abbreviation <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {form.shortName.length}/50
              </span>
            </div>
            <input
              id="test-short-name"
              name="shortName"
              type="text"
              maxLength={50}
              placeholder="e.g., Hb, FBS, TLC"
              value={form.shortName}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors"
            />
            {formErrors.shortName && (
              <p className="text-xs text-rose-600 mt-0.5" role="alert">
                {formErrors.shortName}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="test-price" className="text-xs font-semibold text-slate-700">
              Test Price / Charge ($) <span className="text-rose-500">*</span>
            </label>
            <input
              id="test-price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              required
              placeholder="0.00"
              value={form.price}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 text-sm font-semibold border rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors ${
                formErrors.price ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
              }`}
            />
            {formErrors.price && (
              <p className="text-xs text-rose-600 mt-0.5" role="alert">
                {formErrors.price}
              </p>
            )}
          </div>
        </div>

        {/* Row 4: Description */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label htmlFor="test-description" className="text-xs font-semibold text-slate-700">
              Clinical Description & Method Notes <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <span className="text-[10px] text-slate-400 font-mono">
              {form.description.length}/1000
            </span>
          </div>
          <textarea
            id="test-description"
            name="description"
            rows={3}
            maxLength={1000}
            placeholder="Clinical purpose, analytical methodology (e.g. Automated Spectrophotometry, Flow Cytometry), prep notes..."
            value={form.description}
            onChange={handleChange}
            disabled={isSubmitting}
            className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 resize-none transition-colors ${
              formErrors.description ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
            }`}
          />
          {formErrors.description && (
            <p className="text-xs text-rose-600 mt-0.5" role="alert">
              {formErrors.description}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            leftIcon={isEditMode ? <Save className="w-4 h-4" /> : <Microscope className="w-4 h-4" />}
          >
            {isEditMode ? 'Save Changes' : 'Create Test'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export const TestModal: React.FC<TestModalProps> = (props) => {
  const { isOpen, isSubmitting, onClose, test } = props;

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="test-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={!isSubmitting ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Render inner form keyed by test id */}
      <TestFormContent
        key={test ? `edit-${test.id}` : 'create-new'}
        {...props}
      />
    </div>
  );
};
