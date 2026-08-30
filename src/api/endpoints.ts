/**
 * Centralized API endpoints dictionary.
 * Matches backend ASP.NET Core controller routing exactly.
 */
export const API_ENDPOINTS = {
  HEALTH: '/health',
  TENANT: {
    CURRENT: '/tenant/current',
  },
  PATIENTS: {
    BASE: '/patients',
    BY_ID: (id: number) => `/patients/${id}`,
    SEARCH: '/patients/search',
  },
  PATHOLOGY: {
    TEST_CATEGORIES: {
      BASE: '/pathology/test-categories',
      BY_ID: (id: number) => `/pathology/test-categories/${id}`,
    },
    SAMPLE_TYPES: {
      BASE: '/pathology/sample-types',
      BY_ID: (id: number) => `/pathology/sample-types/${id}`,
    },
    TEST_UNITS: {
      BASE: '/pathology/test-units',
      BY_ID: (id: number) => `/pathology/test-units/${id}`,
    },
    TESTS: {
      BASE: '/pathology/tests',
      BY_ID: (id: number) => `/pathology/tests/${id}`,
    },
    REFERENCE_RANGES: {
      BASE: '/pathology/reference-ranges',
      BY_ID: (id: number) => `/pathology/reference-ranges/${id}`,
      BY_TEST: (testId: number) => `/pathology/reference-ranges/test/${testId}`,
    },
    LAB_ORDERS: {
      BASE: '/pathology/lab-orders',
      BY_ID: (id: number) => `/pathology/lab-orders/${id}`,
      BY_NUMBER: (orderNumber: string) => `/pathology/lab-orders/number/${encodeURIComponent(orderNumber)}`,
      SAMPLES: (orderId: number) => `/pathology/lab-orders/${orderId}/samples`,
    },
    SAMPLES: {
      BASE: '/pathology/samples',
      BY_ID: (id: number) => `/pathology/samples/${id}`,
      COLLECT: '/pathology/samples/collect',
      RECEIVE: (id: number) => `/pathology/samples/${id}/receive`,
      REJECT: (id: number) => `/pathology/samples/${id}/reject`,
    },
  },
} as const;
