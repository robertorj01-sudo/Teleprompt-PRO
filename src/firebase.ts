import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  signOut,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export const FIREBASE_CONSOLE_AUTH_URL = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/providers`;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection to Firestore on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export type AuthProviderKey = 'google' | 'apple' | 'microsoft' | 'email';

export function getLastUsedAuthProvider(): AuthProviderKey {
  const saved = localStorage.getItem('teleprompter_last_auth_provider');
  if (saved === 'google' || saved === 'apple' || saved === 'microsoft' || saved === 'email') {
    return saved;
  }
  return 'google';
}

export function setLastUsedAuthProvider(provider: AuthProviderKey) {
  localStorage.setItem('teleprompter_last_auth_provider', provider);
}

const VALID_PROVIDERS = ['google.com', 'apple.com', 'microsoft.com', 'password'] as const;
type BlueprintProviderId = (typeof VALID_PROVIDERS)[number];

function normalizeProviderId(raw?: string | null): BlueprintProviderId {
  if (raw && (VALID_PROVIDERS as readonly string[]).includes(raw)) {
    return raw as BlueprintProviderId;
  }
  return 'password';
}

// Synchronize verified user profile and isolated PII doc atomically
export async function syncUserProfileToFirestore(user: User, preferredProviderId?: string) {
  // Firestore security rules mandate email_verified == true for writes
  if (!user.emailVerified || !user.email) {
    return;
  }

  const userPath = `users/${user.uid}`;
  const privatePath = `users/${user.uid}/private/info`;
  const userRef = doc(db, 'users', user.uid);
  const privateRef = doc(db, 'users', user.uid, 'private', 'info');

  let existingSnap;
  try {
    existingSnap = await getDoc(userRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, userPath);
  }

  const emailPrefix = user.email.split('@')[0] || 'User';
  const rawName = (user.displayName || emailPrefix).trim();
  const displayName = (rawName.length > 0 ? rawName : 'User').slice(0, 100);
  const providerId = normalizeProviderId(
    preferredProviderId || user.providerData?.[0]?.providerId
  );
  const safeEmail = user.email.trim().slice(0, 254);
  const safePhoto = user.photoURL ? user.photoURL.slice(0, 500) : undefined;

  const batch = writeBatch(db);

  if (!existingSnap.exists()) {
    const profilePayload: Record<string, unknown> = {
      uid: user.uid,
      displayName,
      providerId,
      planType: 'free',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    if (safePhoto) {
      profilePayload.photoURL = safePhoto;
    }

    batch.set(userRef, profilePayload);
    batch.set(privateRef, {
      uid: user.uid,
      email: safeEmail,
      termsAccepted: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } else {
    const updatePayload: Record<string, unknown> = {
      displayName,
      providerId,
      updatedAt: serverTimestamp(),
    };
    if (safePhoto) {
      updatePayload.photoURL = safePhoto;
    }

    batch.update(userRef, updatePayload);
    batch.set(
      privateRef,
      {
        uid: user.uid,
        email: safeEmail,
        termsAccepted: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${userPath} & ${privatePath}`);
  }
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  setLastUsedAuthProvider('google');
  await syncUserProfileToFirestore(result.user, 'google.com');
  return result.user;
}

export async function signInWithApple() {
  const provider = new OAuthProvider('apple.com');
  provider.addScope('email');
  provider.addScope('name');
  const result = await signInWithPopup(auth, provider);
  setLastUsedAuthProvider('apple');
  await syncUserProfileToFirestore(result.user, 'apple.com');
  return result.user;
}

export async function signInWithMicrosoft() {
  const provider = new OAuthProvider('microsoft.com');
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  setLastUsedAuthProvider('microsoft');
  await syncUserProfileToFirestore(result.user, 'microsoft.com');
  return result.user;
}

export async function registerWithWorkEmail(
  fullName: string,
  email: string,
  password: string
) {
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  const trimmedName = fullName.trim().slice(0, 100);
  if (trimmedName) {
    await updateProfile(credential.user, { displayName: trimmedName });
  }
  await sendEmailVerification(credential.user);
  setLastUsedAuthProvider('email');
  return credential.user;
}

export async function signInWithWorkEmail(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
  setLastUsedAuthProvider('email');
  await syncUserProfileToFirestore(credential.user, 'password');
  return credential.user;
}

export async function resendVerificationEmail(user: User) {
  await sendEmailVerification(user);
}

export async function signOutUser() {
  await signOut(auth);
}
