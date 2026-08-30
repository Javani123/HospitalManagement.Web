import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, SlidersHorizontal, Edit3, Save, Info } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { ErrorAlert } from '../../../components/common/ErrorAlert';
import type {
  PathologyReferenceRangeDto,
  CreatePathologyReferenceRangeRequest,
  UpdatePathologyReferenceRangeRequest,
} from '../../../types/pathologyReferenceRange';
import type { PathologyTestDto } from '../../../types/pathologyTest';
import type { AppError } from '../../../types/api';

interface ReferenceRangeModalProps {
  isOpen: boolean;
  referenceRange: PathologyReferenceRangeDto | null; // null for Create, range object for Edit
  tests: PathologyTestDto[];
  initialTestId?: number;
  isSubmitting: boolean;
  error: AppError | string | null;
  onClose: () => void;
  onSubmitCreate: (dto: CreatePathologyReferenceRangeRequest) => Promise<void>;
  onSubmitUpdate: (id: number, dto: UpdatePathologyReferenceRangeRequest) => Promise<void>;
  onClearError: () => void;
}

interface FormState {
  pathologyTestId: string;
  gender: string;
  minAge: string;
  maxAge: string;
  ageUnit: string;
  rangeType: 'numeric' | 'qualitative';
  lowValue: string;
  highValue: string;
  textValue: string;
  description: string;
}

interface FormErrors {
  pathologyTestId?: string;
  gender?: string;
  minAge?: string;
  maxAge?: string;
  ageUnit?: string;
  lowValue?: string;
  highValue?: string;
  textValue?: string;
  description?: string;
}

interface RangeFormContentProps {
  referenceRange: PathologyReferenceRangeDto | null;
  tests: PathologyTestDto[];
  initialTestId?: number;
  isSubmitting: boolean;
  error: AppError | string | null;
  onClose: () => void;
  onSubmitCreate: (dto: CreatePathologyReferenceRangeRequest) => Promise<void>;
  onSubmitUpdate: (id: number, dto: UpdatePathologyReferenceRangeRequest) => Promise<void>;
  onClearError: () => void;
}

const RangeFormContent: React.FC<RangeFormContentProps> = ({
  referenceRange,
  tests,
  initialTestId,
  isSubmitting,
  error,
  onClose,
  onSubmitCreate,
  onSubmitUpdate,
  onClearError,
}) => {
  const isEditMode = Boolean(referenceRange);
  const testSelectRef = useRef<HTMLSelectElement>(null);

  const initialTestIdStr = referenceRange
    ? String(referenceRange.pathologyTestId)
    : initialTestId
    ? String(initialTestId)
    : tests[0]
    ? String(tests[0].id)
    : '';

  const isNumericInitial = referenceRange
    ? referenceRange.lowValue != null || referenceRange.highValue != null
    : true;

  const [form, setForm] = useState<FormState>(() => ({
    pathologyTestId: initialTestIdStr,
    gender: referenceRange?.gender || 'Any',
    minAge: referenceRange?.minAge != null ? String(referenceRange.minAge) : '',
    maxAge: referenceRange?.maxAge != null ? String(referenceRange.maxAge) : '',
    ageUnit: referenceRange?.ageUnit || '',
    rangeType: isNumericInitial ? 'numeric' : 'qualitative',
    lowValue: referenceRange?.lowValue != null ? String(referenceRange.lowValue) : '',
    highValue: referenceRange?.highValue != null ? String(referenceRange.highValue) : '',
    textValue: referenceRange?.textValue || '',
    description: referenceRange?.description || '',
  }));

  const [formErrors, setFormErrors] = useState<FormErrors>({});

  useEffect(() => {
    testSelectRef.current?.focus();
  }, []);

  const selectedTest = useMemo(() => {
    const id = Number(form.pathologyTestId);
    return tests.find((t) => t.id === id);
  }, [tests, form.pathologyTestId]);

  const validate = (): boolean => {
    const errors: FormErrors = {};
    const testIdNum = Number(form.pathologyTestId);

    if (!form.pathologyTestId || isNaN(testIdNum) || testIdNum <= 0) {
      errors.pathologyTestId = 'Please select an active diagnostic test.';
    }

    // Age validation
    const hasMinAge = form.minAge.trim() !== '';
    const hasMaxAge = form.maxAge.trim() !== '';
    const minAgeNum = hasMinAge ? Number(form.minAge) : null;
    const maxAgeNum = hasMaxAge ? Number(form.maxAge) : null;

    if (hasMinAge && (isNaN(minAgeNum!) || minAgeNum! < 0)) {
      errors.minAge = 'Min age must be 0 or a positive number.';
    }
    if (hasMaxAge && (isNaN(maxAgeNum!) || maxAgeNum! < 0)) {
      errors.maxAge = 'Max age must be 0 or a positive number.';
    }

    if ((hasMinAge || hasMaxAge) && !form.ageUnit) {
      errors.ageUnit = 'Age unit (Years, Months, Days) is required when age boundary is specified.';
    }

    if (minAgeNum != null && maxAgeNum != null && maxAgeNum < minAgeNum) {
      errors.maxAge = 'Max age must be greater than or equal to Min age.';
    }

    // Value validation
    if (form.rangeType === 'numeric') {
      const hasLow = form.lowValue.trim() !== '';
      const hasHigh = form.highValue.trim() !== '';

      if (!hasLow && !hasHigh) {
        errors.lowValue = 'Numeric low and high bounds are required.';
        errors.highValue = 'Numeric low and high bounds are required.';
      } else if (!hasLow) {
        errors.lowValue = 'Low value is required when high value is specified.';
      } else if (!hasHigh) {
        errors.highValue = 'High value is required when low value is specified.';
      } else {
        const lowNum = Number(form.lowValue);
        const highNum = Number(form.highValue);

        if (isNaN(lowNum)) {
          errors.lowValue = 'Low value must be a valid number.';
        }
        if (isNaN(highNum)) {
          errors.highValue = 'High value must be a valid number.';
        }
        if (!isNaN(lowNum) && !isNaN(highNum) && highNum < lowNum) {
          errors.highValue = 'High value must be greater than or equal to Low value.';
        }
      }
    } else {
      // Qualitative
      const trimmedText = form.textValue.trim();
      if (!trimmedText) {
        errors.textValue = 'Qualitative reference text is required (e.g. "Negative", "Non-reactive").';
      } else if (trimmedText.length > 200) {
        errors.textValue = 'Text value must not exceed 200 characters.';
      }
    }

    if (form.description && form.description.length > 500) {
      errors.description = 'Description must not exceed 500 characters.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

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

    const minAgeVal = form.minAge.trim() !== '' ? Number(form.minAge) : undefined;
    const maxAgeVal = form.maxAge.trim() !== '' ? Number(form.maxAge) : undefined;
    const ageUnitVal = (minAgeVal != null || maxAgeVal != null) && form.ageUnit ? form.ageUnit : undefined;

    const isNum = form.rangeType === 'numeric';
    const lowVal = isNum && form.lowValue.trim() !== '' ? Number(form.lowValue) : undefined;
    const highVal = isNum && form.highValue.trim() !== '' ? Number(form.highValue) : undefined;
    const textVal = !isNum && form.textValue.trim() !== '' ? form.textValue.trim() : undefined;

    if (isEditMode && referenceRange) {
      const updateDto: UpdatePathologyReferenceRangeRequest = {
        pathologyTestId: Number(form.pathologyTestId),
        gender: form.gender,
        minAge: minAgeVal,
        maxAge: maxAgeVal,
        ageUnit: ageUnitVal,
        lowValue: lowVal,
        highValue: highVal,
        textValue: textVal,
        description: form.description.trim() || undefined,
        isActive: referenceRange.isActive ?? true,
      };
      await onSubmitUpdate(referenceRange.id, updateDto);
    } else {
      const createDto: CreatePathologyReferenceRangeRequest = {
        pathologyTestId: Number(form.pathologyTestId),
        gender: form.gender,
        minAge: minAgeVal,
        maxAge: maxAgeVal,
        ageUnit: ageUnitVal,
        lowValue: lowVal,
        highValue: highVal,
        textValue: textVal,
        description: form.description.trim() || undefined,
      };
      await onSubmitCreate(createDto);
    }
  };

  const title = isEditMode ? 'Edit Reference Range' : 'New Reference Range';
  const subtitle = isEditMode
    ? `Update clinical evaluation parameters for test ${referenceRange?.testName || ''}`
    : 'Configure demographic age, gender, and normal reference bounds consumed by diagnostic verification (M12).';

  return (
    <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-2xl p-6 flex flex-col gap-5 z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            {isEditMode ? <Edit3 className="w-5 h-5" /> : <SlidersHorizontal className="w-5 h-5" />}
          </div>
          <div>
            <h2 id="range-modal-title" className="text-base font-bold text-slate-900 leading-snug">
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
        {/* Row 1: Associated Test & Gender */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 flex flex-col gap-1">
            <label htmlFor="range-test" className="text-xs font-semibold text-slate-700">
              Pathology Test <span className="text-rose-500">*</span>
            </label>
            <select
              ref={testSelectRef}
              id="range-test"
              name="pathologyTestId"
              value={form.pathologyTestId}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors ${
                formErrors.pathologyTestId ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
              }`}
            >
              <option value="">— Select Diagnostic Test —</option>
              {tests.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.code}) {t.unit ? `[${t.unit.symbol}]` : '[Qualitative]'}
                </option>
              ))}
            </select>
            {selectedTest && (
              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                <Info className="w-3 h-3 text-blue-500 shrink-0" />
                <span>
                  Specimen: <strong>{selectedTest.sampleType.name}</strong> | Unit:{' '}
                  <strong>{selectedTest.unit ? selectedTest.unit.symbol : 'None (Qualitative)'}</strong>
                </span>
              </p>
            )}
            {formErrors.pathologyTestId && (
              <p className="text-xs text-rose-600 mt-0.5" role="alert">
                {formErrors.pathologyTestId}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="range-gender" className="text-xs font-semibold text-slate-700">
              Target Gender <span className="text-rose-500">*</span>
            </label>
            <select
              id="range-gender"
              name="gender"
              value={form.gender}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors"
            >
              <option value="Any">Any Gender (Unrestricted)</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
        </div>

        {/* Row 2: Demographic Age Range Boundaries */}
        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-800">
              Age Range Demographics (Optional)
            </span>
            <span className="text-[11px] text-slate-500">
              Leave blank if applicable to all age brackets
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="range-min-age" className="text-xs font-medium text-slate-600">
                Min Age (Inclusive)
              </label>
              <input
                id="range-min-age"
                name="minAge"
                type="number"
                min="0"
                placeholder="e.g. 18"
                value={form.minAge}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full px-3 py-1.5 text-sm border rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors ${
                  formErrors.minAge ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
                }`}
              />
              {formErrors.minAge && (
                <p className="text-xs text-rose-600 mt-0.5" role="alert">
                  {formErrors.minAge}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="range-max-age" className="text-xs font-medium text-slate-600">
                Max Age (Inclusive)
              </label>
              <input
                id="range-max-age"
                name="maxAge"
                type="number"
                min="0"
                placeholder="e.g. 65"
                value={form.maxAge}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full px-3 py-1.5 text-sm border rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors ${
                  formErrors.maxAge ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
                }`}
              />
              {formErrors.maxAge && (
                <p className="text-xs text-rose-600 mt-0.5" role="alert">
                  {formErrors.maxAge}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="range-age-unit" className="text-xs font-medium text-slate-600">
                Age Unit
              </label>
              <select
                id="range-age-unit"
                name="ageUnit"
                value={form.ageUnit}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full px-3 py-1.5 text-sm border rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors ${
                  formErrors.ageUnit ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
                }`}
              >
                <option value="">— Select Unit —</option>
                <option value="Years">Years (Adults / General)</option>
                <option value="Months">Months (Infants)</option>
                <option value="Days">Days (Neonatal)</option>
              </select>
              {formErrors.ageUnit && (
                <p className="text-xs text-rose-600 mt-0.5" role="alert">
                  {formErrors.ageUnit}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Row 3: Reference Normal Value Mode (Numeric vs Qualitative) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700">
              Reference Value Type <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, rangeType: 'numeric' }))}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  form.rangeType === 'numeric'
                    ? 'bg-white text-blue-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Numeric Range (Low – High)
              </button>
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, rangeType: 'qualitative' }))}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  form.rangeType === 'qualitative'
                    ? 'bg-white text-blue-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Qualitative Text (Text Finding)
              </button>
            </div>
          </div>

          {form.rangeType === 'numeric' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 bg-blue-50/40 border border-blue-100 rounded-xl">
              <div className="flex flex-col gap-1">
                <label htmlFor="range-low" className="text-xs font-semibold text-slate-700">
                  Normal Low Value {selectedTest?.unit ? `(${selectedTest.unit.symbol})` : ''}{' '}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  id="range-low"
                  name="lowValue"
                  type="number"
                  step="any"
                  placeholder="e.g., 13.5"
                  value={form.lowValue}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={`w-full px-3 py-2 text-sm font-semibold border rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors ${
                    formErrors.lowValue ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
                  }`}
                />
                {formErrors.lowValue && (
                  <p className="text-xs text-rose-600 mt-0.5" role="alert">
                    {formErrors.lowValue}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="range-high" className="text-xs font-semibold text-slate-700">
                  Normal High Value {selectedTest?.unit ? `(${selectedTest.unit.symbol})` : ''}{' '}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  id="range-high"
                  name="highValue"
                  type="number"
                  step="any"
                  placeholder="e.g., 17.5"
                  value={form.highValue}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={`w-full px-3 py-2 text-sm font-semibold border rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors ${
                    formErrors.highValue ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
                  }`}
                />
                {formErrors.highValue && (
                  <p className="text-xs text-rose-600 mt-0.5" role="alert">
                    {formErrors.highValue}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-amber-50/40 border border-amber-100 rounded-xl space-y-2">
              <div className="flex flex-col gap-1">
                <label htmlFor="range-text" className="text-xs font-semibold text-slate-700">
                  Normal Expected Qualitative Text <span className="text-rose-500">*</span>
                </label>
                <input
                  id="range-text"
                  name="textValue"
                  type="text"
                  maxLength={200}
                  placeholder='e.g., "Negative", "Non-reactive", "Normal Clear", "No growth"'
                  value={form.textValue}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors ${
                    formErrors.textValue ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
                  }`}
                />
                {formErrors.textValue && (
                  <p className="text-xs text-rose-600 mt-0.5" role="alert">
                    {formErrors.textValue}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Row 4: Description / Clinical Notes */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label htmlFor="range-description" className="text-xs font-semibold text-slate-700">
              Clinical Interpretation Notes <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <span className="text-[10px] text-slate-400 font-mono">
              {form.description.length}/500
            </span>
          </div>
          <textarea
            id="range-description"
            name="description"
            rows={2}
            maxLength={500}
            placeholder="Clinical significance, methodology variances, or fasting requirements..."
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
            leftIcon={isEditMode ? <Save className="w-4 h-4" /> : <SlidersHorizontal className="w-4 h-4" />}
          >
            {isEditMode ? 'Save Changes' : 'Create Reference Range'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export const ReferenceRangeModal: React.FC<ReferenceRangeModalProps> = (props) => {
  const { isOpen, isSubmitting, onClose, referenceRange } = props;

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
      aria-labelledby="range-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={!isSubmitting ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Render inner form keyed by range id */}
      <RangeFormContent
        key={referenceRange ? `edit-${referenceRange.id}` : 'create-new'}
        {...props}
      />
    </div>
  );
};
