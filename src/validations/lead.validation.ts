import * as yup from 'yup';

const MOBILE_RE = /^[6-9]\d{9}$/;

export const leadSchema = yup.object({
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(80, 'Name must be at most 80 characters')
    .matches(/^[a-zA-Z\s.'-]+$/, 'Name can only contain letters and spaces'),
  mobile: yup
    .string()
    .required('Mobile number is required')
    .matches(MOBILE_RE, 'Enter a valid 10-digit mobile number starting with 6–9'),
  address: yup.string().optional().max(255, 'Address too long'),
  searchTerm: yup.string().optional().max(100, 'Too long'),
});

export type LeadFormValues = yup.InferType<typeof leadSchema>;
/** @deprecated use LeadFormValues */
export type LeadFormData = LeadFormValues;
