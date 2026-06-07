export interface AppErrorMessage {
  title: string;
  message: string;
  code?: string;
}

const firebaseAuthMessages: Record<string, AppErrorMessage> = {
  'auth/email-already-in-use': {
    title: 'Email already registered',
    message: 'This email already has an OWUUU account. Sign in instead, or use a different email address.',
  },
  'auth/invalid-email': {
    title: 'Check the email address',
    message: 'Enter a valid email address, then try again.',
  },
  'auth/weak-password': {
    title: 'Password is too weak',
    message: 'Use at least 6 characters. A mix of letters, numbers, and symbols is better.',
  },
  'auth/missing-password': {
    title: 'Password required',
    message: 'Enter your password to continue.',
  },
  'auth/invalid-credential': {
    title: 'Sign in failed',
    message: 'The email or password does not match an account. Check your details and try again.',
  },
  'auth/user-not-found': {
    title: 'Account not found',
    message: 'No OWUUU account exists for that email address.',
  },
  'auth/wrong-password': {
    title: 'Incorrect password',
    message: 'The password is not correct. Try again or reset your password.',
  },
  'auth/network-request-failed': {
    title: 'Network issue',
    message: 'We could not reach the auth service. Check your connection and try again.',
  },
  'auth/popup-closed-by-user': {
    title: 'Google sign-in cancelled',
    message: 'The Google sign-in window closed before authentication finished.',
  },
  'auth/cancelled-popup-request': {
    title: 'Google sign-in interrupted',
    message: 'Another Google sign-in window opened. Close extra popups and try again.',
  },
  'auth/popup-blocked': {
    title: 'Popup blocked',
    message: 'Allow popups for OWUUU, then try Google sign-in again.',
  },
};

const firebaseAuthPrefixMessages: Array<{ prefix: string; response: AppErrorMessage }> = [
  {
    prefix: 'auth/api-key-not-valid',
    response: {
      title: 'Authentication is not ready',
      message: 'Sign-in is temporarily unavailable. Check the Firebase configuration before going live.',
      code: 'AUTH_CONFIG',
    },
  },
];

export function getErrorCode(error: unknown) {
  if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') {
    return error.code;
  }

  if (error instanceof Error) {
    const match = error.message.match(/\((auth\/[^)]+)\)/);
    return match?.[1];
  }

  return undefined;
}

export function getAuthErrorMessage(error: unknown, fallback: AppErrorMessage): AppErrorMessage {
  const code = getErrorCode(error);
  if (code && firebaseAuthMessages[code]) {
    return { ...firebaseAuthMessages[code], code };
  }

  const prefixMatch = code ? firebaseAuthPrefixMessages.find((item) => code.startsWith(item.prefix)) : undefined;
  if (prefixMatch) {
    return prefixMatch.response;
  }

  return {
    ...fallback,
    code: code && code.length <= 40 ? code : undefined,
  };
}
