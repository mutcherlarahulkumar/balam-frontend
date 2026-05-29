import * as yup from 'yup';

export const familySchema = yup.object({
  familyCode: yup.string().optional(),
  headName: yup
    .string()
    .required('Head name is required')
    .min(2, 'Name must be at least 2 characters'),
  address: yup.string().optional(),
  mobile: yup
    .string()
    .optional()
    .matches(/^[0-9]{10,15}$/, 'Invalid mobile number'),
  email: yup.string().optional().email('Invalid email address'),
  pincode: yup
    .string()
    .optional()
    .matches(/^[0-9]{6}$/, 'Pincode must be 6 digits'),
  religion: yup.string().optional(),
  designation: yup.string().optional(),
});

export type FamilyFormData = yup.InferType<typeof familySchema>;
