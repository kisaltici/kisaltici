import { useEffect, useState } from 'react';
import { fetchBillingConfig } from './checkout';

/** { enabled, testMode, loading } from GET /api/billing/config. */
export function useBillingConfig() {
  const [state, setState] = useState({ enabled: false, testMode: false, loading: true });
  useEffect(() => {
    let active = true;
    fetchBillingConfig().then((config) => {
      if (active) setState({ ...config, loading: false });
    });
    return () => {
      active = false;
    };
  }, []);
  return state;
}
