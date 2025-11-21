import toast from 'react-hot-toast';

/**
 * Maps technical Firebase/API error codes to user-friendly messages.
 */
export const getErrorMessage = (error: any): string => {
  if (!error) return 'An unknown error occurred.';

  // Firebase Auth Errors
  if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
    return 'Invalid email or password. Please try again.';
  }
  if (error.code === 'auth/too-many-requests') {
    return 'Too many failed attempts. Please try again later.';
  }
  if (error.code === 'auth/email-already-in-use') {
    return 'This email is already registered.';
  }
  if (error.code === 'auth/weak-password') {
    return 'Password is too weak. Please use a stronger password.';
  }
  if (error.code === 'auth/network-request-failed') {
    return 'Network error. Please check your internet connection.';
  }

  // Firestore / Permission Errors
  if (error.code === 'permission-denied') {
    return 'Access Denied: You do not have permission to perform this action.';
  }
  if (error.code === 'unavailable') {
    return 'Service temporarily unavailable. Please check your connection.';
  }
  if (error.code === 'resource-exhausted') {
    return 'Quota exceeded. Please contact the administrator.';
  }
  if (error.code === 'not-found') {
    return 'The requested resource was not found.';
  }

  // Standard Error Object
  if (error.message) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
};

/**
 * Displays a toast error message based on the error object.
 * @param error The error object caught in try/catch
 * @param fallbackMessage Optional custom message to prepend or replace
 */
export const handleError = (error: any, fallbackMessage?: string) => {
  console.error("App Error:", error);
  const msg = getErrorMessage(error);
  toast.error(fallbackMessage ? `${fallbackMessage}: ${msg}` : msg);
  return msg;
};
