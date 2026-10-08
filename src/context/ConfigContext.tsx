import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  MasterAppConfig,
  ExecutiveOfficer,
  PlantEntity,
  BroadcastTicker,
  DynamicAppFeature,
} from '../types/index.js';
import {
  BUILT_IN_APP_FEATURES,
  mergeAndDiscoverFeatures,
  autoScanAppFeatures,
} from '../utils/featureRegistry.js';

interface ConfigContextType {
  config: MasterAppConfig;
  features: DynamicAppFeature[];
  isLoading: boolean;
  refreshConfig: () => Promise<void>;
  updateConfig: (updates: Partial<MasterAppConfig>, updatedBy?: string) => Promise<{ success: boolean; error?: string }>;
  updateAdminPin: (newPin: string, updatedBy?: string) => Promise<{ success: boolean; error?: string }>;
  updateTicker: (
    text: string,
    type: 'INFO' | 'WARNING' | 'EMERGENCY',
    isActive: boolean,
    updatedBy?: string
  ) => Promise<{ success: boolean; error?: string }>;
  addExecutive: (exec: Omit<ExecutiveOfficer, 'id'>, updatedBy?: string) => Promise<{ success: boolean; error?: string }>;
  updateExecutive: (id: string, updates: Partial<ExecutiveOfficer>, updatedBy?: string) => Promise<{ success: boolean; error?: string }>;
  deleteExecutive: (id: string, updatedBy?: string) => Promise<{ success: boolean; error?: string }>;
  addPlant: (plant: Omit<PlantEntity, 'id'>, updatedBy?: string) => Promise<{ success: boolean; error?: string }>;
  updatePlant: (id: string, updates: Partial<PlantEntity>, updatedBy?: string) => Promise<{ success: boolean; error?: string }>;
  deletePlant: (id: string, updatedBy?: string) => Promise<{ success: boolean; error?: string }>;
  addFeature: (feature: DynamicAppFeature, updatedBy?: string) => Promise<{ success: boolean; error?: string }>;
  updateFeature: (id: string, updates: Partial<DynamicAppFeature>, updatedBy?: string) => Promise<{ success: boolean; error?: string }>;
  deleteFeature: (id: string, updatedBy?: string) => Promise<{ success: boolean; error?: string }>;
  autoScanAndSyncFeatures: (updatedBy?: string) => Promise<{ success: boolean; count: number; error?: string }>;
  updateFeatureField: (featureId: string, fieldKey: string, newValue: any, updatedBy?: string) => Promise<{ success: boolean; error?: string }>;
  downloadSystemSnapshot: () => Promise<void>;
  restoreSystemSnapshot: (snapshot: any, updatedBy?: string) => Promise<{ success: boolean; error?: string }>;
}

const STORAGE_KEY = 'stoa_master_config_v1';

// Initial fallback configuration
const DEFAULT_CONFIG: MasterAppConfig = {
  associationName: 'संबलपुर ट्रक ओनर्स एसोसिएशन',
  tagline: '15-टू-15 आवर्तन एवं डिजिटल लोडिंग प्रबंधन',
  estdYear: '1982',
  regNumber: 'OR/SBP/1982/0488',
  address: 'एसटीओए भवन, जमादारपाली ट्रक टर्मिनल, एनएच-53, संबलपुर, ओडिशा - 768200',
  helplineMobile: '+91 94370 12345',
  emergencyMobile: '112 / 1033 (NHAI) / +91 98610 99999',
  email: 'contact@stoa-sambalpur.org',
  upiId: 'stoa.sambalpur@sbi',

  rotationCycle1Days: '1 से 15 तारीख',
  rotationCycle2Days: '16 से माह अंतिम तारीख',
  rotationJumpPenaltySerials: 50,
  absentGraceHours: 2,
  preserveRotationOnPendingFreight: true,

  heavyFeeAbove18Ton: 700,
  standardFeeUpTo18Ton: 500,
  membership6Months: 1000,
  membership12Months: 1800,
  membership24Months: 3200,

  adminPin: '1234',

  ticker: {
    id: 'tick-001',
    text: '📢 संबलपुर ट्रक ओनर्स एसोसिएशन: 15-टू-15 आवर्तन का कड़ाई से पालन करें। बिना डिजिटल पर्ची के किसी भी प्लांट में लोडिंग वर्जित है। 24x7 कंट्रोल रूम: 9437012345',
    type: 'INFO',
    isActive: true,
    updatedAt: new Date().toISOString(),
  },

  executives: [
    {
      id: 'exec-1',
      name: 'सरदार बलविंदर सिंह (Sardar Balwinder Singh)',
      designation: 'प्रेसिडेंट (अध्यक्ष)',
      mobile: '+91 94370 11111',
      plantInCharge: 'समस्त उद्योग व नीतिगत निर्णय',
      isActive: true,
    },
    {
      id: 'exec-2',
      name: 'श्री निरंजन त्रिपाठी',
      designation: 'महासचिव (General Secretary)',
      mobile: '+91 94370 22222',
      plantInCharge: 'कार्यालय प्रशासन व सदस्यता',
      isActive: true,
    },
    {
      id: 'exec-3',
      name: 'श्री राजेश कुमार अग्रवाल',
      designation: 'कोषाध्यक्ष (Treasurer)',
      mobile: '+91 94370 33333',
      plantInCharge: 'वित्तीय लेखा व 15-टू-15 लेजर',
      isActive: true,
    },
    {
      id: 'exec-4',
      name: 'श्री देवेन्द्र प्रधान',
      designation: 'उपाध्यक्ष (Vice President)',
      mobile: '+91 94370 44444',
      plantInCharge: 'आदित्य बिड़ला लपंगा प्लांट प्रभारी',
      isActive: true,
    },
    {
      id: 'exec-5',
      name: 'श्री सुखविंदर गिल',
      designation: 'संयुक्त सचिव (Joint Secretary)',
      mobile: '+91 94370 55555',
      plantInCharge: 'हिंडाल्को स्मेल्टर हिराकुद प्रभारी',
      isActive: true,
    },
  ],

  plants: [
    {
      id: 'plt-1',
      name: 'हिंडाल्को स्मेल्टर प्लांट',
      code: 'HINDALCO',
      location: 'हिराकुद, संबलपुर',
      dailyCapacity: 180,
      contactPerson: 'श्री एम.के. शर्मा (डिस्पैच हेड)',
      contactMobile: '+91 98610 11001',
      isActive: true,
      destinations: ['रायपुर', 'विशाखापट्टनम', 'हल्दिया', 'नागपुर', 'कटक', 'कोलकाता'],
    },
    {
      id: 'plt-2',
      name: 'आदित्य बिड़ला लपंगा एल्युमिनियम',
      code: 'LAPANGA',
      location: 'लपंगा, संबलपुर',
      dailyCapacity: 220,
      contactPerson: 'श्री आर.एन. मोहंती (लॉजिस्टिक्स)',
      contactMobile: '+91 98610 11002',
      isActive: true,
      destinations: ['झारसुगुड़ा', 'रायपुर', 'राउरकेला', 'बिलासपुर', 'हैदराबाद'],
    },
    {
      id: 'plt-3',
      name: 'वेदांता लिमिटेड',
      code: 'VEDANTA',
      location: 'झारसुगुड़ा (संबलपुर जोन)',
      dailyCapacity: 250,
      contactPerson: 'श्री अमिताभ पांडा',
      contactMobile: '+91 98610 11003',
      isActive: true,
      destinations: ['विशाखापट्टनम पोर्ट', 'हल्दिया', 'पारादीप पोर्ट', 'नागपुर'],
    },
    {
      id: 'plt-4',
      name: 'अन्य इस्पात व सीमेंट उद्योग',
      code: 'OTHER',
      location: 'बरगढ़ / संबलपुर इंडस्ट्रियल जोन',
      dailyCapacity: 90,
      contactPerson: 'कंट्रोल रूम प्रभारी',
      contactMobile: '+91 94370 12345',
      isActive: true,
      destinations: ['संबलपुर लोकल', 'सोनपुर', 'भुवनेश्वर', 'कटक'],
    },
  ],

  dynamicFeatures: [...BUILT_IN_APP_FEATURES],
};

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<MasterAppConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_CONFIG;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshConfig = async () => {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.config) {
          setConfig(data.config);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data.config));
          } catch {}
        }
      }
    } catch (err) {
      console.warn('Config fetch error, using local fallback:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshConfig();
  }, []);

  const updateConfig = async (
    updates: Partial<MasterAppConfig>,
    updatedBy: string = 'Admin'
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates, updatedBy }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'कॉन्फ़िगरेशन सहेजने में विफल' };
      }
      setConfig(data.config);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.config));
      } catch {}
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'नेटवर्क त्रुटि' };
    }
  };

  const updateAdminPin = async (
    newPin: string,
    updatedBy: string = 'Admin'
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/config/pin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPin, updatedBy }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'पिन बदलने में विफल' };
      }
      setConfig((prev) => ({ ...prev, adminPin: newPin }));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'नेटवर्क त्रुटि' };
    }
  };

  const updateTicker = async (
    text: string,
    type: 'INFO' | 'WARNING' | 'EMERGENCY',
    isActive: boolean,
    updatedBy: string = 'Admin'
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/config/ticker', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, type, isActive, updatedBy }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'टिकर अपडेट विफल' };
      }
      setConfig((prev) => ({ ...prev, ticker: data.ticker }));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'नेटवर्क त्रुटि' };
    }
  };

  const addExecutive = async (
    exec: Omit<ExecutiveOfficer, 'id'>,
    updatedBy: string = 'Admin'
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/config/executives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...exec, updatedBy }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'पदाधिकारी जोड़ने में विफल' };
      }
      await refreshConfig();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'नेटवर्क त्रुटि' };
    }
  };

  const updateExecutive = async (
    id: string,
    updates: Partial<ExecutiveOfficer>,
    updatedBy: string = 'Admin'
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`/api/config/executives/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates, updatedBy }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'पदाधिकारी अपडेट विफल' };
      }
      await refreshConfig();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'नेटवर्क त्रुटि' };
    }
  };

  const deleteExecutive = async (
    id: string,
    updatedBy: string = 'Admin'
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`/api/config/executives/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updatedBy }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'हटाने में विफल' };
      }
      await refreshConfig();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'नेटवर्क त्रुटि' };
    }
  };

  const addPlant = async (
    plant: Omit<PlantEntity, 'id'>,
    updatedBy: string = 'Admin'
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/config/plants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...plant, updatedBy }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'प्लांट जोड़ने में विफल' };
      }
      await refreshConfig();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'नेटवर्क त्रुटि' };
    }
  };

  const updatePlant = async (
    id: string,
    updates: Partial<PlantEntity>,
    updatedBy: string = 'Admin'
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`/api/config/plants/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates, updatedBy }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'प्लांट अपडेट विफल' };
      }
      await refreshConfig();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'नेटवर्क त्रुटि' };
    }
  };

  const deletePlant = async (
    id: string,
    updatedBy: string = 'Admin'
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`/api/config/plants/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updatedBy }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'हटाने में विफल' };
      }
      await refreshConfig();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'नेटवर्क त्रुटि' };
    }
  };

  // --- Dynamic Features Management & Auto-Discovery ---
  const features: DynamicAppFeature[] = React.useMemo(() => {
    const list = config.dynamicFeatures && config.dynamicFeatures.length > 0
      ? config.dynamicFeatures
      : BUILT_IN_APP_FEATURES;
    const { merged } = mergeAndDiscoverFeatures(list);
    return merged;
  }, [config.dynamicFeatures]);

  const addFeature = async (
    feature: DynamicAppFeature,
    updatedBy: string = 'Admin'
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/config/features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feature, updatedBy }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'फीचर जोड़ने में विफल' };
      }
      await refreshConfig();
      return { success: true };
    } catch (err: any) {
      // Local fallback
      const updatedList = [...features, feature];
      await updateConfig({ dynamicFeatures: updatedList }, updatedBy);
      return { success: true };
    }
  };

  const updateFeature = async (
    id: string,
    updates: Partial<DynamicAppFeature>,
    updatedBy: string = 'Admin'
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`/api/config/features/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates, updatedBy }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'फीचर अपडेट विफल' };
      }
      await refreshConfig();
      return { success: true };
    } catch (err: any) {
      // Local fallback
      const updatedList = features.map((f) => (f.id === id ? { ...f, ...updates } : f));
      await updateConfig({ dynamicFeatures: updatedList }, updatedBy);
      return { success: true };
    }
  };

  const deleteFeature = async (
    id: string,
    updatedBy: string = 'Admin'
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`/api/config/features/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updatedBy }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'फीचर हटाने में विफल' };
      }
      await refreshConfig();
      return { success: true };
    } catch (err: any) {
      // Local fallback
      const updatedList = features.filter((f) => f.id !== id);
      await updateConfig({ dynamicFeatures: updatedList }, updatedBy);
      return { success: true };
    }
  };

  const autoScanAndSyncFeatures = async (
    updatedBy: string = 'Admin'
  ): Promise<{ success: boolean; count: number; error?: string }> => {
    try {
      const res = await fetch('/api/config/features/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientFeatures: features, updatedBy }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await refreshConfig();
        return { success: true, count: data.newlyDiscoveredCount || 0 };
      }
    } catch (err) {}

    // Client-side auto scan and sync fallback
    const { features: scannedList, newFeatures } = autoScanAppFeatures(features);
    await updateConfig({ dynamicFeatures: scannedList }, updatedBy);
    return { success: true, count: newFeatures.length };
  };

  const updateFeatureField = async (
    featureId: string,
    fieldKey: string,
    newValue: any,
    updatedBy: string = 'Admin'
  ): Promise<{ success: boolean; error?: string }> => {
    const target = features.find((f) => f.id === featureId);
    if (!target) return { success: false, error: 'फीचर नहीं मिला' };

    const updatedFields = (target.fields || []).map((field) =>
      field.key === fieldKey ? { ...field, value: newValue } : field
    );

    return updateFeature(featureId, { fields: updatedFields }, updatedBy);
  };

  const downloadSystemSnapshot = async () => {
    try {
      const res = await fetch('/api/config/snapshot');
      const data = await res.json();
      if (data.success && data.snapshot) {
        const jsonStr = JSON.stringify(data.snapshot, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `STOA_COMPLETE_BACKUP_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Download snapshot error:', err);
    }
  };

  const restoreSystemSnapshot = async (
    snapshot: any,
    updatedBy: string = 'Admin'
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/config/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ snapshot, updatedBy }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'बैकअप रिस्टोर विफल' };
      }
      await refreshConfig();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'नेटवर्क त्रुटि' };
    }
  };

  return (
    <ConfigContext.Provider
      value={{
        config,
        features,
        isLoading,
        refreshConfig,
        updateConfig,
        updateAdminPin,
        updateTicker,
        addExecutive,
        updateExecutive,
        deleteExecutive,
        addPlant,
        updatePlant,
        deletePlant,
        addFeature,
        updateFeature,
        deleteFeature,
        autoScanAndSyncFeatures,
        updateFeatureField,
        downloadSystemSnapshot,
        restoreSystemSnapshot,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = (): ConfigContextType => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};
