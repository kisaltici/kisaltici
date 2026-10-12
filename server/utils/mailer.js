import nodemailer from 'nodemailer';
import { PLAN_NAMES_TR } from '../config/billing.js';

const SEND_TIMEOUT_MS = 8000;
const ADMIN_NOTIFY_EMAIL = () => process.env.ORDER_NOTIFY_EMAIL || 'kisaltici@gmail.com';

/** Mail is on once SMTP_USER and SMTP_PASS are set (Gmail app password by default). Otherwise every send is a no-op. */
const isMailConfigured = () => Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);

let transporter = null;
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 465,
      secure: (process.env.SMTP_SECURE ?? '1') !== '0',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      connectionTimeout: SEND_TIMEOUT_MS,
      socketTimeout: SEND_TIMEOUT_MS,
    });
  }
  return transporter;
};

const fromAddress = () => `Kısaltıcı <${process.env.SMTP_FROM || process.env.SMTP_USER}>`;

const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const formatDateTr = (date) =>
  new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Istanbul' });

const formatAmount = (amountKurus, currency) => {
  const value = (amountKurus / 100).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return currency === 'USD' ? `$${value}` : `${value} TL`;
};

const send = async (message) => {
  if (!isMailConfigured()) return false;
  try {
    await getTransporter().sendMail({ from: fromAddress(), ...message });
    return true;
  } catch (error) {
    // A mail problem must never break payment confirmation
    console.error('Mail send failed:', error.message);
    return false;
  }
};

/**
 * Purchase mails: a notice to the owner and a receipt to the customer.
 * Always resolves; call it after the subscription is activated (awaited, so it finishes before the function freezes).
 */
export const sendPurchaseEmails = async (order, expiresAt) => {
  if (!isMailConfigured()) return;
  const planName = PLAN_NAMES_TR[order.plan] || order.plan;
  const periodLabel = order.period === 'yearly' ? 'Yıllık' : 'Aylık';
  const amount = formatAmount(order.amountKurus, order.currency);
  const until = expiresAt ? formatDateTr(expiresAt) : '-';
  const testTag = order.testMode ? ' [TEST]' : '';

  const owner = send({
    to: ADMIN_NOTIFY_EMAIL(),
    subject: `Kısaltıcı - Satın Alındı (${planName})${testTag}`,
    text: [
      `Yeni satın alım${order.testMode ? ' (test modu, gerçek ödeme değil)' : ''}`,
      `Paket: ${planName} (${periodLabel})`,
      `Tutar: ${amount}`,
      `Müşteri: ${order.fullName || '-'}`,
      `E-posta: ${order.email || '-'}`,
      `Sipariş no: ${order.orderId}`,
      `Plan bitiş tarihi: ${until}`,
    ].join('\n'),
  });

  const customer = order.email
    ? send({
        to: order.email,
        subject: `Kısaltıcı - Satın Alındı (${planName})`,
        text: [
          `Merhaba ${order.fullName || ''},`.replace(' ,', ','),
          '',
          `${planName} planı satın alımın tamamlandı, teşekkürler.`,
          '',
          `Paket: ${planName} (${periodLabel})`,
          `Tutar: ${amount}`,
          `Sipariş no: ${order.orderId}`,
          `Planın ${until} tarihine kadar geçerli.`,
          '',
          'Süre dolduğunda linklerin çalışmaya devam eder; yeni bağlantı ve QR oluşturmak için planını uzatman gerekir. Plan sayfandan dilediğin zaman uzatabilirsin.',
          '',
          `Sorun yaşarsan bu adrese yazabilirsin: ${process.env.SMTP_FROM || ADMIN_NOTIFY_EMAIL()}`,
          'Kısaltıcı · https://kisaltici.com',
        ].join('\n'),
        html: `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#111">
<p>Merhaba ${escapeHtml(order.fullName || '')},</p>
<p><strong>${escapeHtml(planName)}</strong> planı satın alımın tamamlandı, teşekkürler.</p>
<table style="border-collapse:collapse;margin:12px 0">
<tr><td style="padding:2px 16px 2px 0;color:#666">Paket</td><td>${escapeHtml(planName)} (${periodLabel})</td></tr>
<tr><td style="padding:2px 16px 2px 0;color:#666">Tutar</td><td>${escapeHtml(amount)}</td></tr>
<tr><td style="padding:2px 16px 2px 0;color:#666">Sipariş no</td><td>${escapeHtml(order.orderId)}</td></tr>
<tr><td style="padding:2px 16px 2px 0;color:#666">Geçerlilik</td><td>${escapeHtml(until)} tarihine kadar</td></tr>
</table>
<p>Süre dolduğunda linklerin çalışmaya devam eder; yeni bağlantı ve QR oluşturmak için planını uzatman gerekir. Plan sayfandan dilediğin zaman uzatabilirsin.</p>
<p style="color:#666">Kısaltıcı · <a href="https://kisaltici.com">kisaltici.com</a></p>
</div>`,
      })
    : Promise.resolve(false);

  await Promise.all([owner, customer]);
};
