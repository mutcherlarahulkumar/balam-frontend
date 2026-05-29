import * as yup from 'yup';

export const leadSchema = yup.object({
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters'),
  mobile: yup
    .string()
    .required('Mobile is required')
    .min(10, 'Mobile must be at least 10 digits'),
  address: yup.string().optional(),
  searchTerm: yup.string().optional(),
});

export type LeadFormData = yup.InferType<typeof leadSchema>;
