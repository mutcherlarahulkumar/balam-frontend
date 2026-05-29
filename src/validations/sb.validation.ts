import * as yup from 'yup';

export const sbSchema = yup.object({
  policyNo: yup
    .number()
    .typeError('Policy number must be a number')
    .required('Policy number is required')
    .integer()
    .min(100000000, 'LIC policy number must be 9 digits'),
  sbDueDate: yup
    .string()
    .required('SB due date is required'),
  sbAmount: yup
    .number()
    .typeError('SB amount must be a number')
    .required('SB amount is required')
    .min(1000, 'Minimum SB amount is ₹1,000')
    .test('multiple', 'Amount must be a multiple of ₹500', (v) =>
      v !== undefined && v % 500 === 0,
    ),
  instalmentNo: yup
    .number()
    .typeError('Instalment number must be a number')
    .required('Instalment number is required')
    .integer()
    .min(1, 'Instalment number starts from 1')
    .max(10, 'Maximum 10 SB instalments'),
});

export const sbMarkPaidSchema = yup.object({
  paidDate: yup
    .string()
    .required('Paid date is required')
    .test('not-future', 'Paid date cannot be in the future', (v) => {
      if (!v) return true;
      return new Date(v) <= new Date();
    }),
  chequeNo: yup
    .string()
    .optional()
    .test('cheque-format', 'Cheque number must be 6 digits', (v) =>
      !v || /^\d{6}$/.test(v),
    ),
});

export type SBFormValues = yup.InferType<typeof sbSchema>;
export type SBMarkPaidFormValues = yup.InferType<typeof sbMarkPaidSchema>;
/** @deprecated use SBFormValues */
export type SBFormData = SBFormValues;
/** @deprecated use SBMarkPaidFormValues */
export type SBMarkPaidFormData = SBMarkPaidFormValues;
