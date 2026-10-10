import { Link } from 'react-router-dom';
import { LEGAL_DOCS } from '../pages/legalDocs';
import './LegalLinks.css';

// Order shown in footers (the seller information page comes last)
const FOOTER_SLUGS = [
  'mesafeli-satis-sozlesmesi',
  'on-bilgilendirme-formu',
  'iade-ve-iptal-kosullari',
  'gizlilik-politikasi',
  'kvkk-aydinlatma-metni',
  'cerez-politikasi',
  'kullanim-kosullari',
  'satici-bilgileri',
];

/** Row of links to every legal document (footer of the landing page, checkout and legal pages). */
function LegalLinks({ className = '' }) {
  const docs = FOOTER_SLUGS.map((slug) => LEGAL_DOCS.find((doc) => doc.slug === slug)).filter(Boolean);
  return (
    <nav className={`legalLinks ${className}`} aria-label="Yasal">
      {docs.map((doc) => (
        <Link key={doc.slug} to={`/yasal/${doc.slug}`} className="legalLink">
          {doc.title}
        </Link>
      ))}
    </nav>
  );
}

export default LegalLinks;
