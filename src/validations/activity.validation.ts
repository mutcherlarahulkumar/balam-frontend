import * as yup from 'yup';

export const activitySchema = yup.object({
  clientId: yup
    .number()
    .typeError('Client ID must be a number')
    .required('Client is required')
    .positive('Select a valid client'),
  activityType: yup
    .string()
    .oneOf(
      ['CALL', 'MEETING', 'DEMO', 'EMAIL', 'PROPOSAL', 'MEDICAL', 'REMINDER'] as const,
      'Select a valid activity type',
    )
    .required('Activity type is required'),
  activityDate: yup
    .string()
    .required('Activity date is required'),
  activityTime: yup.string().optional(),
  details: yup.string().optional().max(1000, 'Details must be under 1000 characters'),
  reminderDate: yup
    .string()
    .optional()
    .test('reminder-gte-activity', 'Reminder date cannot be before activity date', function (v) {
      const actDate = this.parent.activityDate;
      if (!v || !actDate) return true;
      return new Date(v) >= new Date(actDate);
    }),
  reminderTime: yup.string().optional(),
  status: yup
    .string()
    .oneOf(['PENDING', 'DONE', 'CANCELLED'] as const)
    .optional(),
});

export type ActivityFormValues = yup.InferType<typeof activitySchema>;
/** @deprecated use ActivityFormValues */
export type ActivityFormData = ActivityFormValues;
