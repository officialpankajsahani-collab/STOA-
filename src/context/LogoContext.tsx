import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LogoContextType {
  logoUrl: string | null;
  isCustom: boolean;
  isLoading: boolean;
  uploadLogo: (file: File, updatedBy?: string) => Promise<{ success: boolean; error?: string }>;
  setCustomUrl: (url: string, updatedBy?: string) => Promise<{ success: boolean; error?: string }>;
  resetLogo: (updatedBy?: string) => Promise<{ success: boolean; error?: string }>;
}

const STORAGE_KEY = 'stoa_association_logo_v1';
const LogoContext = createContext<LogoContextType | undefined>(undefined);

// Helper to downscale image if very large to prevent localStorage / network bloat
async function resizeImageToDataUrl(file: File, maxDim: number = 600): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('फ़ाइल पढ़ने में त्रुटि'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('छवि लोड करने में त्रुटि'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Save as clean PNG or high-res WebP
        const dataUrl = canvas.toDataURL('image/png');
        resolve(dataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export const LogoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync with backend on mount
  useEffect(() => {
    let isMounted = true;
    async function fetchServerLogo() {
      try {
        const res = await fetch('/api/settings/logo');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success) {
            if (data.logoUrl) {
              setLogoUrl(data.logoUrl);
              try {
                localStorage.setItem(STORAGE_KEY, data.logoUrl);
              } catch {}
            } else if (!localStorage.getItem(STORAGE_KEY)) {
              setLogoUrl(null);
            }
          }
        }
      } catch (err) {
        console.warn('Could not fetch server logo, using local fallback:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchServerLogo();
    return () => {
      isMounted = false;
    };
  }, []);

  const uploadLogo = async (file: File, updatedBy: string = 'Admin'): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!file.type.startsWith('image/')) {
        return { success: false, error: 'कृपया केवल वैध छवि (PNG, JPG, SVG, WebP) अपलोड करें।' };
      }

      const dataUrl = await resizeImageToDataUrl(file, 600);
      setLogoUrl(dataUrl);

      try {
        localStorage.setItem(STORAGE_KEY, dataUrl);
      } catch (e) {
        console.warn('LocalStorage save failed:', e);
      }

      // Sync with server
      await fetch('/api/settings/logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logoUrl: dataUrl, updatedBy }),
      }).catch((e) => console.warn('Failed to sync logo to server:', e));

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'लोगो अपलोड करने में विफलता' };
    }
  };

  const setCustomUrl = async (url: string, updatedBy: string = 'Admin'): Promise<{ success: boolean; error?: string }> => {
    try {
      const trimmed = url.trim();
      if (!trimmed) {
        return { success: false, error: 'कृपया मान्य छवि URL दर्ज करें।' };
      }

      setLogoUrl(trimmed);
      try {
        localStorage.setItem(STORAGE_KEY, trimmed);
      } catch {}

      await fetch('/api/settings/logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logoUrl: trimmed, updatedBy }),
      }).catch((e) => console.warn('Failed to sync logo url to server:', e));

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'लोगो URL सहेजने में विफलता' };
    }
  };

  const resetLogo = async (updatedBy: string = 'Admin'): Promise<{ success: boolean; error?: string }> => {
    try {
      setLogoUrl(null);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}

      await fetch('/api/settings/logo', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updatedBy }),
      }).catch((e) => console.warn('Failed to reset logo on server:', e));

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'लोगो रीसेट करने में विफलता' };
    }
  };

  return (
    <LogoContext.Provider
      value={{
        logoUrl,
        isCustom: !!logoUrl,
        isLoading,
        uploadLogo,
        setCustomUrl,
        resetLogo,
      }}
    >
      {children}
    </LogoContext.Provider>
  );
};

export const useLogo = (): LogoContextType => {
  const context = useContext(LogoContext);
  if (!context) {
    throw new Error('useLogo must be used within a LogoProvider');
  }
  return context;
};
