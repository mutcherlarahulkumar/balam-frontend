import * as yup from 'yup';

export const loginSchema = yup.object({
  identifier: yup.string().required('Email or Agent Code is required').min(3),
  password: yup.string().required('Password is required').min(6),
});

export const registerSchema = yup.object({
  name: yup.string().required('Full name is required').min(2).max(80),
  email: yup.string().required('Email is required').email('Enter a valid email address'),
  agentCode: yup.string().required('Agent code is required').min(3).max(20),
  password: yup.string().required('Password is required').min(8).max(72),
  branch: yup.string().required('Branch is required').min(2).max(20),
  mobile: yup
    .string()
    .required('Mobile number is required')
    .matches(/^\d{10}$/, 'Enter a valid 10-digit mobile number'),
  licenceNo: yup.string().required('Licence number is required').min(3).max(100),
});

export const changePasswordSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup.string().required('New password is required').min(8),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('newPassword')], 'Passwords do not match'),
});

export type LoginFormValues = yup.InferType<typeof loginSchema>;
export type RegisterFormValues = yup.InferType<typeof registerSchema>;
export type ChangePasswordFormValues = yup.InferType<typeof changePasswordSchema>;
/** @deprecated */ export type LoginFormData = LoginFormValues;
/** @deprecated */ export type RegisterFormData = RegisterFormValues;
/** @deprecated */ export type ChangePasswordFormData = ChangePasswordFormValues;
