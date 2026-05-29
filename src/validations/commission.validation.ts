import * as yup from 'yup';

export const commissionSchema = yup.object({
  policyNo: yup
    .number()
    .typeError('Policy number must be a number')
    .required('Policy number is required')
    .integer('Policy number must be a whole number')
    .min(100000000, 'LIC policy number must be 9 digits'),
  billDate: yup
    .string()
    .required('Bill date is required')
    .test('not-future', 'Bill date cannot be in the future', (v) => {
      if (!v) return true;
      return new Date(v) <= new Date();
    }),
  firstComm: yup.number().typeError('Enter a valid amount').min(0, 'Cannot be negative').optional(),
  secondComm: yup.number().typeError('Enter a valid amount').min(0, 'Cannot be negative').optional(),
  thirdComm: yup.number().typeError('Enter a valid amount').min(0, 'Cannot be negative').optional(),
  bonusComm: yup.number().typeError('Enter a valid amount').min(0, 'Cannot be negative').optional(),
  singleComm: yup.number().typeError('Enter a valid amount').min(0, 'Cannot be negative').optional(),
  payDate: yup
    .string()
    .optional()
    .test('pay-gte-bill', 'Pay date must be on or after bill date', function (v) {
      const bill = this.parent.billDate;
      if (!v || !bill) return true;
      return new Date(v) >= new Date(bill);
    }),
});

export type CommissionFormValues = yup.InferType<typeof commissionSchema>;
/** @deprecated use CommissionFormValues */
export type CommissionFormData = CommissionFormValues;
