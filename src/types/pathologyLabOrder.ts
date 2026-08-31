export type PathologyLabOrderStatus = 'Ordered' | 'SampleCollected' | 'Processing' | 'ResultEntered' | 'Verified' | 'Reported' | 'Cancelled';

export interface PathologyLabOrderItemDto {
  id: number;
  pathologyTestId: number;
  testNameSnapshot: string;
  testCodeSnapshot: string;
  price: number;
}

export interface PathologyLabOrderDto {
  id: number;
  orderNumber: string;
  orderDate: string;
  status: PathologyLabOrderStatus;
  clinicalNotes?: string;
  patientId: number;
  patientNumber: string;
  patientName: string;
  referringDoctorStaffId?: number | null;
  referringDoctorName?: string | null;
  referringDoctorRegistrationNumber?: string | null;
  referringDoctorSpecialization?: string | null;
  items: PathologyLabOrderItemDto[];
  testCount: number;
  totalOrderValue: number;
}

export interface CreatePathologyLabOrderItemRequest { pathologyTestId: number; }

export interface CreatePathologyLabOrderRequest {
  patientId: number;
  clinicalNotes?: string;
  referringDoctorStaffId?: number | null;
  items: CreatePathologyLabOrderItemRequest[];
}

export interface PathologyLabOrderFilters {
  patientId?: number;
  orderNumber?: string;
  status?: PathologyLabOrderStatus;
  orderDate?: string;
}
