import * as yup from 'yup';

export const loanSchema = yup.object({
  policyNo: yup
    .number()
    .typeError('Policy number must be a number')
    .required('Policy number is required')
    .integer()
    .min(100000000, 'LIC policy number must be 9 digits'),
  loanDate: yup
    .string()
    .required('Loan date is required')
    .test('not-future', 'Loan date cannot be in the future', (v) => {
      if (!v) return true;
      return new Date(v) <= new Date();
    }),
  loanAmount: yup
    .number()
    .typeError('Loan amount must be a number')
    .required('Loan amount is required')
    .min(5000, 'Minimum loan amount is ₹5,000')
    .test('multiple', 'Loan amount must be a multiple of ₹1,000', (v) =>
      v !== undefined && v % 1000 === 0,
    ),
  interestDueDate: yup
    .string()
    .required('Interest due date is required')
    .test('after-loan', 'Interest due date must be after loan date', function (v) {
      const loanDate = this.parent.loanDate;
      if (!v || !loanDate) return true;
      return new Date(v) > new Date(loanDate);
    }),
  loanInterest: yup
    .number()
    .typeError('Loan interest must be a number')
    .optional()
    .min(0, 'Interest cannot be negative'),
});

export type LoanFormValues = yup.InferType<typeof loanSchema>;
/** @deprecated use LoanFormValues */
export type LoanFormData = LoanFormValues;
