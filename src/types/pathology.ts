import type { BaseEntity } from './api';

// ==========================================
// 1. Pathology Test Category
// ==========================================
export interface PathologyTestCategoryDto extends BaseEntity {
  hospitalId: number;
  name: string;
  code: string;
  description?: string;
}

export interface CreatePathologyTestCategoryDto {
  name: string;
  code: string;
  description?: string;
}

export interface UpdatePathologyTestCategoryDto {
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
}

// ==========================================
// 2. Pathology Sample Type
// ==========================================
export interface PathologySampleTypeDto extends BaseEntity {
  hospitalId: number;
  name: string;
  code: string;
  description?: string;
}

export interface CreatePathologySampleTypeDto {
  name: string;
  code: string;
  description?: string;
}

export interface UpdatePathologySampleTypeDto {
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
}

// ==========================================
// 3. Pathology Test Unit
// ==========================================
export interface PathologyTestUnitDto extends BaseEntity {
  hospitalId: number;
  name: string;
  symbol: string;
  description?: string;
}

export interface CreatePathologyTestUnitDto {
  name: string;
  symbol: string;
  description?: string;
}

export interface UpdatePathologyTestUnitDto {
  name: string;
  symbol: string;
  description?: string;
  isActive: boolean;
}

// ==========================================
// 4. Pathology Test
// ==========================================
export interface PathologyTestDto extends BaseEntity {
  hospitalId: number;
  categoryId: number;
  categoryName?: string;
  sampleTypeId: number;
  sampleTypeName?: string;
  unitId?: number;
  unitSymbol?: string;
  name: string;
  code: string;
  shortName?: string;
  description?: string;
  method?: string;
  price: number;
}

export interface CreatePathologyTestDto {
  categoryId: number;
  sampleTypeId: number;
  unitId?: number;
  name: string;
  code: string;
  shortName?: string;
  description?: string;
  method?: string;
  price: number;
}

export interface UpdatePathologyTestDto {
  categoryId: number;
  sampleTypeId: number;
  unitId?: number;
  name: string;
  code: string;
  shortName?: string;
  description?: string;
  method?: string;
  price: number;
  isActive: boolean;
}

// ==========================================
// 5. Pathology Reference Range
// ==========================================
export type ReferenceRangeGender = 'Both' | 'Male' | 'Female';
export type ReferenceRangeAgeUnit = 'Years' | 'Months' | 'Days';

export interface PathologyReferenceRangeDto extends BaseEntity {
  hospitalId: number;
  testId: number;
  testName?: string;
  gender: ReferenceRangeGender;
  ageMin?: number;
  ageMax?: number;
  ageUnit: ReferenceRangeAgeUnit;
  minVal?: number;
  maxVal?: number;
  textVal?: string;
}

export interface CreatePathologyReferenceRangeDto {
  testId: number;
  gender: ReferenceRangeGender;
  ageMin?: number;
  ageMax?: number;
  ageUnit: ReferenceRangeAgeUnit;
  minVal?: number;
  maxVal?: number;
  textVal?: string;
}

export interface UpdatePathologyReferenceRangeDto {
  gender: ReferenceRangeGender;
  ageMin?: number;
  ageMax?: number;
  ageUnit: ReferenceRangeAgeUnit;
  minVal?: number;
  maxVal?: number;
  textVal?: string;
  isActive: boolean;
}

// ==========================================
// 6. Pathology Lab Order (M9 preview)
// ==========================================
export type PathologyLabOrderStatus = 'Pending' | 'SampleCollected' | 'InProcess' | 'Completed' | 'Cancelled';

export interface PathologyLabOrderItemDto extends BaseEntity {
  orderId: number;
  testId: number;
  testName?: string;
  price: number;
}

export interface PathologyLabOrderDto extends BaseEntity {
  hospitalId: number;
  patientId: number;
  patientName?: string;
  orderNumber: string;
  orderDate: string;
  status: PathologyLabOrderStatus;
  totalAmount: number;
  items: PathologyLabOrderItemDto[];
}

export interface CreatePathologyLabOrderItemDto {
  testId: number;
}

export interface CreatePathologyLabOrderDto {
  patientId: number;
  items: CreatePathologyLabOrderItemDto[];
}
