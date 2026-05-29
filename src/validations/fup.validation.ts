import * as yup from 'yup';

export const fupUpdateSchema = yup.object({
  policyNo: yup
    .number()
    .typeError('Policy number must be a number')
    .required('Policy number is required')
    .integer('Policy number must be a whole number')
    .min(100000000, 'LIC policy number must be 9 digits'),
  oldFup: yup.string().required('Current FUP date is required'),
  newFup: yup
    .string()
    .required('New FUP date is required')
    .test('different', 'New FUP must be different from current FUP', function (v) {
      return v !== this.parent.oldFup;
    })
    .test('not-too-far', 'New FUP cannot be more than 5 years from today', (v) => {
      if (!v) return true;
      const fiveYearsFromNow = new Date();
      fiveYearsFromNow.setFullYear(fiveYearsFromNow.getFullYear() + 5);
      return new Date(v) <= fiveYearsFromNow;
    }),
  reason: yup.string().optional().max(500, 'Reason must be under 500 characters'),
});

export type FUPUpdateFormValues = yup.InferType<typeof fupUpdateSchema>;
/** @deprecated use FUPUpdateFormValues */
export type FUPUpdateFormData = FUPUpdateFormValues;
