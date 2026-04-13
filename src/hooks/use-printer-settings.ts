import { useState, useEffect } from 'react';

export interface PrinterSettings {
  autoPrint: boolean;
  paperSize: '80mm' | '58mm';
  footerText: string;
  connectedDevice: {
    vendorId: number;
    productId: number;
    productName: string;
  } | null;
}

const STORAGE_KEY = 'retail_master_printer_settings';

const defaultSettings: PrinterSettings = {
  autoPrint: false,
  paperSize: '80mm',
  footerText: 'Thank you for shopping with us!',
  connectedDevice: null,
};

export function usePrinterSettings() {
  const [settings, setSettings] = useState<PrinterSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) });
      } catch (e) {
        console.error('Failed to parse printer settings', e);
      }
    }
    setIsLoaded(true);
  }, []);

  const updateSettings = (newSettings: Partial<PrinterSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return { settings, updateSettings, isLoaded };
}
