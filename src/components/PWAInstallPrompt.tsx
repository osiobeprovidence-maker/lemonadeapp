import React, { useEffect, useMemo, useState } from 'react';
import { Download, Share2, Smartphone, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Button } from './ui/Button';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const DISMISS_KEY = 'lemonade_pwa_install_dismissed';
const PROMPT_DELAY_MS = 12000;

const isStandaloneDisplay = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

const isIOS = () => /iphone|ipad|ipod/i.test(window.navigator.userAgent);

export default function PWAInstallPrompt() {
  const location = useLocation();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showManualHelp, setShowManualHelp] = useState(false);
  const canInstallDirectly = !!deferredPrompt;
  const platformIsIOS = useMemo(() => isIOS(), []);
  const shouldSuppressPrompt = location.pathname.startsWith('/story/') || location.pathname.startsWith('/read/');

  useEffect(() => {
    if (shouldSuppressPrompt || isStandaloneDisplay() || localStorage.getItem(DISMISS_KEY) === 'true') return;

    const timer = window.setTimeout(() => setIsVisible(true), PROMPT_DELAY_MS);
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };
    const onAppInstalled = () => {
      localStorage.setItem(DISMISS_KEY, 'true');
      setIsVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, [shouldSuppressPrompt]);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, 'true');
    setIsVisible(false);
  };

  const installApp = async () => {
    if (!deferredPrompt) {
      setShowManualHelp(true);
      return;
    }

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      localStorage.setItem(DISMISS_KEY, 'true');
      setIsVisible(false);
    } else {
      setShowManualHelp(true);
    }
    setDeferredPrompt(null);
  };

  if (shouldSuppressPrompt || !isVisible || isStandaloneDisplay()) return null;

  return (
    <div className="fixed right-4 left-4 bottom-[calc(104px+env(safe-area-inset-bottom))] md:left-auto md:right-6 md:bottom-6 z-[90] max-w-sm">
      <div className="bg-ink-deep border border-white/10 shadow-2xl shadow-black/40 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-lemon-muted text-black flex items-center justify-center shrink-0">
            <Smartphone size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black uppercase tracking-widest text-white">Download Lemonade</p>
                <p className="text-xs text-white/50 font-bold mt-1">
                  Add the app to your phone for faster access and a full-screen reading experience.
                </p>
              </div>
              <button
                type="button"
                onClick={dismiss}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 shrink-0"
                aria-label="Dismiss download prompt"
              >
                <X size={18} />
              </button>
            </div>

            {showManualHelp && (
              <div className="mt-3 rounded-xl bg-white/5 border border-white/5 p-3 text-xs text-white/60 font-semibold leading-relaxed">
                {platformIsIOS ? (
                  <span className="inline-flex gap-1.5">
                    Tap <Share2 size={14} className="mt-0.5 shrink-0" /> in Safari, then choose Add to Home Screen.
                  </span>
                ) : (
                  <span>Open your browser menu and choose Install app or Add to Home screen.</span>
                )}
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <Button type="button" size="sm" onClick={installApp} className="rounded-xl gap-2">
                <Download size={16} />
                {canInstallDirectly ? 'Install App' : 'How to Install'}
              </Button>
              <Button type="button" size="sm" variant="glass" onClick={dismiss} className="rounded-xl">
                Later
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
