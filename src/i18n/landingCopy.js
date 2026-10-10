// Landing page copy (Turkish / English). Plan features mirror the real plans in translations.js.

export const LANDING_COPY = {
  tr: {
    nav: {
      features: 'Özellikler',
      how: 'Nasıl çalışır',
      plans: 'Planlar',
      faq: 'SSS',
      signIn: 'Giriş yap',
      start: 'Hemen başla',
      menu: 'Menü',
      themeToggle: 'Temayı değiştir',
      language: 'Dili değiştir',
    },
    hero: {
      title: 'Bağlantını kısalt, paylaş ve takip et.',
      titleAccent: 'takip et',
      sub: 'Bağlantını yapıştır, ne yapmak istediğini seç. Hesap açmadan hemen başlayabilirsin.',
      question: 'Bu bağlantı için ne yapmak istersiniz?',
      placeholder: 'https://uzun-bir-baglanti.com/sayfa',
      inputLabel: 'Kısaltılacak bağlantı',
      modes: {
        shorten: 'Kısalt',
        qr: 'QR kod oluştur',
        custom: 'Özel bağlantı',
      },
      submit: 'Devam et',
      submitting: 'Hazırlanıyor',
      previewLinkLabel: 'Kısa bağlantı',
      previewCopied: 'Kopyalandı',
      previewQr: 'QR hazır',
    },
    how: {
      title: 'Üç adımda hazır',
      sub: 'Karmaşık bir kurulum yok. Yapıştır, seç, paylaş.',
      steps: [
        {
          title: 'Bağlantını yapıştır',
          text: 'Uzun adresi kutuya bırak. Sadece http ve https adresleri kabul edilir.',
        },
        {
          title: 'Ne yapacağını seç',
          text: 'Sadece kısalt, QR kod oluştur ya da giriş yaptıysan kendi adresini belirle.',
        },
        {
          title: 'Paylaş ve takip et',
          text: 'Kısa adresi kopyala. Bağlantı sayfasında tıklamaları ve QR ayarlarını yönet.',
        },
      ],
    },
    statement: {
      lead: 'Uzun bağlantıları kimse okumaz.',
      accent: 'Kısa olanı herkes paylaşır.',
    },
    stack: {
      items: [
        {
          num: '01',
          title: 'Anında yönlendirme',
          text: 'Kısa adres açıldığı anda ziyaretçi doğrudan hedef sayfaya gider. Araya ek bir ekran girmez.',
          from: 'https://ornek-site.com/blog/2026/uzun-ve-karmasik-bir-baslik?kaynak=bulten&kampanya=yaz',
          to: 'kisaltici.com/aB3xYz',
        },
        {
          num: '02',
          title: 'Markana uygun QR kod',
          text: 'Renk, modül şekli, köşe stili ve ortadaki görseli ayarla. Ayarlar bağlantınla birlikte saklanır.',
        },
        {
          num: '03',
          title: 'Tıklamaları anla',
          text: 'Toplam tıklama, son tıklama ve zaman içindeki dağılım her bağlantının kendi sayfasında.',
          sample: 'Örnek görünüm',
        },
        {
          num: '04',
          title: 'Özel bağlantılar',
          text: 'Profesyonel planla adresin sonunu kendin yaz. İstediğinde otomatik koda tek tıkla dön.',
          example: 'kisaltici.com/@ad/portfolyo',
          tag: 'Profesyonel',
        },
      ],
    },
    themes: {
      title: '15 renk teması. Seninkini seç.',
      text: 'Karanlık ve aydınlık mod, beş standart ve on premium tema. Arayüz tek tıkla kendi rengine bürünür.',
      sampleTitle: 'Bağlantılarım',
      sampleLink: 'kisaltici.com/aB3xYz',
      free: 'Ücretsiz',
      pro: 'Premium',
    },
    ticker: ['Kısalt', 'Paylaş', 'Takip et'],
    plans: {
      title: 'Sana uygun planı seç',
      sub: 'Planını seç ve ücretsiz dene, ihtiyacın büyüdükçe yükselt.',
      guestNote: 'Giriş yapmadan da dene: misafir olarak 1 bağlantı ve 1 QR kod oluşturabilirsin.',
      freeCta: 'Ücretsiz başla',
      paidCta: 'Giriş yap ve seç',
    },
    faq: {
      title: 'Sık sorulan sorular',
      items: [
        {
          q: 'Hesap açmadan kullanabilir miyim?',
          a: 'Evet. Misafir olarak bağlantı kısaltabilir ve QR kod oluşturabilirsin. Geçmişin kaydedilmesi, özel bağlantılar ve gelişmiş istatistikler için giriş yapman gerekir.',
        },
        {
          q: 'Kısa bağlantılarım ne kadar süre çalışır?',
          a: 'Silinmediği sürece çalışmaya devam eder. Bağlantıyı sildiğinde adres artık yönlendirme yapmaz.',
        },
        {
          q: 'Tıklamaları nasıl görürüm?',
          a: 'Her bağlantının sayfasında toplam tıklama, son tıklama zamanı ve zaman içindeki dağılım yer alır.',
        },
        {
          q: 'QR kodu özelleştirebilir miyim?',
          a: 'Evet. Renkleri, modül şeklini, köşe stilini, boşluk payını ve ortadaki görseli ayarlayabilirsin.',
        },
        {
          q: 'Özel bağlantı nedir?',
          a: 'Profesyonel ve Kurumsal plandakiler adresin sonunu kendileri belirler, örneğin @ad/portfolyo. Dilersen tek tıkla ilk otomatik koda dönebilirsin.',
        },
      ],
    },
    cta: {
      title: 'Bir sonraki bağlantını burada kısalt',
      text: 'Google hesabınla birkaç saniyede giriş yap ve bağlantılarını tek yerde topla.',
      button: 'Google ile başla',
    },
    footer: {
      rights: '© 2026 Kısaltıcı',
      tagline: 'Bağlantı kısaltma, QR kod ve istatistik.',
    },
  },

  en: {
    nav: {
      features: 'Features',
      how: 'How it works',
      plans: 'Plans',
      faq: 'FAQ',
      signIn: 'Sign in',
      start: 'Get started',
      menu: 'Menu',
      themeToggle: 'Toggle theme',
      language: 'Change language',
    },
    hero: {
      title: 'Shorten, share and track your links.',
      titleAccent: 'track',
      sub: 'Paste your link and pick what you want to do. You can start right away without an account.',
      question: 'What do you want to do with this link?',
      placeholder: 'https://a-very-long-link.com/page',
      inputLabel: 'Link to shorten',
      modes: {
        shorten: 'Shorten',
        qr: 'Create QR code',
        custom: 'Custom link',
      },
      submit: 'Continue',
      submitting: 'Preparing',
      previewLinkLabel: 'Short link',
      previewCopied: 'Copied',
      previewQr: 'QR ready',
    },
    how: {
      title: 'Ready in three steps',
      sub: 'No complicated setup. Paste, choose, share.',
      steps: [
        {
          title: 'Paste your link',
          text: 'Drop the long address into the box. Only http and https addresses are accepted.',
        },
        {
          title: 'Choose what to do',
          text: 'Just shorten it, create a QR code, or set your own address once you sign in.',
        },
        {
          title: 'Share and track',
          text: 'Copy the short address. Manage clicks and QR settings on the link page.',
        },
      ],
    },
    statement: {
      lead: 'Nobody reads long links.',
      accent: 'Everybody shares the short ones.',
    },
    stack: {
      items: [
        {
          num: '01',
          title: 'Instant redirects',
          text: 'The moment a short link opens, visitors go straight to the destination. No extra screen in between.',
          from: 'https://example-site.com/blog/2026/a-long-and-complicated-title?source=newsletter&campaign=summer',
          to: 'kisaltici.com/aB3xYz',
        },
        {
          num: '02',
          title: 'QR codes that match your brand',
          text: 'Adjust colors, module shape, corner style and the center image. Your settings are saved with the link.',
        },
        {
          num: '03',
          title: 'Understand your clicks',
          text: "Total clicks, last click and the distribution over time on each link's own page.",
          sample: 'Sample view',
        },
        {
          num: '04',
          title: 'Custom links',
          text: 'With the Professional plan you write the end of the address yourself. Switch back to the automatic code in one click.',
          example: 'kisaltici.com/@name/portfolio',
          tag: 'Professional',
        },
      ],
    },
    themes: {
      title: '15 color themes. Pick yours.',
      text: 'Dark and light mode, five standard and ten premium themes. The interface takes your color in one click.',
      sampleTitle: 'My links',
      sampleLink: 'kisaltici.com/aB3xYz',
      free: 'Free',
      pro: 'Premium',
    },
    ticker: ['Shorten', 'Share', 'Track'],
    plans: {
      title: 'Pick the plan that fits you',
      sub: 'Pick a plan and try it free, upgrade as your needs grow.',
      guestNote: 'Try it without signing in: as a guest you can create 1 link and 1 QR code.',
      freeCta: 'Start free',
      paidCta: 'Sign in and choose',
    },
    faq: {
      title: 'Frequently asked questions',
      items: [
        {
          q: 'Can I use it without an account?',
          a: 'Yes. As a guest you can shorten links and create QR codes. Saved history, custom links and advanced statistics require signing in.',
        },
        {
          q: 'How long do my short links keep working?',
          a: 'They keep working until you delete them. Once a link is deleted, the address no longer redirects.',
        },
        {
          q: 'How do I see clicks?',
          a: 'Each link page shows the total clicks, the time of the last click and the distribution over time.',
        },
        {
          q: 'Can I customize the QR code?',
          a: 'Yes. You can adjust colors, module shape, corner style, quiet zone and the center image.',
        },
        {
          q: 'What is a custom link?',
          a: 'Professional and Business members choose the end of the address themselves, for example @name/portfolio. You can switch back to the original automatic code in one click.',
        },
      ],
    },
    cta: {
      title: 'Shorten your next link right here',
      text: 'Sign in with Google in a few seconds and keep all your links in one place.',
      button: 'Continue with Google',
    },
    footer: {
      rights: '© 2026 Kısaltıcı',
      tagline: 'Link shortening, QR codes and statistics.',
    },
  },
};
