import { getPlanCopy } from '../config/plans';
import { useTranslation } from '../i18n/LanguageContext';
import './BillingToggle.css';

/** Monthly / yearly switch shown above plan cards. */
function BillingToggle({ period, onChange }) {
  const { lang } = useTranslation();
  const copy = getPlanCopy(lang);
  const options = [
    { id: 'monthly', label: copy.periodMonthly },
    { id: 'yearly', label: copy.periodYearly },
  ];
  return (
    <div className="billingToggleWrap">
      <div className="billingToggle" role="radiogroup" aria-label={`${copy.periodMonthly} / ${copy.periodYearly}`}>
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={period === option.id}
            className={`billingToggleBtn ${period === option.id ? 'isOn' : ''}`}
            onClick={() => onChange(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <span className="billingToggleBadge">{copy.yearlyBadge}</span>
    </div>
  );
}

export default BillingToggle;
