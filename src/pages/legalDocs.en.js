import { SELLER as S } from '../config/legal';

/**
 * English translations of the legal documents, keyed by the Turkish slug (see legalDocs.js).
 * These are courtesy translations: the Turkish texts are the legally binding versions (stated on every English page).
 * Keep them in sync with the Turkish source whenever a legal text changes.
 */
export const LEGAL_DOCS_EN = {
  'satici-bilgileri': {
    title: 'Seller and Contact Information',
    summary: 'Commercial and contact details of the business providing the service.',
    sections: [
      {
        h: 'Business details',
        list: [
          `Service: ${S.brand} (${S.domain}), link shortening, QR code and statistics service`,
          `Name: ${S.unvan}`,
          'Business type: Sole proprietorship',
          `Tax office: ${S.taxOffice}`,
          `Tax ID: ${S.taxNo}`,
          `Address: ${S.address}`,
          `Phone: ${S.phone}`,
          `Email: ${S.email}`,
          `Registered electronic mail (KEP): ${S.kep}`,
          `Website: ${S.site}`,
        ],
      },
      {
        h: 'Support',
        p: [
          `You can write your questions, complaints and refund requests to ${S.email} or call ${S.phone}. Support hours (Türkiye time): weekdays 09:00 – 18:00. The service is available on the website 24/7.`,
        ],
      },
    ],
  },

  'mesafeli-satis-sozlesmesi': {
    title: 'Distance Sales Agreement',
    summary: 'Contract terms for purchasing a subscription plan.',
    sections: [
      {
        h: 'Article 1. Parties',
        p: [
          `SELLER: ${S.unvan}, sole proprietorship, ${S.taxOffice}, tax ID ${S.taxNo}. Address: ${S.address}. Phone: ${S.phone}. Email: ${S.email}. KEP: ${S.kep}.`,
          `BUYER: the person who creates an account on ${S.domain} and buys the service below by entering their name, email, phone and address on the payment page.`,
        ],
      },
      {
        h: 'Article 2. Subject of the agreement',
        p: [
          `This agreement sets out the rights and obligations of the parties under Turkish Consumer Protection Law No. 6502 and the Distance Contracts Regulation, regarding the subscription plan that the BUYER purchases electronically on ${S.domain}, with the features and price stated below.`,
        ],
      },
      {
        h: 'Article 3. Nature and price of the service',
        p: [
          `The service is a digital subscription that renews in monthly or yearly periods, offered as the Starter, Professional or Business plan, including daily link and QR code allowances, statistics history and plan-specific features. The scope and current prices of the plans are shown on the payment page and in the plan list on the site.`,
          `A ${S.trialDays}-day free trial applies once per account on the first subscription. All features of the chosen plan can be used during the trial. The BUYER's payment card details are collected when the trial starts.`,
          `The price is the total shown on the payment page for the chosen plan and period. It is charged in Turkish lira (TRY) for customers in Türkiye and in US dollars (USD) for customers in other countries, as shown on the payment page. With the yearly period, 12 months of service are provided for the price of 10 months. The BUYER sees the total price on the payment page before confirming the order.`,
        ],
      },
      {
        h: 'Article 4. Payment',
        p: [
          `Payment is made by credit or debit card through the PayTR payment infrastructure. Card details are entered on PayTR's secure payment page; the SELLER does not see or store card details. The payment is considered complete when PayTR's confirmation notice reaches the SELLER.`,
          `The BUYER accepts that, when the free trial ends, the period price of the chosen plan will be charged automatically to the card defined at the start of the trial, and that the subscription renews automatically at the end of each period until canceled. Card storage and recurring payments are carried out through the PayTR infrastructure. If a charge fails, the subscription ends and the account returns to the free state (creating new links is closed).`,
        ],
      },
      {
        h: 'Article 5. Performance and term',
        p: [
          `The service is provided electronically; there is no physical delivery. When the card is defined, the chosen plan is assigned to the BUYER's account immediately and the trial starts. The trial lasts ${S.trialDays} days; the paid period starts when the trial ends.`,
          `The BUYER can cancel the subscription at any time before the trial or period ends in the account settings. If canceled within the trial, no fee is charged. If canceled during a period, automatic renewal stops, the BUYER keeps using the service until the end of the paid period and is not charged afterwards. When the subscription ends, the BUYER's links and data are not deleted and existing links keep working; however, an active plan is required to create new links or QR codes.`,
        ],
      },
      {
        h: 'Article 6. Right of withdrawal',
        p: [
          `Under Article 15(1)(ğ) of the Distance Contracts Regulation, the right of withdrawal cannot be exercised in contracts for services performed immediately in electronic form. Because the service starts with the BUYER's approval and is performed immediately (including the trial), the BUYER declares that there is no right of withdrawal, that they were informed before ordering and that they accept this. Refund and cancellation terms are also explained on the "Refund and Cancellation" page.`,
        ],
      },
      {
        h: 'Article 7. Obligations of the seller',
        p: [
          `The SELLER takes reasonable care to provide the service without interruption within the scope of the plan defined in the agreement. The SELLER is not liable for temporary interruptions caused by planned maintenance, failures of third-party infrastructure providers and force majeure, unless the SELLER is at fault. For technical problems caused by the SELLER's fault that make the service unavailable, the BUYER may contact the SELLER; the SELLER fixes the problem or offers a solution such as a time extension or refund as the situation requires.`,
        ],
      },
      {
        h: 'Article 8. Obligations of the buyer',
        p: [
          `The BUYER accepts that the information given on the payment page is correct and up to date and that they will use the service in accordance with the law and the Terms of Use. Phishing, malware distribution, redirects to deceptive or illegal content and misuse of the service are prohibited; if such use is detected, the SELLER may disable the related links or restrict the account.`,
        ],
      },
      {
        h: 'Article 9. Defective service',
        p: [
          `If the service is not provided in line with the stated features, the BUYER's rights under Law No. 6502 are reserved. The BUYER can contact the SELLER through the channels above to use these rights.`,
        ],
      },
      {
        h: 'Article 10. Protection of personal data',
        p: [
          `The BUYER's personal data is processed for the purposes and in the ways described in the "KVKK Privacy Notice" under Law No. 6698 on the Protection of Personal Data.`,
        ],
      },
      {
        h: 'Article 11. Dispute resolution',
        p: [
          `For disputes arising from this agreement, the Consumer Arbitration Committees and Consumer Courts at the BUYER's place of residence or place of transaction are competent, within the monetary limits announced each year by the Ministry of Trade. The BUYER can also submit complaints through the Consumer Information System (TÜBİS) via e-Devlet.`,
        ],
      },
      {
        h: 'Article 12. Entry into force',
        p: [
          `The BUYER completes the order by declaring electronically on the payment page that they have read and approved the preliminary information form and this agreement. The agreement enters into force when the payment is confirmed. A copy of the agreement and the approval record is kept by the SELLER.`,
        ],
      },
    ],
  },

  'on-bilgilendirme-formu': {
    title: 'Pre-Contract Information Form',
    summary: 'The key information you need to know before ordering.',
    sections: [
      {
        h: 'Seller',
        p: [`${S.unvan} (sole proprietorship), ${S.address}. Phone: ${S.phone}, email: ${S.email}, KEP: ${S.kep}.`],
      },
      {
        h: 'Main features of the service',
        p: [
          `Starter, Professional or Business plan; a digital subscription renewed monthly or yearly. Features such as the daily link and QR code allowance, the length of statistics history, custom links and custom QR design vary by plan and are listed on the payment page. A ${S.trialDays}-day free trial applies once per account on the first subscription.`,
        ],
      },
      {
        h: 'Total price and payment',
        p: [
          `The total price for the chosen plan and period is shown on the payment page before you confirm the order, in Turkish lira for customers in Türkiye and in US dollars for customers in other countries. Card details are collected on PayTR's secure payment page and are not stored by the seller. When the trial ends, the plan price is charged automatically from the defined card as a single payment and the subscription renews each period the same way unless canceled. The amount and date charged after the trial are shown in advance on the payment page.`,
        ],
      },
      {
        h: 'Performance and term',
        p: [
          `When the card is defined, the plan is assigned to your account immediately and the trial starts. When the trial ends, the chosen period (one month or one year) starts and renews automatically. You can cancel the subscription in the account settings before the trial or period ends; no fee is charged if you cancel during the trial, and if you cancel during a period you keep using it until the period ends. When the subscription ends, your links keep working; an active plan is required to create new links.`,
        ],
      },
      {
        h: 'Right of withdrawal',
        p: [
          `There is no right of withdrawal for services performed immediately in electronic form (Distance Contracts Regulation Art. 15/1-ğ). Because the subscription you buy (including the trial) starts to be performed immediately with your approval, you do not have a right of withdrawal. Refund terms for duplicate or incorrect charges and for cases where the service cannot be provided are on the "Refund and Cancellation" page.`,
        ],
      },
      {
        h: 'Complaints and applications',
        p: [
          `You can use ${S.email} or ${S.phone} for complaints and requests. For disputes, you can apply to the Consumer Arbitration Committee or Consumer Court at your place of residence.`,
        ],
      },
      {
        h: 'Approval',
        p: [
          `By ticking the approval box on the payment page, you declare that you have read and accepted this form and the Distance Sales Agreement.`,
        ],
      },
    ],
  },

  'iade-ve-iptal-kosullari': {
    title: 'Refund and Cancellation Terms',
    summary: 'Rules for payment refunds, cancellation and the end of a subscription.',
    sections: [
      {
        h: 'About the right of withdrawal',
        p: [
          `Kısaltıcı subscriptions are electronic services that start the moment you confirm them. Under Art. 15/1-ğ of the Distance Contracts Regulation, the right of withdrawal cannot be exercised for such services. For this reason, no standard refund is given for a period already purchased.`,
        ],
      },
      {
        h: 'Cases where a refund is made',
        list: [
          'A duplicate charge for the same order',
          'A charge of an incorrect amount',
          'The payment was taken but the plan could not be assigned to the account and the problem could not be fixed',
          'The service could not be provided because of a technical problem caused by the seller and another solution (such as a time extension) was not accepted',
        ],
        p: [
          `In these cases, it is enough to write to ${S.email} with your order details. After the request is reviewed, approved refunds are returned to the card used for the payment through the payment institution. It can take a few business days for the refund to appear at your bank, depending on the bank.`,
        ],
      },
      {
        h: 'Cancellation and the end of a subscription',
        p: [
          `Your subscription renews automatically, so you need to cancel if you do not want it. You can cancel before the trial or period ends with "Cancel subscription" in Settings > Account. If you cancel during the trial, no fee is charged. If you cancel during a period, you keep using the plan until the end of the period you paid for and are not charged afterwards. After cancellation your links and data are not deleted; an active plan is only required to create new links. You can subscribe again at any time (the free trial applies once per account).`,
        ],
      },
      {
        h: 'Account and data deletion',
        p: [
          `You can request deletion of your account and data at ${S.email}. If a paid period is still running, a deletion request does not create a refund right for the remaining time.`,
        ],
      },
    ],
  },

  'gizlilik-politikasi': {
    title: 'Privacy Policy',
    summary: 'Which data we process, why, and how we protect it.',
    sections: [
      {
        h: 'General',
        p: [
          `${S.brand} is operated by ${S.unvan}. This policy summarizes what information we collect on ${S.domain}, what we use it for and how we protect it. Detailed legal information is in the "KVKK Privacy Notice".`,
        ],
      },
      {
        h: 'Information we collect',
        list: [
          'Account information: when you sign in with Google or email, your name, email address, profile photo and user ID',
          'Service data: the short links you create, destination addresses, QR code settings, link titles and your username',
          'Click data: click times and totals for your short links',
          'Usage counters: your daily link and QR usage. For visitors who are not signed in, the daily allowance is tracked with an irreversibly hashed form of the IP address; the raw IP address is not stored',
          'Order information: when you pay, your name, phone, billing address, plan, amount and payment result. Card details are processed by PayTR; we only keep a card token for recurring payments, not the card number',
        ],
      },
      {
        h: 'How we use the information',
        p: [
          `We use your information to manage your account, redirect short links and provide statistics, apply plan limits, process payments, provide support, protect the service against misuse and meet legal obligations. We do not sell your data for advertising and do not use it to send marketing emails.`,
        ],
      },
      {
        h: 'Sharing',
        p: [
          `Your data is shared only with the infrastructure providers needed to provide the service: Google (Firebase) for authentication, Vercel for hosting, MongoDB Atlas for the database, PayTR for payments and Google Fonts for page fonts. It may also be shared with competent public authorities when legally required.`,
        ],
      },
      {
        h: 'Security and your rights',
        p: [
          `Your data is protected against unauthorized access with appropriate technical and administrative measures. You can send requests to access, correct or delete your data to ${S.email}; the full list of your rights is in the KVKK Privacy Notice.`,
        ],
      },
    ],
  },

  'kvkk-aydinlatma-metni': {
    title: 'KVKK Privacy Notice',
    summary: 'How your personal data is processed under Law No. 6698 (Turkish data protection law).',
    sections: [
      {
        h: '1. Data controller',
        p: [
          `Under Turkish Law No. 6698 on the Protection of Personal Data ("KVKK"), the data controller is ${S.unvan}. Address: ${S.address}. Contact: ${S.email}, KEP: ${S.kep}.`,
        ],
      },
      {
        h: '2. Personal data processed',
        list: [
          'Identity and contact: name, email address, phone number, billing address',
          'Account: Firebase user ID, profile photo, username, membership plan and its term',
          'Service usage: created links, click times, daily usage counters, QR settings',
          'Transaction security: IP address (in hashed form for guest use), session and browser information',
          'Finance: order amount, plan, subscription status and payment result (card details are processed and stored by PayTR; we only hold a card token for recurring payments, not the card number)',
        ],
      },
      {
        h: '3. Purposes and legal grounds',
        list: [
          'Creating your account and providing the service: establishment and performance of a contract',
          'Taking payments and assigning plans: performance of a contract',
          'Invoice, accounting and tax records: legal obligation',
          'Answering support requests: performance of a contract and legitimate interest',
          'Service security and tracking of misuse and daily limits: legitimate interest and legal obligation',
        ],
      },
      {
        h: '4. Method of collection',
        p: [`Your data is collected electronically through forms on the website, sign-in and payment steps, email correspondence and automatically while you use the service.`],
      },
      {
        h: '5. Transfers',
        p: [
          `Within Türkiye: PayTR for the payment service, the accountant and, when legally required, competent public bodies and institutions.`,
          `Abroad: Google (Firebase) for authentication, Vercel for hosting, MongoDB Atlas for the database service and Google Fonts for page fonts. These transfers are necessary to provide the service and are made within the framework of Article 9 of KVKK.`,
        ],
      },
      {
        h: '6. Retention periods',
        list: [
          'Account and link data: until the account or the related link is deleted',
          'Daily usage counters: at most 35 days',
          'Order, invoice and accounting records: for the periods required by law (at most 10 years)',
          'Security records: for the periods required by law',
        ],
      },
      {
        h: '7. Your rights',
        p: [
          `Under Article 11 of KVKK you have the right to: learn whether your personal data is processed; request information if it has been processed; learn the purpose of processing and whether it is used accordingly; know the third parties to whom it is transferred in Türkiye or abroad; request correction if it is incomplete or incorrect; request deletion or destruction within the conditions set by law; request that these actions be notified to third parties to whom the data was transferred; object to a result against you arising from analysis of the data exclusively by automated systems; and request compensation for damage caused by unlawful processing.`,
        ],
      },
      {
        h: '8. How to apply',
        p: [
          `You can send your requests in writing with identity-verifying information to the address above, to our KEP address, or to ${S.email} from the email address registered in the system. Applications are answered free of charge within 30 days at the latest.`,
        ],
      },
    ],
  },

  'kotuye-kullanim-bildirimi': {
    title: 'Report Abuse',
    summary: 'Report a short link that leads to phishing, malware or illegal content.',
    sections: [
      {
        h: 'What can you report?',
        p: [
          `If you think a short link created with ${S.brand} redirects to any of the following, you can report it to us:`,
        ],
        list: [
          'Phishing or fraud pages',
          'Pages that download malware, viruses or unwanted software',
          'Illegal, hateful or harassing content',
          'Copyright or trademark infringement',
          'Deceptive or misleading pages',
        ],
      },
      {
        h: 'How do we handle reports?',
        p: [
          `We review reports. We disable links found to violate the Terms of Use and, if needed, restrict the related account. In case of a legal request, we may contact the competent authorities. We may not always be able to reply to your report individually.`,
          `In urgent cases, you can also write directly to ${S.email}.`,
        ],
      },
    ],
  },

  'cerez-politikasi': {
    title: 'Cookie and Local Storage Policy',
    summary: 'What we store in your browser.',
    sections: [
      {
        h: 'We do not use advertising or tracking cookies',
        p: [
          `${S.domain} does not use third-party advertising, analytics or tracking cookies. The records below exist only so that the service works and your preferences are remembered.`,
        ],
      },
      {
        h: 'Local storage records we use',
        list: [
          'Fonts: the font files on our pages are loaded from Google Fonts; your browser’s IP address is sent to Google servers during this request',
          'Session: Google Firebase authentication uses browser storage to keep you signed in',
          'Preferences: your theme, color theme, language, sidebar state, density and keyboard shortcut settings',
          'Convenience: a cache of the latest profile information, your QR design drafts and a flag that the guest daily link allowance was used',
          'Temporary flow data: a record that remembers the plan you chose before signing in so you can be taken to the payment page after signing in',
        ],
      },
      {
        h: 'Control',
        p: [
          `You can delete these records in your browser settings. If you delete them, your preferences are reset and you may need to sign in again. The payment page runs on PayTR's own secure page; PayTR's cookie practices are subject to its own policies.`,
        ],
      },
    ],
  },

  'kullanim-kosullari': {
    title: 'Terms of Use',
    summary: 'The rules to follow when using the service.',
    sections: [
      {
        h: '1. Service',
        p: [
          `${S.brand} is a web service that shortens long links, creates QR codes and provides click statistics. By using the service you accept these terms.`,
        ],
      },
      {
        h: '2. Account',
        p: [
          `You need to create an account for some features. You are responsible for the security of your account and for giving correct and current information. As a guest you can use the service in a limited way with a daily allowance.`,
        ],
      },
      {
        h: '3. Plans and limits',
        p: [
          `The daily link and QR code allowances and the features of the plans are stated in the plan list. A ${S.trialDays}-day free trial applies once per account on the first subscription; when the trial ends, the plan price is charged automatically to the card on file and the subscription renews in periods unless canceled. You can cancel the subscription in account settings at any time. When a subscription ends, creating new links is closed; existing links keep working unless deleted.`,
        ],
      },
      {
        h: '4. Prohibited use',
        list: [
          'Creating links for phishing, fraud or deception',
          'Redirecting to malware, viruses or illegal content',
          'Redirecting to content that infringes copyright and other intellectual property rights',
          'Overloading the service with automated tools, trying to bypass security measures or evading limits',
          'Redirecting to content containing insults, hate or illegal activity',
        ],
        p: [
          `If these rules are violated, related links may be disabled without notice, the account may be restricted or closed. Necessary information may be shared at the request of competent authorities.`,
        ],
      },
      {
        h: '5. Content and liability',
        p: [
          `You are responsible for the content that the links you create point to. ${S.brand} is not responsible for the content of third-party sites that links redirect to. The service is provided "as is"; it is not guaranteed to be uninterrupted or error-free. To the extent permitted by law, no liability is accepted for indirect damages arising from use of the service. Your rights under consumer legislation are reserved.`,
        ],
      },
      {
        h: '6. Intellectual property',
        p: [`The ${S.brand} brand, interface and software belong to ${S.unvan}. Using the service does not transfer these rights to you.`],
      },
      {
        h: '7. Changes and governing law',
        p: [
          `The terms may be updated from time to time; the current version is published on this page. Turkish law applies to these terms. In consumer transactions, Consumer Arbitration Committees and Consumer Courts are competent.`,
        ],
      },
    ],
  },
};
