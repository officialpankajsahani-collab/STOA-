import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface SponsorConfig {
  isEnabled: boolean; // Admin toggle to remove or show anytime
  associationTitle: string;
  systemTitle: string;
  subtitle: string;
  sponsorLabel: string;
  sponsorName: string;
  contactPerson: string;
  logoType: 'original' | 'custom';
  customLogoUrl: string | null;
  truckGraphicEnabled: boolean;
  animationEnabled: boolean;
  footerText: string;
  lastUpdated?: string;
}

export const DEFAULT_SPONSOR_CONFIG: SponsorConfig = {
  isEnabled: true,
  associationTitle: 'संबलपुर STOA',
  systemTitle: '15-टू-15 आवर्तन',
  subtitle: 'NextGen 2026',
  sponsorLabel: 'Sponsors:',
  sponsorName: 'Aaditya Ratan Group',
  contactPerson: '(Pankaj Sahani)',
  logoType: 'original',
  customLogoUrl: null,
  truckGraphicEnabled: true,
  animationEnabled: true,
  footerText: 'संबलपुर ट्रक ओनर्स एसोसिएशन (STOA) • 15-टू-15 आवर्तन प्रणाली',
  lastUpdated: new Date().toISOString(),
};

interface SponsorContextType {
  config: SponsorConfig;
  toggleSponsor: (enabled?: boolean) => void;
  updateConfig: (partial: Partial<SponsorConfig>) => void;
  uploadLogoFile: (file: File) => Promise<{ success: boolean; error?: string }>;
  resetLogoToOriginal: () => void;
  resetAllToDefault: () => void;
}

const SPONSOR_STORAGE_KEY = 'stoa_sponsor_config_v1';
const SponsorContext = createContext<SponsorContextType | undefined>(undefined);

// Helper to resize image to clean data URL to avoid excessive localStorage payload
async function resizeImageToDataUrl(file: File, maxDim: number = 400): Promise<string> {
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
        const dataUrl = canvas.toDataURL('image/png', 0.9);
        resolve(dataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export const SponsorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<SponsorConfig>(() => {
    try {
      const saved = localStorage.getItem(SPONSOR_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_SPONSOR_CONFIG, ...parsed };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_SPONSOR_CONFIG;
  });

  // Save to localStorage whenever config changes
  useEffect(() => {
    try {
      localStorage.setItem(SPONSOR_STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.error('Failed to save sponsor config to localStorage', e);
    }
  }, [config]);

  const toggleSponsor = (enabled?: boolean) => {
    setConfig((prev) => ({
      ...prev,
      isEnabled: enabled !== undefined ? enabled : !prev.isEnabled,
      lastUpdated: new Date().toISOString(),
    }));
  };

  const updateConfig = (partial: Partial<SponsorConfig>) => {
    setConfig((prev) => ({
      ...prev,
      ...partial,
      lastUpdated: new Date().toISOString(),
    }));
  };

  const uploadLogoFile = async (file: File): Promise<{ success: boolean; error?: string }> => {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        return { success: false, error: 'कृपया केवल इमेज फ़ाइल (JPG, PNG, WebP) अपलोड करें' };
      }
      if (file.size > 8 * 1024 * 1024) {
        return { success: false, error: 'फ़ाइल का आकार 8MB से कम होना चाहिए' };
      }

      const dataUrl = await resizeImageToDataUrl(file, 400);
      setConfig((prev) => ({
        ...prev,
        logoType: 'custom',
        customLogoUrl: dataUrl,
        lastUpdated: new Date().toISOString(),
      }));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'लोगो अपलोड करने में त्रुटि' };
    }
  };

  const resetLogoToOriginal = () => {
    setConfig((prev) => ({
      ...prev,
      logoType: 'original',
      customLogoUrl: null,
      lastUpdated: new Date().toISOString(),
    }));
  };

  const resetAllToDefault = () => {
    setConfig({
      ...DEFAULT_SPONSOR_CONFIG,
      lastUpdated: new Date().toISOString(),
    });
  };

  return (
    <SponsorContext.Provider
      value={{
        config,
        toggleSponsor,
        updateConfig,
        uploadLogoFile,
        resetLogoToOriginal,
        resetAllToDefault,
      }}
    >
      {children}
    </SponsorContext.Provider>
  );
};

export const useSponsor = (): SponsorContextType => {
  const context = useContext(SponsorContext);
  if (!context) {
    throw new Error('useSponsor must be used within a SponsorProvider');
  }
  return context;
};
