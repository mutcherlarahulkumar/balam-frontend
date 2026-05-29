import * as yup from 'yup';

export const policySchema = yup.object({
  policyNo: yup
    .number()
    .typeError('Policy number must be a number')
    .required('Policy number is required')
    .integer('Policy number must be a whole number')
    .min(100000000, 'LIC policy number must be 9 digits')
    .max(999999999, 'LIC policy number must be 9 digits'),
  familyCode: yup
    .string()
    .required('Family code is required')
    .matches(/^[A-Z0-9]{2,10}$/, 'Invalid family code format'),
  persCode: yup
    .string()
    .required('Person code is required')
    .matches(/^\d{2}$/, 'Person code must be 2 digits'),
  planNo: yup.string().required('Plan is required'),
  issueDate: yup
    .string()
    .required('Issue date is required')
    .test('not-future', 'Issue date cannot be in the future', (v) => {
      if (!v) return true;
      return new Date(v) <= new Date();
    }),
  matDate: yup
    .string()
    .required('Maturity date is required')
    .test('after-issue', 'Maturity date must be after issue date', function (v) {
      const issue = this.parent.issueDate;
      if (!v || !issue) return true;
      return new Date(v) > new Date(issue);
    }),
  term: yup
    .number()
    .typeError('Term must be a number')
    .required('Term is required')
    .integer('Term must be a whole number')
    .min(5, 'Minimum policy term is 5 years')
    .max(40, 'Maximum policy term is 40 years'),
  ppt: yup
    .number()
    .typeError('PPT must be a number')
    .required('Premium paying term is required')
    .integer('PPT must be a whole number')
    .min(1, 'PPT must be at least 1 year')
    .test('ppt-lte-term', 'PPT cannot exceed the policy term', function (v) {
      if (!v) return true;
      return v <= (this.parent.term ?? Infinity);
    }),
  sumAssured: yup
    .number()
    .typeError('Sum assured must be a number')
    .required('Sum assured is required')
    .min(100000, 'Minimum sum assured is ₹1,00,000')
    .test('sa-multiple', 'Sum assured must be a multiple of ₹5,000', (v) =>
      v !== undefined && v % 5000 === 0,
    ),
  premium: yup
    .number()
    .typeError('Premium must be a number')
    .required('Premium is required')
    .min(1000, 'Minimum annual premium is ₹1,000')
    .test('premium-lt-sa', 'Premium cannot exceed sum assured', function (v) {
      if (!v) return true;
      return v < (this.parent.sumAssured ?? Infinity);
    }),
  paymentMode: yup
    .string()
    .oneOf(['Y', 'H', 'Q', 'M', 'S'] as const, 'Select a valid payment mode')
    .required('Payment mode is required'),
  nextPremium: yup
    .string()
    .required('Next premium date is required')
    .test('next-gte-issue', 'Next premium must be on or after issue date', function (v) {
      const issue = this.parent.issueDate;
      if (!v || !issue) return true;
      return new Date(v) >= new Date(issue);
    }),
  nominee: yup
    .string()
    .required('Nominee name is required')
    .min(2, 'Nominee name must be at least 2 characters')
    .matches(/^[a-zA-Z\s.'-]+$/, 'Nominee name can only contain letters and spaces'),
  relation: yup
    .string()
    .required('Relation is required')
    .min(2, 'Specify the relation with nominee'),
  branch: yup.string().optional(),
  neft: yup.string().oneOf(['YES', 'NO'] as const).optional(),
  dab: yup
    .number()
    .typeError('DAB must be a number')
    .optional()
    .min(0, 'DAB cannot be negative'),
  termRider: yup
    .number()
    .typeError('Term Rider must be a number')
    .optional()
    .min(0, 'Term rider cannot be negative'),
});

export type PolicyFormValues = yup.InferType<typeof policySchema>;
/** @deprecated use PolicyFormValues */
export type PolicyFormData = PolicyFormValues;
