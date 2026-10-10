import { SELLER as S, LEGAL_UPDATED } from '../config/legal';

/**
 * Legal documents (Turkish). Each section: { h: heading, p: [paragraphs], list: [bullet items] }.
 * Texts describe how Kısaltıcı works today (time-limited paid plans, no automatic renewal).
 * If automatic renewal or new data processing is added, update these texts and bump LEGAL_VERSION.
 */
export const LEGAL_DOCS = [
  {
    slug: 'satici-bilgileri',
    title: 'Satıcı ve İletişim Bilgileri',
    summary: 'Hizmeti sunan işletmenin ticari ve iletişim bilgileri.',
    sections: [
      {
        h: 'İşletme bilgileri',
        list: [
          `Hizmet: ${S.brand} (${S.domain}), bağlantı kısaltma, QR kod ve istatistik hizmeti`,
          `Unvan: ${S.unvan}`,
          `İşletme türü: ${S.type}`,
          `Vergi dairesi: ${S.taxOffice}`,
          `Vergi kimlik no: ${S.taxNo}`,
          `Adres: ${S.address}`,
          `Telefon: ${S.phone}`,
          `E-posta: ${S.email}`,
          `KEP adresi: ${S.kep}`,
          `Web sitesi: ${S.site}`,
        ],
      },
      {
        h: 'Destek',
        p: [
          `Sorularını, şikâyetlerini ve iade taleplerini ${S.email} adresine yazabilir ya da ${S.phone} numarasını arayabilirsin. Destek saatleri: ${S.supportHours}. Hizmete web sitesi üzerinden 7 gün 24 saat ulaşılır.`,
        ],
      },
    ],
  },

  {
    slug: 'mesafeli-satis-sozlesmesi',
    title: 'Mesafeli Satış Sözleşmesi',
    summary: 'Abonelik planı satın alımına ilişkin sözleşme şartları.',
    sections: [
      {
        h: 'Madde 1. Taraflar',
        p: [
          `SATICI: ${S.unvan}, ${S.type}, ${S.taxOffice}, vergi kimlik no ${S.taxNo}. Adres: ${S.address}. Telefon: ${S.phone}. E-posta: ${S.email}. KEP: ${S.kep}.`,
          `ALICI: ${S.domain} üzerinde hesap oluşturan ve ödeme sayfasında ad, soyad, e-posta, telefon ve adres bilgilerini girerek aşağıdaki hizmeti satın alan kişidir.`,
        ],
      },
      {
        h: 'Madde 2. Sözleşmenin konusu',
        p: [
          `Bu sözleşme, ALICI'nın ${S.domain} üzerinden elektronik ortamda satın aldığı, nitelikleri ve satış bedeli aşağıda belirtilen abonelik planına ilişkin olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri uyarınca tarafların hak ve yükümlülüklerini düzenler.`,
        ],
      },
      {
        h: 'Madde 3. Hizmetin niteliği ve bedeli',
        p: [
          `Hizmet; Başlangıç, Profesyonel veya Kurumsal plan olarak sunulan, günlük bağlantı ve QR kod hakları, istatistik geçmişi ve plana bağlı ek özellikler içeren, aylık veya yıllık süreli bir dijital abonelik hizmetidir. Planların kapsamı ve güncel fiyatları ödeme sayfasında ve sitedeki plan listesinde gösterilir.`,
          `Satış bedeli, ALICI'nın seçtiği plan ve dönem için ödeme sayfasında gösterilen toplam tutardır ve Türk lirası olarak tahsil edilir. Yıllık dönem seçildiğinde 12 aylık hizmet, 10 aylık bedel üzerinden sunulur. ALICI, siparişi onaylamadan önce toplam bedeli ödeme sayfasında görür.`,
        ],
      },
      {
        h: 'Madde 4. Ödeme',
        p: [
          `Ödeme, kredi veya banka kartı ile PayTR ödeme altyapısı üzerinden yapılır. Kart bilgileri PayTR'nin güvenli ödeme sayfasında girilir; SATICI kart bilgilerini görmez ve saklamaz. Siparişin ödemesi, PayTR'nin onay bildirimi SATICI'ya ulaştığında tamamlanmış sayılır.`,
        ],
      },
      {
        h: 'Madde 5. İfa ve süre',
        p: [
          `Hizmet elektronik ortamda sunulur, fiziksel teslimat yoktur. Ödeme onaylandığında satın alınan plan ALICI'nın hesabına anında tanımlanır ve seçilen dönem (bir ay veya bir yıl) bu andan itibaren işlemeye başlar. ALICI aynı planı süresi dolmadan yeniden satın alırsa yeni dönem mevcut bitiş tarihine eklenir; farklı bir plan satın alırsa yeni plan hemen başlar ve önceki planın kalan süresi yeni plana aktarılmaz.`,
          `Abonelik otomatik yenilenmez. SATICI, ALICI'nın kartından süre sonunda ek bir tahsilat yapmaz. Dönem sona erdiğinde hesap ücretsiz plana döner; ALICI'nın oluşturduğu bağlantılar ve verileri silinmez, bağlantılar çalışmaya devam eder, yalnızca ücretsiz planın limitleri geçerli olur.`,
        ],
      },
      {
        h: 'Madde 6. Cayma hakkı',
        p: [
          `Mesafeli Sözleşmeler Yönetmeliği'nin 15. maddesinin birinci fıkrasının (ğ) bendi uyarınca, elektronik ortamda anında ifa edilen hizmetlere ilişkin sözleşmelerde cayma hakkı kullanılamaz. Bu sözleşme konusu abonelik, ödemenin onaylanmasıyla birlikte anında ifa edildiğinden ALICI cayma hakkının bulunmadığını, sipariş öncesinde bilgilendirildiğini ve bunu kabul ettiğini beyan eder. İade ve iptal koşulları ayrıca "İade ve İptal Koşulları" sayfasında açıklanmıştır.`,
        ],
      },
      {
        h: 'Madde 7. Satıcının yükümlülükleri',
        p: [
          `SATICI, hizmeti sözleşmede tanımlanan plan kapsamında kesintisiz sunmak için makul özeni gösterir. Planlı bakım, üçüncü taraf altyapı sağlayıcılarından kaynaklanan arızalar ve mücbir sebepler nedeniyle oluşabilecek geçici kesintilerden SATICI'nın kusuru bulunmadıkça sorumlu tutulamaz. SATICI'nın kusurundan kaynaklanan ve hizmetin sunulamamasına yol açan teknik sorunlarda ALICI, SATICI'ya başvurabilir; SATICI sorunu giderir veya durumun gerektirdiği şekilde süre uzatımı ya da bedel iadesi ile çözüm sunar.`,
        ],
      },
      {
        h: 'Madde 8. Alıcının yükümlülükleri',
        p: [
          `ALICI, ödeme sayfasında verdiği bilgilerin doğru ve güncel olduğunu, hizmeti yürürlükteki mevzuata ve Kullanım Koşulları'na uygun kullanacağını kabul eder. Kimlik avı, zararlı yazılım dağıtımı, aldatıcı veya yasa dışı içeriğe yönlendirme ve hizmetin kötüye kullanımı yasaktır; bu tür kullanımların tespiti halinde SATICI ilgili bağlantıları devre dışı bırakabilir veya hesabı kısıtlayabilir.`,
        ],
      },
      {
        h: 'Madde 9. Ayıplı hizmet',
        p: [
          `Hizmetin sözleşmede belirtilen niteliklere uygun sunulmaması halinde ALICI'nın 6502 sayılı Kanun'dan doğan hakları saklıdır. ALICI bu haklarını kullanmak için SATICI'ya yukarıdaki iletişim kanallarından başvurabilir.`,
        ],
      },
      {
        h: 'Madde 10. Kişisel verilerin korunması',
        p: [
          `ALICI'ya ait kişisel veriler, 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında "KVKK Aydınlatma Metni"nde açıklanan amaç ve yöntemlerle işlenir.`,
        ],
      },
      {
        h: 'Madde 11. Uyuşmazlıkların çözümü',
        p: [
          `Bu sözleşmeden doğan uyuşmazlıklarda, Ticaret Bakanlığı'nca her yıl ilan edilen parasal sınırlar dahilinde ALICI'nın yerleşim yerindeki veya işlem yerindeki Tüketici Hakem Heyetleri ile Tüketici Mahkemeleri yetkilidir. ALICI, şikâyetlerini ayrıca e-Devlet üzerinden Tüketici Bilgi Sistemi (TÜBİS) aracılığıyla da iletebilir.`,
        ],
      },
      {
        h: 'Madde 12. Yürürlük',
        p: [
          `ALICI, ödeme sayfasında ön bilgilendirme formunu ve bu sözleşmeyi okuyup onayladığını elektronik ortamda beyan ederek siparişi tamamlar. Sözleşme, ödemenin onaylanmasıyla yürürlüğe girer. Sözleşmenin ve onay kaydının bir örneği SATICI tarafından saklanır.`,
        ],
      },
    ],
  },

  {
    slug: 'on-bilgilendirme-formu',
    title: 'Ön Bilgilendirme Formu',
    summary: 'Sipariş vermeden önce bilmen gereken temel bilgiler.',
    sections: [
      {
        h: 'Satıcı',
        p: [`${S.unvan} (${S.type}), ${S.address}. Telefon: ${S.phone}, e-posta: ${S.email}, KEP: ${S.kep}.`],
      },
      {
        h: 'Hizmetin ana nitelikleri',
        p: [
          `Başlangıç, Profesyonel veya Kurumsal plan; aylık ya da yıllık süreli dijital abonelik. Plana göre değişen günlük bağlantı ve QR kod hakkı, istatistik geçmişi süresi, özel bağlantı ve özel QR tasarımı gibi özellikler ödeme sayfasında listelenir.`,
        ],
      },
      {
        h: 'Toplam bedel ve ödeme',
        p: [
          `Seçilen plan ve dönem için toplam bedel, siparişi onaylamadan önce ödeme sayfasında Türk lirası olarak gösterilir. Ödeme kredi veya banka kartıyla, PayTR güvenli ödeme sayfası üzerinden tek çekim olarak yapılır. Kart bilgileri satıcıda saklanmaz.`,
        ],
      },
      {
        h: 'İfa ve süre',
        p: [
          `Ödeme onaylandığında plan hesabına anında tanımlanır ve seçilen süre (bir ay veya bir yıl) bu andan itibaren işler. Abonelik otomatik yenilenmez, ek tahsilat yapılmaz. Süre sonunda hesap ücretsiz plana döner, bağlantıların çalışmaya devam eder.`,
        ],
      },
      {
        h: 'Cayma hakkı',
        p: [
          `Elektronik ortamda anında ifa edilen hizmetlerde cayma hakkı bulunmamaktadır (Mesafeli Sözleşmeler Yönetmeliği m.15/1-ğ). Satın aldığın abonelik ödeme onayıyla anında ifa edildiği için cayma hakkın yoktur. Mükerrer veya hatalı tahsilatlar ile hizmetin sunulamaması hallerinde iade koşulları "İade ve İptal Koşulları" sayfasındadır.`,
        ],
      },
      {
        h: 'Şikâyet ve başvuru',
        p: [
          `Şikâyet ve talepler için ${S.email} adresi veya ${S.phone} numarası kullanılabilir. Uyuşmazlıklarda yerleşim yerindeki Tüketici Hakem Heyeti veya Tüketici Mahkemesi'ne başvurulabilir.`,
        ],
      },
      {
        h: 'Onay',
        p: [
          `Ödeme sayfasındaki onay kutusunu işaretleyerek bu formu ve Mesafeli Satış Sözleşmesi'ni okuduğunu ve kabul ettiğini beyan edersin.`,
        ],
      },
    ],
  },

  {
    slug: 'iade-ve-iptal-kosullari',
    title: 'İade ve İptal Koşulları',
    summary: 'Ödeme iadesi, iptal ve abonelik sonu için esaslar.',
    sections: [
      {
        h: 'Cayma hakkı hakkında',
        p: [
          `Kısaltıcı abonelikleri, ödeme onaylandığında anında devreye giren elektronik hizmetlerdir. Mesafeli Sözleşmeler Yönetmeliği m.15/1-ğ uyarınca bu tür hizmetlerde cayma hakkı kullanılamaz. Bu nedenle satın alınan dönem için standart iade yapılmaz.`,
        ],
      },
      {
        h: 'İade yapılan durumlar',
        list: [
          'Aynı sipariş için mükerrer tahsilat yapılması',
          'Hatalı tutarda tahsilat yapılması',
          'Ödemenin alınmasına rağmen planın hesaba tanımlanamaması ve sorunun giderilememesi',
          'Satıcının kusurundan kaynaklanan teknik sorun nedeniyle hizmetin sunulamaması ve başka bir çözümün (süre uzatımı gibi) kabul edilmemesi',
        ],
        p: [
          `Bu durumlarda ${S.email} adresine sipariş bilgilerinle başvurman yeterlidir. Başvurunun incelenmesinden sonra onaylanan iadeler, tahsilatın yapıldığı karta ödeme kuruluşu üzerinden iade edilir. İade sürecinin bankana yansıması, bankaya bağlı olarak birkaç iş gününü bulabilir.`,
        ],
      },
      {
        h: 'İptal ve abonelik sonu',
        p: [
          `Abonelik otomatik yenilenmediği için ayrıca iptal etmen gerekmez. Dönem sonunda hesabın ücretsiz plana döner, bağlantıların ve verilerin silinmez. İstersen planını dilediğin zaman ödeme sayfasından yeniden satın alabilir veya süreni uzatabilirsin.`,
        ],
      },
      {
        h: 'Hesap ve veri silme',
        p: [
          `Hesabının ve verilerinin silinmesini ${S.email} adresinden talep edebilirsin. Ücretli bir dönem devam ediyorsa silme talebi, kalan süre için iade hakkı doğurmaz.`,
        ],
      },
    ],
  },

  {
    slug: 'gizlilik-politikasi',
    title: 'Gizlilik Politikası',
    summary: 'Hangi verileri neden işlediğimiz ve nasıl koruduğumuz.',
    sections: [
      {
        h: 'Genel',
        p: [
          `${S.brand}, ${S.unvan} tarafından işletilir. Bu politika, ${S.domain} üzerinde hangi bilgileri topladığımızı, ne amaçla kullandığımızı ve nasıl koruduğumuzu özetler. Ayrıntılı hukuki bilgilendirme "KVKK Aydınlatma Metni"ndedir.`,
        ],
      },
      {
        h: 'Topladığımız bilgiler',
        list: [
          'Hesap bilgileri: Google veya e-posta ile giriş yaptığında ad, e-posta adresi, profil fotoğrafı ve kullanıcı kimliği',
          'Hizmet verileri: oluşturduğun kısa bağlantılar, hedef adresler, QR kod ayarları, bağlantı başlıkları ve kullanıcı adın',
          'Tıklama verileri: kısa bağlantılarının tıklanma zamanları ve toplam sayıları',
          'Kullanım sayaçları: günlük bağlantı ve QR kullanımın. Giriş yapmayan ziyaretçilerde günlük hak, IP adresinin geri döndürülemez şekilde özetlenmiş (hash) hâli ile takip edilir; ham IP adresi saklanmaz',
          'Sipariş bilgileri: ödeme yaptığında ad soyad, telefon, fatura adresi, plan, tutar ve ödeme sonucu. Kart bilgileri PayTR tarafından işlenir, bizde saklanmaz',
        ],
      },
      {
        h: 'Bilgilerin kullanımı',
        p: [
          `Bilgilerini; hesabını yönetmek, kısa bağlantıları yönlendirmek ve istatistik sunmak, plan limitlerini uygulamak, ödemeleri işlemek, destek sağlamak, hizmeti kötüye kullanıma karşı korumak ve yasal yükümlülükleri yerine getirmek için kullanırız. Verilerini reklam amacıyla satmayız ve pazarlama e-postası göndermek için kullanmayız.`,
        ],
      },
      {
        h: 'Paylaşım',
        p: [
          `Verilerin yalnızca hizmetin sunulması için gerekli altyapı sağlayıcılarıyla paylaşılır: kimlik doğrulama için Google (Firebase), barındırma için Vercel, veri tabanı için MongoDB Atlas, ödeme için PayTR ve sayfa yazı tipleri için Google Fonts. Yasal bir zorunluluk halinde yetkili kamu kurumlarıyla da paylaşılabilir.`,
        ],
      },
      {
        h: 'Güvenlik ve haklarınız',
        p: [
          `Verilerin yetkisiz erişime karşı uygun teknik ve idari tedbirlerle korunur. Verilerine erişme, düzeltme veya silme taleplerini ${S.email} adresine iletebilirsin; haklarının tam listesi KVKK Aydınlatma Metni'ndedir.`,
        ],
      },
      { h: 'Güncelleme', p: [`Bu politika ${LEGAL_UPDATED} tarihinde güncellenmiştir.`] },
    ],
  },

  {
    slug: 'kvkk-aydinlatma-metni',
    title: 'KVKK Aydınlatma Metni',
    summary: '6698 sayılı Kanun kapsamında kişisel verilerinin işlenmesi.',
    sections: [
      {
        h: '1. Veri sorumlusu',
        p: [
          `6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca veri sorumlusu ${S.unvan}'dır. Adres: ${S.address}. İletişim: ${S.email}, KEP: ${S.kep}.`,
        ],
      },
      {
        h: '2. İşlenen kişisel veriler',
        list: [
          'Kimlik ve iletişim: ad soyad, e-posta adresi, telefon numarası, fatura adresi',
          'Hesap: Firebase kullanıcı kimliği, profil fotoğrafı, kullanıcı adı, üyelik planı ve süresi',
          'Hizmet kullanımı: oluşturulan bağlantılar, tıklama zamanları, günlük kullanım sayaçları, QR ayarları',
          'İşlem güvenliği: IP adresi (misafir kullanımda özetlenmiş hâliyle), oturum ve tarayıcı bilgileri',
          'Finans: sipariş tutarı, plan ve ödeme sonucu (kart bilgileri PayTR tarafından işlenir, tarafımızca saklanmaz)',
        ],
      },
      {
        h: '3. İşleme amaçları ve hukuki sebepler',
        list: [
          'Hesabın oluşturulması ve hizmetin sunulması: sözleşmenin kurulması ve ifası',
          'Ödemelerin alınması ve plan tanımlanması: sözleşmenin ifası',
          'Fatura, muhasebe ve vergi kayıtları: kanuni yükümlülük',
          'Destek taleplerinin yanıtlanması: sözleşmenin ifası ve meşru menfaat',
          'Hizmetin güvenliği, kötüye kullanımın ve günlük limitlerin takibi: meşru menfaat ve kanuni yükümlülük',
        ],
      },
      {
        h: '4. Toplama yöntemi',
        p: [`Verilerin, web sitesi üzerindeki formlar, giriş ve ödeme adımları, e-posta yazışmaları ve hizmetin kullanımı sırasında otomatik yollarla elektronik ortamda toplanır.`],
      },
      {
        h: '5. Aktarım',
        p: [
          `Yurt içi: ödeme hizmeti için PayTR, mali müşavir ve yasal zorunluluk halinde yetkili kamu kurum ve kuruluşları.`,
          `Yurt dışı: kimlik doğrulama için Google (Firebase), barındırma için Vercel ve veri tabanı hizmeti için MongoDB Atlas. Bu aktarımlar, hizmetin sunulması için gerekli olup KVKK'nın 9. maddesi çerçevesinde yapılır.`,
        ],
      },
      {
        h: '6. Saklama süreleri',
        list: [
          'Hesap ve bağlantı verileri: hesabın veya ilgili bağlantının silinmesine kadar',
          'Günlük kullanım sayaçları: en fazla 35 gün',
          'Sipariş, fatura ve muhasebe kayıtları: ilgili mevzuatın öngördüğü süreler (en fazla 10 yıl)',
          'Güvenlik kayıtları: mevzuatta öngörülen süreler boyunca',
        ],
      },
      {
        h: '7. Haklarınız',
        p: [
          `KVKK'nın 11. maddesi uyarınca; kişisel verilerinin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme, işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme, yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme, eksik veya yanlış işlenmişse düzeltilmesini isteme, kanunun öngördüğü şartlar çerçevesinde silinmesini veya yok edilmesini isteme, bu işlemlerin aktarıldığı üçüncü kişilere bildirilmesini isteme, işlenen verilerin otomatik sistemlerle analiz edilmesi sonucu aleyhine bir sonuç ortaya çıkmasına itiraz etme ve kanuna aykırı işleme nedeniyle zarara uğraman halinde zararın giderilmesini talep etme haklarına sahipsin.`,
        ],
      },
      {
        h: '8. Başvuru yöntemi',
        p: [
          `Taleplerini, kimliğini tespit edici bilgilerle birlikte yazılı olarak yukarıdaki adrese, KEP adresimize veya sistemde kayıtlı e-posta adresinle ${S.email} adresine iletebilirsin. Başvurular en geç 30 gün içinde ve ücretsiz olarak yanıtlanır.`,
        ],
      },
    ],
  },

  {
    slug: 'cerez-politikasi',
    title: 'Çerez ve Yerel Depolama Politikası',
    summary: 'Tarayıcında hangi bilgileri sakladığımız.',
    sections: [
      {
        h: 'Reklam ve izleme çerezi kullanmıyoruz',
        p: [
          `${S.domain}, üçüncü taraf reklam, analiz veya izleme çerezleri kullanmaz. Aşağıdaki kayıtlar yalnızca hizmetin çalışması ve tercihlerinin hatırlanması içindir.`,
        ],
      },
      {
        h: 'Kullandığımız yerel depolama kayıtları',
        list: [
          'Yazı tipleri: sayfalardaki yazı tipi dosyaları Google Fonts üzerinden yüklenir; bu istek sırasında tarayıcının IP adresi Google sunucularına iletilir',
          'Oturum bilgisi: Google Firebase kimlik doğrulaması, giriş yaptığında oturumunu sürdürmek için tarayıcı depolamasını kullanır',
          'Tercihler: tema, renk teması, dil, kenar çubuğu durumu, yoğunluk ve klavye kısayolu ayarların',
          'Kullanım kolaylığı: son profil bilgisinin önbelleği, QR tasarım taslakların ve misafir günlük bağlantı hakkının kullanıldığı bilgisi',
          'Geçici akış bilgisi: giriş yapmadan seçtiğin planı, giriş sonrası ödeme sayfasına yönlendirmek için oturum süresince hatırlayan kayıt',
        ],
      },
      {
        h: 'Kontrol',
        p: [
          `Bu kayıtları tarayıcı ayarlarından silebilirsin. Silmen halinde tercihlerin sıfırlanır ve yeniden giriş yapman gerekebilir. Ödeme sayfası, PayTR'nin kendi güvenli sayfasında çalışır; PayTR'nin çerez uygulamaları kendi politikalarına tabidir.`,
        ],
      },
    ],
  },

  {
    slug: 'kullanim-kosullari',
    title: 'Kullanım Koşulları',
    summary: 'Hizmeti kullanırken uyulacak kurallar.',
    sections: [
      {
        h: '1. Hizmet',
        p: [
          `${S.brand}; uzun bağlantıları kısaltan, QR kod üreten ve tıklama istatistiği sunan bir web hizmetidir. Hizmeti kullanarak bu koşulları kabul etmiş olursun.`,
        ],
      },
      {
        h: '2. Hesap',
        p: [
          `Bazı özellikler için hesap oluşturman gerekir. Hesabının güvenliğinden sen sorumlusun. Doğru ve güncel bilgi vermen gerekir. Misafir olarak hizmeti sınırlı biçimde, günlük bir hak ile kullanabilirsin.`,
        ],
      },
      {
        h: '3. Planlar ve limitler',
        p: [
          `Ücretsiz ve ücretli planların günlük bağlantı ve QR kod hakları ile özellikleri plan listesinde belirtilir. Ücretli planlar süreli satın alınır ve otomatik yenilenmez. Süre sonunda hesap ücretsiz plana döner. Bağlantılar silinmedikçe çalışmaya devam eder.`,
        ],
      },
      {
        h: '4. Yasaklı kullanım',
        list: [
          'Kimlik avı, dolandırıcılık veya aldatma amaçlı bağlantılar oluşturmak',
          'Zararlı yazılım, virüs veya yasa dışı içeriğe yönlendirmek',
          'Telif hakkı ve diğer fikri mülkiyet haklarını ihlal eden içeriğe yönlendirmek',
          'Hizmeti otomatik araçlarla aşırı yüklemek, güvenlik önlemlerini aşmaya çalışmak veya limitleri atlatmak',
          'Hakaret, nefret veya yasa dışı faaliyet içeren içeriğe yönlendirmek',
        ],
        p: [
          `Bu kuralların ihlali halinde ilgili bağlantılar önceden bildirimsiz devre dışı bırakılabilir, hesap kısıtlanabilir veya kapatılabilir. Yetkili makamların talebi halinde gerekli bilgiler paylaşılabilir.`,
        ],
      },
      {
        h: '5. İçerik ve sorumluluk',
        p: [
          `Oluşturduğun bağlantıların yönlendirdiği içeriklerden sen sorumlusun. ${S.brand}, yönlendirilen üçüncü taraf sitelerin içeriğinden sorumlu değildir. Hizmet "olduğu gibi" sunulur; kesintisiz veya hatasız çalışacağı garanti edilmez. Yasaların izin verdiği ölçüde, hizmetin kullanımından doğan dolaylı zararlardan sorumluluk kabul edilmez. Tüketici mevzuatından doğan haklarınız saklıdır.`,
        ],
      },
      {
        h: '6. Fikri mülkiyet',
        p: [`${S.brand} markası, arayüzü ve yazılımı ${S.unvan}'a aittir. Hizmetin kullanımı sana bu hakların devrini sağlamaz.`],
      },
      {
        h: '7. Değişiklikler ve uygulanacak hukuk',
        p: [
          `Koşullar zaman zaman güncellenebilir; güncel sürüm bu sayfada yayımlanır. Bu koşullara Türk hukuku uygulanır. Tüketici işlemlerinde Tüketici Hakem Heyetleri ve Tüketici Mahkemeleri yetkilidir. Güncelleme tarihi: ${LEGAL_UPDATED}.`,
        ],
      },
    ],
  },
];

export const getLegalDoc = (slug) => LEGAL_DOCS.find((doc) => doc.slug === slug) || null;
