import * as yup from 'yup';

const MOBILE_RE = /^\d{10,15}$/;

export const loginSchema = yup.object({
  identifier: yup.string().required('Email or Agent Code is required').min(3, 'Must be at least 3 characters'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = yup.object({
  name: yup.string().required('Full name is required').min(2, 'Name must be at least 2 characters').max(80, 'Name must be at most 80 characters'),
  email: yup.string().required('Email is required').email('Enter a valid email address'),
  agentCode: yup.string().required('Agent code is required').min(3, 'Agent code must be at least 3 characters').max(20, 'Agent code must be at most 20 characters'),
  password: yup.string().required('Password is required').min(8, 'Password must be at least 8 characters'),
  branch: yup.string().required('Branch is required').min(2, 'Branch must be at least 2 characters').max(20, 'Branch must be at most 20 characters'),
  mobile: yup.string().required('Mobile number is required').matches(MOBILE_RE, 'Enter a valid 10-digit mobile number'),
  licenceNo: yup.string().required('Licence number is required').min(3, 'Enter a valid LIC licence number').max(100),
});

export const changePasswordSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup.string().required('New password is required').min(8, 'Password must be at least 8 characters'),
  confirmPassword: yup.string().required('Please confirm your password').oneOf([yup.ref('newPassword')], 'Passwords do not match'),
});

export type LoginFormValues = yup.InferType<typeof loginSchema>;
export type RegisterFormValues = yup.InferType<typeof registerSchema>;
export type ChangePasswordFormValues = yup.InferType<typeof changePasswordSchema>;
/** @deprecated use LoginFormValues */
export type LoginFormData = LoginFormValues;
/** @deprecated use RegisterFormValues */
export type RegisterFormData = RegisterFormValues;
/** @deprecated use ChangePasswordFormValues */
export type ChangePasswordFormData = ChangePasswordFormValues;
