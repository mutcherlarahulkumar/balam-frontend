import * as yup from 'yup';

export const clientSchema = yup.object({
  familyCode: yup.string().required('Family code is required'),
  persCode: yup.string().required('Person code is required'),
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters'),
  dob: yup.string().optional(),
  sex: yup.string().oneOf(['M', 'F', 'O'] as const).optional(),
  mobile: yup.string().optional(),
  email: yup.string().optional().email('Invalid email address'),
  occupation: yup.string().optional(),
  clientType: yup.string().oneOf(['C', 'P', 'N'] as const).optional(),
  address: yup.string().optional(),
});

export type ClientFormData = yup.InferType<typeof clientSchema>;
