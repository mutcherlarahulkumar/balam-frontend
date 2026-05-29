import * as yup from 'yup';

const MOBILE_RE = /^[6-9]\d{9}$/;
const PINCODE_RE = /^\d{6}$/;

export const familySchema = yup.object({
  familyCode: yup
    .string()
    .optional()
    .matches(/^[A-Z0-9]{2,10}$/, 'Family code must be 2–10 alphanumeric uppercase characters')
    .transform((v: string) => v || undefined),
  headName: yup
    .string()
    .required('Head name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(80, 'Name must be at most 80 characters')
    .matches(/^[a-zA-Z\s.'-]+$/, 'Name can only contain letters and spaces'),
  address: yup.string().optional().max(255, 'Address too long'),
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
  pincode: yup
    .string()
    .optional()
    .test('pincode', 'Pincode must be exactly 6 digits', (v) => !v || PINCODE_RE.test(v)),
  religion: yup.string().optional(),
  designation: yup.string().optional(),
});

export type FamilyFormValues = yup.InferType<typeof familySchema>;
/** @deprecated use FamilyFormValues */
export type FamilyFormData = FamilyFormValues;
