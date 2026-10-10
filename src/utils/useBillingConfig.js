import { useEffect, useState } from 'react';
import { fetchBillingConfig } from './checkout';
import { useTranslation } from '../i18n/LanguageContext';
import { defaultCurrency } from '../config/plans';

/** { enabled, testMode, trial, currency, loading } from GET /api/billing/config. `currency` is the one this visitor pays in. */
export function useBillingConfig() {
  const { lang } = useTranslation();
  const [state, setState] = useState({ enabled: false, testMode: false, trial: false, currency: defaultCurrency(lang), loading: true });
  useEffect(() => {
    let active = true;
    fetchBillingConfig().then((config) => {
      if (active) setState({ ...config, currency: config.currency || defaultCurrency(lang), loading: false });
    });
    return () => {
      active = false;
    };
  }, []);
  return state;
}
