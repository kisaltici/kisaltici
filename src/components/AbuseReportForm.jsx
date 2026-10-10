import { useState } from 'react';
import { API_BASE_URL } from '../config/api';
import './AbuseReportForm.css';
import { useToast } from './Toast';

const TEXT = {
  tr: {
    title: 'Bildirim formu',
    url: 'Bildirilecek kısa bağlantı',
    urlPlaceholder: 'https://lnk1.tr/aB3xYz',
    reason: 'Neden bildiriyorsun?',
    reasons: {
      phishing: 'Kimlik avı / dolandırıcılık',
      malware: 'Zararlı yazılım',
      illegal: 'Yasa dışı, nefret veya taciz içeriği',
      copyright: 'Telif veya marka hakkı ihlali',
      other: 'Diğer',
    },
    details: 'Ek bilgi (isteğe bağlı)',
    email: 'E-posta (isteğe bağlı, yanıt gerekirse)',
    submit: 'Bildir',
    sending: 'Gönderiliyor',
    done: 'Bildirimin alındı, teşekkürler. İncelenecek.',
    error: 'Bildirim gönderilemedi, lütfen tekrar dene.',
  },
  en: {
    title: 'Report form',
    url: 'Short link to report',
    urlPlaceholder: 'https://lnk1.tr/aB3xYz',
    reason: 'Why are you reporting it?',
    reasons: {
      phishing: 'Phishing / fraud',
      malware: 'Malware',
      illegal: 'Illegal, hateful or harassing content',
      copyright: 'Copyright or trademark infringement',
      other: 'Other',
    },
    details: 'Additional details (optional)',
    email: 'Email (optional, if you need a reply)',
    submit: 'Submit report',
    sending: 'Sending',
    done: 'Your report was received, thank you. It will be reviewed.',
    error: 'The report could not be sent, please try again.',
  },
};

/** Public abuse report form (POST /api/report). Includes a hidden honeypot field for bots. */
function AbuseReportForm({ lang = 'tr' }) {
  const text = TEXT[lang] || TEXT.en;
  const [url, setUrl] = useState('');
  const [reason, setReason] = useState('phishing');
  const [details, setDetails] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | done
  const [error, setError] = useState('');
  const toast = useToast();
  const showError = (message) => {
    setError(message);
    if (message) toast.error(message);
  };

  const submit = async (event) => {
    event.preventDefault();
    showError('');
    setStatus('sending');
    try {
      const res = await fetch(`${API_BASE_URL}/api/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, reason, details, email, website }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        showError(data?.error || text.error);
        setStatus('idle');
        return;
      }
      setStatus('done');
      toast.success(text.done);
    } catch {
      showError(text.error);
      setStatus('idle');
    }
  };

  if (status === 'done') {
    return (
      <div className="abForm" role="status">
        <p className="abDone">{text.done}</p>
      </div>
    );
  }

  return (
    <form className="abForm" onSubmit={submit} noValidate>
      <h2>{text.title}</h2>
      <label className="abField">
        <span>{text.url}</span>
        <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder={text.urlPlaceholder} maxLength={2048} required />
      </label>
      <label className="abField">
        <span>{text.reason}</span>
        <select value={reason} onChange={(e) => setReason(e.target.value)}>
          {Object.entries(text.reasons).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="abField">
        <span>{text.details}</span>
        <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={4} maxLength={2000} />
      </label>
      <label className="abField">
        <span>{text.email}</span>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={200} autoComplete="email" />
      </label>
      {/* Honeypot: hidden from people, bots tend to fill it */}
      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="abHoney"
      />
      <button type="submit" className="abSubmit" disabled={status === 'sending'}>
        {status === 'sending' ? text.sending : text.submit}
      </button>
    </form>
  );
}

export default AbuseReportForm;
