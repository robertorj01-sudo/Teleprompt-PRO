import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  X,
  ArrowLeft,
  Mail,
  Lock,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Crown,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import {
  auth,
  AuthProviderKey,
  FIREBASE_CONSOLE_AUTH_URL,
  getLastUsedAuthProvider,
  registerWithWorkEmail,
  resendVerificationEmail,
  signInWithApple,
  signInWithGoogle,
  signInWithMicrosoft,
  signInWithWorkEmail,
  signOutUser,
  syncUserProfileToFirestore,
} from '../firebase';
import { AppLanguage } from '../utils/i18n';
import { LicenseStatus, STRIPE_CHECKOUT_URL } from '../types/teleprompter';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: AppLanguage;
  user: User | null;
  licenseStatus: LicenseStatus;
  onOpenUpgradeModal: (feature?: string) => void;
}

type ModalView = 'providers' | 'email' | 'terms' | 'privacy';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  lang,
  user,
  licenseStatus,
  onOpenUpgradeModal,
}) => {
  const isEn = lang === 'en';
  const [view, setView] = useState<ModalView>('providers');
  const [emailMode, setEmailMode] = useState<'register' | 'signin'>('register');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingProvider, setLoadingProvider] = useState<AuthProviderKey | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [needsConsoleSetup, setNeedsConsoleSetup] = useState<boolean>(false);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [lastUsed, setLastUsed] = useState<AuthProviderKey>(() => getLastUsedAuthProvider());
  const [isRefreshingVerification, setIsRefreshingVerification] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLastUsed(getLastUsedAuthProvider());
      setErrorMsg(null);
      setNeedsConsoleSetup(false);
      setInfoMsg(null);
      setView('providers');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const mapAuthError = (err: unknown, providerLabel: string): string => {
    const code = (err as { code?: string })?.code || '';
    setNeedsConsoleSetup(false);

    if (
      code === 'auth/operation-not-allowed' ||
      code === 'auth/configuration-not-found'
    ) {
      setNeedsConsoleSetup(true);
      return isEn
        ? `The ${providerLabel} sign-in provider is not enabled yet in Firebase Console. Enable it under Authentication -> Sign-in method.`
        : `O provedor de login "${providerLabel}" ainda não foi ativado no Firebase Console. Ative-o em Authentication -> Sign-in method.`;
    }
    if (code === 'auth/unauthorized-domain') {
      setNeedsConsoleSetup(true);
      return isEn
        ? 'This domain is not authorized in Firebase Authentication settings. Add it in Firebase Console -> Authentication -> Settings -> Authorized domains.'
        : 'Este domínio ainda não está autorizado no Firebase Authentication. Adicione-o no Firebase Console em Authentication -> Settings -> Authorized domains.';
    }
    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
      return isEn
        ? 'Sign-in window was closed before finishing.'
        : 'A janela de autenticação foi fechada antes de concluir.';
    }
    if (code === 'auth/popup-blocked') {
      return isEn
        ? 'Popup blocked by the browser. Please allow popups for this site and try again.'
        : 'O pop-up de login foi bloqueado pelo navegador. Libere pop-ups para este site e tente novamente.';
    }
    if (code === 'auth/email-already-in-use') {
      return isEn
        ? 'This email is already registered. Switch to "Sign In" below.'
        : 'Este e-mail já está cadastrado. Alterne para "Entrar" logo abaixo.';
    }
    if (code === 'auth/weak-password') {
      return isEn
        ? 'Password must be at least 6 characters long.'
        : 'A senha deve ter pelo menos 6 caracteres.';
    }
    if (code === 'auth/invalid-email') {
      return isEn
        ? 'Please enter a valid email address.'
        : 'Por favor, informe um endereço de e-mail válido.';
    }
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
      return isEn
        ? 'Invalid email or password. Please check your credentials.'
        : 'E-mail ou senha inválidos. Verifique seus dados e tente novamente.';
    }
    if (code === 'auth/account-exists-with-different-credential') {
      return isEn
        ? 'An account already exists with this email using another provider.'
        : 'Já existe uma conta com este e-mail vinculada a outro método de login.';
    }

    return err instanceof Error
      ? err.message
      : isEn
      ? 'Authentication failed. Please try again.'
      : 'Não foi possível autenticar. Tente novamente.';
  };

  const handleOAuthLogin = async (provider: 'google' | 'apple' | 'microsoft') => {
    setErrorMsg(null);
    setInfoMsg(null);
    setNeedsConsoleSetup(false);
    setLoadingProvider(provider);

    const label =
      provider === 'google' ? 'Google' : provider === 'apple' ? 'Apple' : 'Microsoft';

    try {
      if (provider === 'google') {
        await signInWithGoogle();
      } else if (provider === 'apple') {
        await signInWithApple();
      } else {
        await signInWithMicrosoft();
      }
      setLastUsed(provider);
    } catch (err) {
      setErrorMsg(mapAuthError(err, label));
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    setNeedsConsoleSetup(false);

    if (!email.trim() || !password) {
      setErrorMsg(
        isEn ? 'Please enter your email and password.' : 'Preencha seu e-mail e senha.'
      );
      return;
    }

    setLoadingProvider('email');
    try {
      if (emailMode === 'register') {
        await registerWithWorkEmail(fullName, email, password);
        setLastUsed('email');
        setInfoMsg(
          isEn
            ? 'Account created! We sent a verification link to your email. Please verify your inbox to unlock cloud sync.'
            : 'Conta criada com sucesso! Enviamos um link de verificação para o seu e-mail. Confirme sua caixa de entrada para ativar a sincronização.'
        );
      } else {
        await signInWithWorkEmail(email, password);
        setLastUsed('email');
      }
    } catch (err) {
      setErrorMsg(mapAuthError(err, isEn ? 'Email/Password' : 'E-mail e Senha'));
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleRefreshVerification = async () => {
    if (!auth.currentUser) return;
    setIsRefreshingVerification(true);
    setErrorMsg(null);
    setInfoMsg(null);
    try {
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        await syncUserProfileToFirestore(auth.currentUser);
        setInfoMsg(
          isEn
            ? 'Email verified and profile synced!'
            : 'E-mail verificado e perfil sincronizado com sucesso!'
        );
      } else {
        setErrorMsg(
          isEn
            ? 'Your email is not verified yet. Please click the link sent to your inbox.'
            : 'Seu e-mail ainda não foi confirmado. Clique no link enviado para a sua caixa de entrada.'
        );
      }
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : isEn
          ? 'Could not refresh status.'
          : 'Não foi possível verificar o status.'
      );
    } finally {
      setIsRefreshingVerification(false);
    }
  };

  const handleResendVerification = async () => {
    if (!user) return;
    setErrorMsg(null);
    setInfoMsg(null);
    try {
      await resendVerificationEmail(user);
      setInfoMsg(
        isEn
          ? 'Verification email resent! Check your inbox and spam folder.'
          : 'E-mail de verificação reenviado! Verifique sua caixa de entrada e spam.'
      );
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : isEn
          ? 'Please wait a moment before requesting another email.'
          : 'Aguarde alguns instantes antes de solicitar outro e-mail.'
      );
    }
  };

  const handleSignOut = async () => {
    setErrorMsg(null);
    setInfoMsg(null);
    await signOutUser();
  };

  const getProviderDisplay = (providerId?: string) => {
    switch (providerId) {
      case 'google.com':
        return 'Google';
      case 'apple.com':
        return 'Apple';
      case 'microsoft.com':
        return 'Microsoft';
      default:
        return isEn ? 'Work Email' : 'E-mail Corporativo';
    }
  };

  // Signed-in Profile View
  if (user) {
    const primaryProvider = user.providerData?.[0]?.providerId;
    const initials = (user.displayName || user.email || 'TP')
      .slice(0, 2)
      .toUpperCase();

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
        <div className="w-full max-w-md rounded-3xl bg-white text-neutral-900 shadow-2xl p-6 sm:p-7 relative">
          <button
            onClick={onClose}
            aria-label={isEn ? 'Close' : 'Fechar'}
            className="absolute top-4 right-4 p-2 rounded-full text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center mt-1 mb-5">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'Avatar'}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-full object-cover border-2 border-neutral-200 mb-3 shadow-xs"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-neutral-900 text-white flex items-center justify-center text-lg font-bold mb-3 shadow-xs">
                {initials}
              </div>
            )}

            <h2 className="text-xl font-bold text-neutral-900">
              {user.displayName || (isEn ? 'Teleprompter Pro User' : 'Usuário Teleprompter Pro')}
            </h2>
            <p className="text-sm text-neutral-500 break-all">{user.email}</p>

            <div className="flex items-center gap-2 mt-2.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-100 text-neutral-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                {getProviderDisplay(primaryProvider)}
              </span>
              {licenseStatus.isPro ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                  <Crown className="w-3.5 h-3.5 fill-current text-amber-500" />
                  PRO Vitalício
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-100 text-neutral-600">
                  {isEn ? 'Free Plan' : 'Plano Gratuito'}
                </span>
              )}
            </div>
          </div>

          {!user.emailVerified && (
            <div className="mb-4 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2.5">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">
                    {isEn ? 'Email verification pending' : 'Verificação de e-mail pendente'}
                  </p>
                  <p className="text-amber-800 mt-0.5 leading-relaxed">
                    {isEn
                      ? 'Confirm your email address using the link we sent to finish activating your cloud profile.'
                      : 'Confirme seu e-mail no link enviado para concluir a ativação do seu cadastro na nuvem.'}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleRefreshVerification}
                  disabled={isRefreshingVerification}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900 text-white font-semibold hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-60"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingVerification ? 'animate-spin' : ''}`} />
                  <span>{isEn ? 'I verified my email' : 'Já verifiquei'}</span>
                </button>
                <button
                  onClick={handleResendVerification}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-amber-300 text-amber-900 font-semibold hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  <span>{isEn ? 'Resend link' : 'Reenviar e-mail'}</span>
                </button>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {infoMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{infoMsg}</span>
            </div>
          )}

          <div className="space-y-2.5">
            {!licenseStatus.isPro && (
              <div className="flex flex-col gap-2">
                <a
                  href={STRIPE_CHECKOUT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-12 rounded-full bg-[#1a1a1a] hover:bg-neutral-800 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Crown className="w-4 h-4 text-amber-400 fill-current" />
                  <span>
                    {isEn ? 'Upgrade to Teleprompter PRO' : 'Assinar Teleprompter PRO'}
                  </span>
                </a>
                <button
                  onClick={() => {
                    onClose();
                    onOpenUpgradeModal();
                  }}
                  className="w-full h-10 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium text-xs transition-colors cursor-pointer"
                >
                  {isEn ? 'Already have a license key? Activate' : 'Já possui uma chave de licença? Ativar'}
                </button>
              </div>
            )}

            <button
              onClick={handleSignOut}
              className="w-full h-12 rounded-full bg-[#f2f2f2] hover:bg-neutral-200 text-neutral-800 font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{isEn ? 'Sign Out' : 'Sair da Conta'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Helper to style the stacked pill buttons matching the reference figure
  const renderProviderButton = (
    providerKey: 'google' | 'apple' | 'microsoft',
    label: string,
    icon: React.ReactNode
  ) => {
    const isHighlighted = lastUsed === providerKey;
    const isBusy = loadingProvider === providerKey;

    return (
      <button
        type="button"
        disabled={loadingProvider !== null}
        onClick={() => handleOAuthLogin(providerKey)}
        className={`relative w-full h-14 rounded-full font-semibold text-[15px] flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-60 ${
          isHighlighted
            ? 'bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white shadow-sm'
            : 'bg-[#f2f2f2] hover:bg-[#e7e7e7] text-[#111111]'
        }`}
      >
        {isBusy ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <span className="shrink-0 flex items-center justify-center">{icon}</span>
            <span>{label}</span>
          </>
        )}

        {isHighlighted && (
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 px-3 py-1 rounded-xl bg-[#9ef048] text-[#111827] text-[11px] font-bold leading-tight text-center">
            {isEn ? (
              <>
                Last
                <br />
                used
              </>
            ) : (
              <>
                Último
                <br />
                usado
              </>
            )}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-[400px] rounded-3xl bg-white text-neutral-900 shadow-2xl p-6 sm:p-8 relative">
        <button
          onClick={onClose}
          aria-label={isEn ? 'Close' : 'Fechar'}
          className="absolute top-4 right-4 p-2 rounded-full text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {view === 'providers' && (
          <div>
            <div className="text-center mb-6 pr-2">
              <div className="inline-flex items-center gap-1.5 mb-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-xs font-extrabold tracking-wider uppercase text-neutral-500">
                  Teleprompter PRO
                </span>
              </div>
              <h2 className="text-xl font-bold text-neutral-900">
                {isEn ? 'Create your account or sign in' : 'Cadastre-se ou entre'}
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                {isEn
                  ? 'Choose how you want to continue'
                  : 'Escolha uma opção para continuar no Teleprompter PRO'}
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1.5">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
                {needsConsoleSetup && (
                  <a
                    href={FIREBASE_CONSOLE_AUTH_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-rose-900 underline ml-6"
                  >
                    <span>
                      {isEn ? 'Open Firebase Console' : 'Abrir Firebase Console'}
                    </span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}

            <div className="space-y-3">
              {/* 1. Google */}
              {renderProviderButton(
                'google',
                'Google',
                <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27c3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10c5.35 0 9.25-3.67 9.25-9.09c0-1.15-.15-1.81-.15-1.81Z"
                  />
                </svg>
              )}

              {/* 2. Apple */}
              {renderProviderButton(
                'apple',
                'Apple',
                <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M17.05 20.28c-.98.95-2.05.8-3.08.35c-1.09-.46-2.09-.48-3.24 0c-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8c1.18-.24 2.31-.93 3.57-.84c1.51.12 2.65.72 3.4 1.8c-3.12 1.87-2.38 5.98.48 7.13c-.57 1.5-1.31 2.99-2.54 4.09ZM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25c.29 2.58-2.34 4.5-3.74 4.25Z"
                  />
                </svg>
              )}

              {/* 3. Microsoft */}
              {renderProviderButton(
                'microsoft',
                'Microsoft',
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M2 3h9v9H2V3zm11 0h9v9h-9V3zM2 13h9v9H2v-9zm11 0h9v9h-9v-9z"
                  />
                </svg>
              )}

              {/* 4. Work Email */}
              <button
                type="button"
                disabled={loadingProvider !== null}
                onClick={() => {
                  setErrorMsg(null);
                  setInfoMsg(null);
                  setView('email');
                }}
                className={`relative w-full h-14 rounded-full font-semibold text-[15px] flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 ${
                  lastUsed === 'email'
                    ? 'bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white shadow-sm'
                    : 'bg-[#f2f2f2] hover:bg-[#e7e7e7] text-[#111111]'
                }`}
              >
                <span>{isEn ? 'Work Email' : 'Work Email'}</span>
                {lastUsed === 'email' && (
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 px-3 py-1 rounded-xl bg-[#9ef048] text-[#111827] text-[11px] font-bold leading-tight text-center">
                    {isEn ? (
                      <>
                        Last
                        <br />
                        used
                      </>
                    ) : (
                      <>
                        Último
                        <br />
                        usado
                      </>
                    )}
                  </span>
                )}
              </button>
            </div>

            <p className="mt-6 text-center text-[12px] leading-relaxed text-[#6b7280]">
              {isEn ? (
                <>
                  By proceeding, you agree to our{' '}
                  <button
                    type="button"
                    onClick={() => setView('terms')}
                    className="text-neutral-900 font-medium hover:underline cursor-pointer"
                  >
                    Terms
                  </button>{' '}
                  and{' '}
                  <button
                    type="button"
                    onClick={() => setView('privacy')}
                    className="text-neutral-900 font-medium hover:underline cursor-pointer"
                  >
                    Privacy Policy
                  </button>
                </>
              ) : (
                <>
                  Ao continuar, você concorda com nossos{' '}
                  <button
                    type="button"
                    onClick={() => setView('terms')}
                    className="text-neutral-900 font-medium hover:underline cursor-pointer"
                  >
                    Termos
                  </button>{' '}
                  e{' '}
                  <button
                    type="button"
                    onClick={() => setView('privacy')}
                    className="text-neutral-900 font-medium hover:underline cursor-pointer"
                  >
                    Política de Privacidade
                  </button>
                </>
              )}
            </p>
          </div>
        )}

        {view === 'email' && (
          <div>
            <button
              type="button"
              onClick={() => {
                setView('providers');
                setErrorMsg(null);
                setInfoMsg(null);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 mb-4 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isEn ? 'Back' : 'Voltar'}</span>
            </button>

            <h2 className="text-xl font-bold text-neutral-900 mb-1">
              {emailMode === 'register'
                ? isEn
                  ? 'Create account with Work Email'
                  : 'Cadastro com Work Email'
                : isEn
                ? 'Sign in with Work Email'
                : 'Entrar com Work Email'}
            </h2>
            <p className="text-xs text-neutral-500 mb-5">
              {emailMode === 'register'
                ? isEn
                  ? 'Fill in your details to register your Teleprompter PRO account.'
                  : 'Preencha seus dados para criar sua conta no Teleprompter PRO.'
                : isEn
                ? 'Enter your registered email and password.'
                : 'Informe seu e-mail cadastrado e senha.'}
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1.5">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
                {needsConsoleSetup && (
                  <a
                    href={FIREBASE_CONSOLE_AUTH_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-rose-900 underline ml-6"
                  >
                    <span>{isEn ? 'Open Firebase Console' : 'Abrir Firebase Console'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}

            {infoMsg && (
              <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{infoMsg}</span>
              </div>
            )}

            <form onSubmit={handleEmailSubmit} className="space-y-3">
              {emailMode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    {isEn ? 'Full Name' : 'Nome completo'}
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={isEn ? 'Your name' : 'Seu nome'}
                      maxLength={100}
                      className="w-full h-11 pl-10 pr-4 rounded-2xl bg-[#f5f5f5] border border-neutral-200 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  {isEn ? 'Work Email' : 'E-mail profissional'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nome@empresa.com"
                    maxLength={254}
                    className="w-full h-11 pl-10 pr-4 rounded-2xl bg-[#f5f5f5] border border-neutral-200 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  {isEn ? 'Password' : 'Senha'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full h-11 pl-10 pr-4 rounded-2xl bg-[#f5f5f5] border border-neutral-200 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loadingProvider === 'email'}
                className="w-full h-12 rounded-full bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer mt-2 disabled:opacity-60"
              >
                {loadingProvider === 'email' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : emailMode === 'register' ? (
                  isEn ? (
                    'Create Account'
                  ) : (
                    'Criar Conta'
                  )
                ) : isEn ? (
                  'Sign In'
                ) : (
                  'Entrar'
                )}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setEmailMode(emailMode === 'register' ? 'signin' : 'register');
                  setErrorMsg(null);
                  setInfoMsg(null);
                }}
                className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 underline cursor-pointer"
              >
                {emailMode === 'register'
                  ? isEn
                    ? 'Already have an account? Sign in'
                    : 'Já tem uma conta? Entrar'
                  : isEn
                  ? 'Need an account? Create one'
                  : 'Ainda não tem conta? Cadastre-se'}
              </button>
            </div>
          </div>
        )}

        {(view === 'terms' || view === 'privacy') && (
          <div>
            <button
              type="button"
              onClick={() => setView('providers')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 mb-4 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isEn ? 'Back' : 'Voltar'}</span>
            </button>

            <h2 className="text-lg font-bold text-neutral-900 mb-3">
              {view === 'terms'
                ? isEn
                  ? 'Terms of Service'
                  : 'Termos de Uso'
                : isEn
                ? 'Privacy Policy'
                : 'Política de Privacidade'}
            </h2>

            <div className="max-h-64 overflow-y-auto pr-1 text-xs text-neutral-600 space-y-2.5 leading-relaxed">
              {view === 'terms' ? (
                isEn ? (
                  <>
                    <p>
                      Welcome to Teleprompter PRO. By creating an account or using the studio, you agree to use the application responsibly for script editing, video recording, and presentation delivery.
                    </p>
                    <p>
                      Your scripts and recordings belong exclusively to you. PRO lifetime licenses grant access to premium recording filters, studio backdrops, and watermark-free exports.
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      Bem-vindo ao Teleprompter PRO. Ao criar uma conta ou utilizar o estúdio, você concorda em usar o aplicativo de forma responsável para edição de roteiros, gravação de vídeos e apresentações.
                    </p>
                    <p>
                      Seus roteiros e gravações pertencem exclusivamente a você. A licença PRO Vitalícia libera filtros de câmera profissionais, cenários virtuais e exportação de vídeos sem marca d’água.
                    </p>
                  </>
                )
              ) : isEn ? (
                <>
                  <p>
                    We collect only the authentication details provided by your chosen login method (name, verified email, and optional profile photo) to identify your Teleprompter PRO account.
                  </p>
                  <p>
                    Webcam video streams and audio recordings are processed locally in your browser and are never uploaded to third-party servers.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    Coletamos apenas os dados básicos fornecidos pelo método de login escolhido (nome, e-mail verificado e foto de perfil opcional) para identificar sua conta no Teleprompter PRO.
                  </p>
                  <p>
                    O vídeo da sua câmera e as gravações são processados localmente no seu navegador e nunca são enviados para servidores externos.
                  </p>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setView('providers')}
              className="w-full h-11 rounded-full bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white font-semibold text-xs mt-5 cursor-pointer"
            >
              {isEn ? 'Back to sign in' : 'Voltar para o cadastro'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
