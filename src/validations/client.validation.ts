import * as yup from 'yup';

const MOBILE_RE = /^[6-9]\d{9}$/;

export const clientSchema = yup.object({
  familyCode: yup
    .string()
    .required('Family code is required')
    .matches(/^[A-Z0-9]{2,10}$/, 'Invalid family code format'),
  persCode: yup
    .string()
    .required('Person code is required')
    .matches(/^\d{2}$/, 'Person code must be 2 digits (e.g. 01, 02, 03)'),
  name: yup
    .string()
    .required('Full name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(80, 'Name must be at most 80 characters')
    .matches(/^[a-zA-Z\s.'-]+$/, 'Name can only contain letters and spaces'),
  dob: yup
    .string()
    .optional()
    .test('dob', 'Date of birth cannot be in the future', (v) => {
      if (!v) return true;
      return new Date(v) <= new Date();
    })
    .test('dob-age', 'Client must be at least 1 year old', (v) => {
      if (!v) return true;
      const diff = (Date.now() - new Date(v).getTime()) / (1000 * 60 * 60 * 24 * 365);
      return diff >= 1;
    }),
  sex: yup.string().oneOf(['M', 'F', 'O'] as const).optional(),
  mobile: yup
    .string()
    .optional()
    .test('mobile', 'Enter a valid 10-digit mobile number starting with 6–9', (v) =>
      !v || MOBILE_RE.test(v),
    ),
  email: yup
    .string()
    .optional()
    .test('email', 'Enter a valid email address', (v) =>
      !v || yup.string().email().isValidSync(v),
    ),
  occupation: yup.string().optional(),
  clientType: yup.string().oneOf(['C', 'P', 'N'] as const).optional(),
  address: yup.string().optional().max(255, 'Address too long'),
});

export type ClientFormValues = yup.InferType<typeof clientSchema>;
/** @deprecated use ClientFormValues */
export type ClientFormData = ClientFormValues;
