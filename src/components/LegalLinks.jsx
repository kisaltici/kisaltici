import { Link } from 'react-router-dom';
import { getLegalDocs } from '../pages/legalDocs';
import { legalPath } from '../content/legalSlugs';
import './LegalLinks.css';

// Order shown in footers (the seller information page comes last, abuse reporting right before it)
const FOOTER_IDS = [
  'mesafeli-satis-sozlesmesi',
  'on-bilgilendirme-formu',
  'iade-ve-iptal-kosullari',
  'gizlilik-politikasi',
  'kvkk-aydinlatma-metni',
  'cerez-politikasi',
  'kullanim-kosullari',
  'kotuye-kullanim-bildirimi',
  'satici-bilgileri',
];

/** Row of links to every legal document in the given language (landing, checkout, blog and legal pages). */
function LegalLinks({ className = '', lang = 'tr' }) {
  const docs = getLegalDocs(lang);
  const items = FOOTER_IDS.map((id) => docs.find((doc) => doc.id === id)).filter(Boolean);
  return (
    <nav className={`legalLinks ${className}`} aria-label={lang === 'en' ? 'Legal' : 'Yasal'}>
      {items.map((doc) => (
        <Link key={doc.id} to={legalPath(lang, doc.id)} className="legalLink">
          {doc.title}
        </Link>
      ))}
    </nav>
  );
}

export default LegalLinks;
