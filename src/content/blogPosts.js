/**
 * Blog posts (Turkish). Add a new post by adding an object to the TOP of BLOG_POSTS: it appears on the landing page,
 * /blog, the sitemap and gets its own prerendered HTML on the next build.
 *
 * Fields: slug, title, description (also the SEO description, ~150 chars), date (real publish date, YYYY-MM-DD),
 * readMinutes, category, highlights (3 short takeaways shown in the "Kısaca" box), sections.
 * Section shape: { h: heading, p: [paragraphs], list: [bullets] }. Headings become the table of contents.
 * Keep claims about the product accurate: link shortening, QR codes (standard / custom designer on paid plans),
 * click counts with last click and trend, custom links (@ad/metin) on Professional and Business.
 * Newest first.
 */
export const BLOG_POSTS = [
  {
    slug: 'kampanya-link-planlama-kontrol-listesi',
    title: 'Kısa Link Kampanyası Planlama Kontrol Listesi: E-posta, Sosyal Medya ve Baskı',
    description:
      'Bir kampanyada her kanal için ayrı kısa bağlantı kullanmak neden önemli? Hedef belirlemeden raporlamaya kadar uygulanabilir bir kontrol listesi.',
    date: '2026-10-10',
    readMinutes: 5,
    category: 'Pazarlama',
    highlights: [
      'Her kanal için ayrı kısa bağlantı oluştur, hangisinin işe yaradığını net gör.',
      'Yayına almadan önce her bağlantıyı mobilde test et.',
      'Sonuçları kampanya bitince değil, ilk haftanın sonunda karşılaştır.',
    ],
    sections: [
      {
        p: [
          'Kampanyanın başarısı çoğu zaman paylaşımdan önce yapılan hazırlıkla belirlenir. Hangi bağlantıyı nerede kullandığını bilmiyorsan sonuçları da yorumlayamazsın. Bu kontrol listesi e-posta, sosyal medya ve basılı materyal için ortak bir düzen kurmana yardım eder.',
        ],
      },
      {
        h: '1. Hedefi ve başarı ölçüsünü yaz',
        p: [
          'Kampanya ne için yapılıyor: kayıt, satış, etkinliğe katılım, ziyaret? Hedefi bir cümleyle yaz ve tıklamanın bu hedefe ne kadar yakın olduğunu düşün. Tıklama ilgiyi gösterir, sonuç değildir; sonucu hedef sayfadaki dönüşümle birlikte değerlendirmelisin.',
        ],
      },
      {
        h: '2. Her kanal için ayrı bağlantı oluştur',
        p: [
          'Aynı sayfaya giden ama farklı kanallarda kullanılan bağlantıları ayır: bülten, Instagram, WhatsApp, afiş QR kodu. Her biri için ayrı kısa bağlantı oluşturunca tıklama sayıları kendiliğinden kanal karşılaştırmasına dönüşür.',
        ],
      },
      {
        h: '3. Hedef sayfayı hazırla',
        list: [
          'Sayfa mobilde hızlı açılıyor ve düzgün görünüyor mu?',
          'Tek bir net eylem çağrısı var mı?',
          'Kampanya bitince sayfa ne gösterecek? Kaldırmak yerine yönlendirme düşün.',
        ],
      },
      {
        h: '4. Yayından önce test et',
        list: [
          'Her kısa bağlantıyı farklı telefon ve tarayıcıyla aç.',
          'QR kodları yazdırmadan önce gerçek boyutta tara.',
          'E-posta ve mesajlarda bağlantının tıklanabilir olduğundan emin ol.',
        ],
      },
      {
        h: '5. Takip et ve karşılaştır',
        p: [
          'İlk günlerde sayıları izle; bir kanal beklenenin çok altında kalıyorsa mesajı veya zamanlamayı değiştirmek için henüz geç değil. Kampanya sonunda en çok tıklanan kanalı ve en az tıklanan kanalı not et; bir sonraki kampanya için en değerli bilgi budur.',
        ],
      },
      {
        h: '6. Arşivle',
        p: [
          'Bağlantıları, kullanıldıkları kanalları ve sonuçları bir tabloda sakla. Kısaltıcı’da oluşturduğun bağlantılar sen silmediğin sürece çalıştığı için basılı materyaldeki eski kodlar da boşa gitmez.',
        ],
      },
    ],
  },
  {
    slug: 'sosyal-medya-biyografi-link-ipuclari',
    title: 'Sosyal Medya Biyografisine Link Ekleme: Daha Fazla Tıklama İçin 6 İpucu',
    description:
      'Biyografideki tek bağlantıyı daha etkili kullanmanın yolları: kısa ve okunur adres, net çağrı ve platform bazlı ölçüm.',
    date: '2026-10-10',
    readMinutes: 4,
    category: 'Pazarlama',
    highlights: [
      'Kısa ve okunur bir adres güven verir ve tıklamayı artırır.',
      'Her platform için ayrı bağlantı kullanırsan hangisinin işe yaradığını görürsün.',
      'Bağlantının yanında ne bulunacağını söyleyen kısa bir çağrı yaz.',
    ],
    sections: [
      {
        p: [
          'Çoğu sosyal medya profilinde tek bir bağlantı koyabilirsin. Bu küçük alan; web siten, mağazan ya da en yeni içeriğin için en değerli yer olabilir. Aşağıdaki ipuçları bu alanı daha verimli kullanmana yardım eder.',
        ],
      },
      {
        h: 'Kısa ve okunur bağlantı kullan',
        p: [
          'Uzun, parametrelerle dolu adresler hem dağınık görünür hem de güven vermez. Kısa bir bağlantı biyografide düzenli durur ve insanlar nereye gideceklerini daha net anlar.',
        ],
      },
      {
        h: 'Bağlantının ne olduğunu söyle',
        p: [
          'Bağlantının yanına kısa bir yönlendirme koy: "Yeni rehber", "Randevu al", "Menü". İnsanlar bir şey yapmaya yönlendirildiğinde daha çok tıklar.',
        ],
      },
      {
        h: 'Her platform için ayrı bağlantı oluştur',
        p: [
          'Aynı sayfaya giden ama farklı platformlarda kullanılan bağlantıları ayır. Kısaltıcı’da her bağlantının kendi tıklama sayısı olduğu için hangi platformun trafik getirdiğini kolayca karşılaştırırsın.',
        ],
      },
      {
        h: 'Bağlantıyı güncel tut',
        list: [
          'Kampanya bittiğinde hedef sayfayı yönlendirme ile güncelle.',
          'Kırık veya eski bir sayfaya giden bağlantı güveni zedeler.',
          'Her ay biyografideki bağlantıyı gözden geçir.',
        ],
      },
      {
        h: 'Mobil deneyimi öncelikle',
        p: [
          'Sosyal medya trafiğinin büyük kısmı telefondan gelir. Hedef sayfanın mobilde hızlı açıldığından ve düğmelerin kolay basıldığından emin ol.',
        ],
      },
      {
        h: 'Sonuçlara bak',
        p: [
          'Bir ay boyunca tıklama sayısını izle. Hangi içeriğin ardından tıklama arttığını fark edersen aynı türde içerik üretmeye devam edebilirsin.',
        ],
      },
    ],
  },
  {
    slug: 'kartvizit-afis-menu-qr-kod-ipuclari',
    title: 'Kartvizit, Afiş ve Menüde QR Kod: Boyut, Konum ve Tasarım İpuçları',
    description:
      'Basılı materyalde QR kod kullanırken en az ne kadar büyük olmalı, nereye konmalı ve nasıl tasarlanmalı? Pratik ölçüler ve sık yapılan hatalar.',
    date: '2026-10-10',
    readMinutes: 5,
    category: 'Rehber',
    highlights: [
      'Kartvizitte en az 2 x 2 cm, afişte tarama mesafesine göre çok daha büyük tut.',
      'QR kodun yanına ne işe yaradığını anlatan kısa bir yazı ekle.',
      'Baskıya göndermeden önce gerçek boyutta ve farklı telefonlarla test et.',
    ],
    sections: [
      {
        p: [
          'Basılı materyaldeki QR kod, ekranda gördüğünden farklı davranır: ışık, kağıt yüzeyi, mesafe ve baskı kalitesi taramayı etkiler. Bu yüzden ekranda çalışan bir kod baskıda sorun çıkarabilir. İşte baskıdan önce bilmen gerekenler.',
        ],
      },
      {
        h: 'Doğru boyutu seç',
        list: [
          'Kartvizit ve broşür: en az 2 x 2 cm.',
          'Menü ve masa kartı: 3 x 3 cm veya daha büyük.',
          'Afiş ve vitrin: tarama mesafesinin yaklaşık onda biri kadar bir kenar uzunluğu hedefle.',
        ],
      },
      {
        h: 'Kontrastı koru',
        p: [
          'Koyu desen ve açık zemin en güvenilir kombinasyondur. Renkli tasarım yaparken desenin zeminden belirgin biçimde koyu olduğundan emin ol. Parlak, yansıtıcı kağıtlarda ışık yansıması taramayı zorlaştırabilir; mat yüzeyleri tercih et.',
        ],
      },
      {
        h: 'Sessiz bölgeyi bırak',
        p: [
          'Kodun etrafındaki boş çerçeve taramanın yapılabilmesi için gereklidir. Yazı, çizgi veya görsel bu alana taşmamalıdır.',
        ],
      },
      {
        h: 'Yerleşim ve çağrı',
        list: [
          'QR kodu göz hizasında ve kolay erişilen bir yere koy.',
          'Yanına kısa bir çağrı yaz: "Menüyü görmek için tara".',
          'Katlanan veya kıvrılan yüzeylere yerleştirme.',
        ],
      },
      {
        h: 'Kısa bağlantı kullan',
        p: [
          'Kısaltılmış bir adresten üretilen QR kodun deseni daha sadedir; bu da küçük baskılarda bile taranabilirliği artırır. Ayrıca hedef sayfayı sonradan değiştirebilirsin, basılı kodu yenilemeye gerek kalmaz.',
        ],
      },
      {
        h: 'Test etmeden bastırma',
        p: [
          'Deneme baskısı al, farklı telefonlarla ve farklı ışıklarda tara. Küçük bir test, binlerce baskıyı çöpe atmaktan çok daha ucuzdur.',
        ],
      },
    ],
  },
  {
    slug: 'sahte-qr-kod-quishing-korunma',
    title: 'Sahte QR Kodlardan (Quishing) Nasıl Korunursun?',
    description:
      'QR kod ile yapılan kimlik avı saldırıları nasıl çalışır, nasıl fark edilir? Hem kullanıcılar hem QR kod paylaşanlar için güvenlik önerileri.',
    date: '2026-10-10',
    readMinutes: 4,
    category: 'Güvenlik',
    highlights: [
      'QR kodu taramadan önce kaynağına güven, üzerine yapıştırılmış etiket var mı bak.',
      'Telefon bağlantıyı gösterdiğinde adresi kontrol etmeden açma.',
      'Kendi QR kodlarını paylaşırken kısa ve tanıdık bir adres kullan.',
    ],
    sections: [
      {
        p: [
          'QR kodlar kolay ve hızlı olduğu için saldırganların da ilgisini çekiyor. "Quishing" denen yöntemde sahte bir QR kod, kullanıcıyı kimlik avı sayfasına veya zararlı bir siteye götürür. İyi haber şu ki birkaç alışkanlıkla bu riski büyük ölçüde azaltabilirsin.',
        ],
      },
      {
        h: 'Saldırı nasıl çalışır?',
        p: [
          'Saldırgan, meşru bir QR kodun üzerine kendi kodunu yapıştırır ya da e-posta ve mesajla sahte bir kod gönderir. Kodu tarayan kişi, bankasına veya bilindik bir hizmete benzeyen sahte bir sayfaya yönlenir ve oraya bilgilerini girer.',
        ],
      },
      {
        h: 'Taramadan önce kontrol listesi',
        list: [
          'Kod, güvenilir bir yerde mi duruyor? Üzerine yapıştırılmış bir etiket veya kaymış bir katman var mı?',
          'Tanımadığın bir kaynaktan gelen e-posta ya da mesajdaki kodlara şüpheyle yaklaş.',
          'Aciliyet baskısı yapan mesajlara ("hesabın kapanacak") güvenme.',
        ],
      },
      {
        h: 'Taradıktan sonra',
        list: [
          'Telefon adresi gösterdiğinde tamamını oku, tanıdık bir alan adı mı?',
          'Giriş bilgisi, kart numarası veya doğrulama kodu isteyen sayfalarda daha da dikkatli ol.',
          'Şüphe varsa sayfayı kapat ve ilgili kuruma bilinen kanallardan ulaş.',
        ],
      },
      {
        h: 'QR kod paylaşanlar için öneriler',
        list: [
          'Kodlarını güvenli, kontrol edebildiğin yerlerde göster.',
          'Kısa ve tanıdık bir adres kullan; uzun, karmaşık adresler şüphe uyandırır.',
          'Kodun yanına kimin yayınladığını ve ne işe yaradığını yaz.',
          'Basılı kodları belirli aralıklarla kontrol et; üzerine bir şey yapışmış mı bak.',
        ],
      },
      {
        h: 'Kısaltıcı’da güvenlik',
        p: [
          'Kısaltıcı kimlik avı, zararlı yazılım ve aldatıcı içeriğe yönlendirmeyi kullanım koşullarında yasaklar; bu tür bağlantılar devre dışı bırakılabilir. Tanımadığın bir kısa bağlantıya tıklamadan önce kimden geldiğini mutlaka düşün.',
        ],
      },
    ],
  },
  {
    slug: 'ozel-kisa-link-marka-baglantisi',
    title: 'Özel Kısa Link Nedir? Markana Özel Bağlantı Oluşturmanın 5 Faydası',
    description:
      'Rastgele kodlar yerine okunur, akılda kalan özel bir kısa bağlantı kullanmak güveni ve hatırlanabilirliği nasıl artırır? Faydalar ve ipuçları.',
    date: '2026-10-10',
    readMinutes: 4,
    category: 'Marka',
    highlights: [
      'Özel bağlantı, okunur ve akılda kalan bir adres demektir.',
      'Marka tutarlılığı ve güven için tek biçimde isimlendir.',
      'Kısaltıcı’da Profesyonel ve Kurumsal planlarda özel bağlantı oluşturabilirsin.',
    ],
    sections: [
      {
        p: [
          'Bir kısa bağlantının sonu genellikle rastgele karakterlerden oluşur: aB3xYz gibi. İşe yarar ama akılda kalmaz. Özel kısa bağlantıda adresin sonunu kendin belirlersin; "portfolyo", "menu" ya da "kampanya" gibi.',
        ],
      },
      {
        h: '1. Akılda kalır',
        p: [
          'Anlamlı bir kelime, rastgele bir koddan çok daha kolay hatırlanır. Sözlü olarak paylaşılan bağlantılar (radyo, sunum, telefon görüşmesi) için bu büyük fark yaratır.',
        ],
      },
      {
        h: '2. Güven verir',
        p: [
          'İnsanlar neye tıkladıklarını bilmek ister. İçeriği anlatan bir adres, rastgele karakterlerden daha güvenilir görünür.',
        ],
      },
      {
        h: '3. Marka tutarlılığı sağlar',
        p: [
          'Tüm kanallarda aynı kalıbı kullanmak profesyonel bir görünüm kazandırır. Örneğin kisaltici.com/@ad/portfolyo biçiminde adına bağlı bir adres hem sahibini hem içeriği belli eder.',
        ],
      },
      {
        h: '4. Paylaşımı kolaylaştırır',
        p: [
          'Kısa ve okunur bir adres kartvizitte, sunumda veya videoda elle yazılabilir. Kopyalama hatalarını azaltır.',
        ],
      },
      {
        h: '5. Ölçümü anlamlı kılar',
        p: [
          'Her kampanyaya anlamlı bir isim verdiğinde raporlarda hangi bağlantının ne getirdiğini hemen anlarsın.',
        ],
      },
      {
        h: 'İpuçları',
        list: [
          'Kısa tut ve gereksiz kelimelerden kaçın.',
          'Küçük harf ve tutarlı bir isimlendirme kullan.',
          'Kampanya bağlantılarında yıl veya dönem ekleyerek çakışmaları önle.',
          'Yanlış yazımı kolay olan karakterlerden kaçın.',
        ],
      },
      {
        h: 'Kısaltıcı’da özel bağlantı',
        p: [
          'Profesyonel ve Kurumsal planlarda adresin sonunu kendin yazabilirsin. İstediğinde tek tıkla otomatik koda dönebilirsin.',
        ],
      },
    ],
  },
  {
    slug: 'qr-kod-nasil-olusturulur',
    title: 'QR Kod Nasıl Oluşturulur? Adım Adım Rehber',
    description:
      'Bir bağlantı için QR kod oluşturmayı, taranabilir ve şık bir tasarım yapmayı ve en sık yapılan hataları adım adım öğren.',
    date: '2026-10-10',
    readMinutes: 5,
    category: 'Rehber',
    highlights: [
      'Uzun bir adresi önce kısalt, QR kodun deseni sadeleşir ve daha kolay taranır.',
      'Yüksek kontrast, yeterli boşluk ve makul boyut taranabilirliği belirler.',
      'Baskıya göndermeden önce farklı telefonlarla test et.',
    ],
    sections: [
      {
        p: [
          'QR kodlar; menülerde, afişlerde, kartvizitlerde ve ürün ambalajlarında bir bağlantıya tek taramayla ulaşmanın en pratik yolu. Doğru hazırlanmış bir QR kod hem hızlı taranır hem de markanı yansıtır. Bu rehberde bir bağlantıdan QR kod oluşturmayı ve işi baştan doğru yapmanın püf noktalarını anlatıyoruz.',
        ],
      },
      {
        h: 'QR kod nedir ve nasıl çalışır?',
        p: [
          'QR kod, içine bir metin ya da web adresi gömülmüş iki boyutlu bir barkoddur. Telefonun kamerası kodu okur ve içindeki adresi açmayı önerir. Kodun içinde ne kadar çok veri varsa desen o kadar karmaşık ve taranması o kadar zor olur. Bu yüzden uzun bir web adresini doğrudan koda gömmek yerine önce kısaltmak en güvenli yöntemdir.',
        ],
      },
      {
        h: 'Adım adım QR kod oluşturma',
        list: [
          'Hedef sayfayı belirle: kodun açacağı adres mobilde düzgün görünen bir sayfa olmalı.',
          'Bağlantıyı kısalt: kısa adres hem kodu sadeleştirir hem de tıklamaları saymanı sağlar.',
          'QR kodu oluştur: bağlantını yapıştır, QR kod seçeneğini seç ve kodu indir.',
          'Gerekirse tasarımı özelleştir: renk, modül şekli, köşe stili ve ortadaki logo ayarlanabilir.',
          'Yazdırmadan önce test et: farklı telefonlarla ve farklı mesafelerden tara.',
        ],
      },
      {
        h: 'Taranabilir bir QR kodun kuralları',
        list: [
          'Yüksek kontrast kullan: koyu desen, açık zemin en güvenlisidir. Açık renk desen koyu zeminde bazı tarayıcılarda okunmaz.',
          'Sessiz bölgeyi koru: kodun etrafında en az dört modül genişliğinde boşluk bırak.',
          'Boyutu küçültme: basılı kodlar için en az 2 x 2 cm hedefle, uzaktan taranacak afişlerde çok daha büyük tut.',
          'Logoyu abartma: ortadaki logo kodun küçük bir kısmını kaplamalı. Çok büyük logo okumayı bozar.',
          'Vektör formatı tercih et: büyük baskılarda SVG bulanıklaşmaz.',
        ],
      },
      {
        h: 'Kısaltılmış bağlantıyla QR kodun avantajı',
        p: [
          'Kısa bağlantıdan üretilen QR kodun deseni daha az yoğundur, bu da daha küçük baskıda bile rahat taranması demektir. Ayrıca her tarama bir tıklama olarak sayılır; hangi kampanyanın ilgi çektiğini görebilirsin. Hedef sayfayı sonradan değiştirmen gerekirse basılı kodu yeniden basmak zorunda kalmazsın, çünkü kod kısa adrese işaret eder.',
        ],
      },
      {
        h: 'En sık yapılan hatalar',
        list: [
          'Denemeden baskıya göndermek.',
          'Zayıf kontrastlı veya çok dekoratif renkler seçmek.',
          'Mobil uyumlu olmayan bir sayfaya yönlendirmek.',
          'Kodun yanına ne işe yaradığını yazmamak: kısa bir "Menüyü görmek için tara" notu taramayı artırır.',
        ],
      },
      {
        h: 'Kısaltıcı ile QR kod oluşturmak',
        p: [
          'Kısaltıcı’da bağlantını yapıştırıp QR kod seçeneğini seçtiğinde standart bir kod hazır olur. Başlangıç ve üzeri planlarda özel tasarım ekranıyla renkleri, modül şeklini, köşe stilini ve ortadaki görseli ayarlayabilirsin. Ayarlar bağlantınla birlikte saklanır, böylece kodu istediğin zaman aynı görünümle yeniden indirebilirsin.',
        ],
      },
    ],
  },
  {
    slug: 'link-kisaltma-nedir',
    title: 'Link Kısaltma Nedir? Faydaları ve Nasıl Kullanılır',
    description:
      'Link kısaltma nasıl çalışır, ne işe yarar ve hangi durumlarda işine yarar? Kısa bağlantıların faydalarını ve güvenlik ipuçlarını öğren.',
    date: '2026-10-10',
    readMinutes: 4,
    category: 'Temel Bilgi',
    highlights: [
      'Kısa bağlantı, uzun adresi paylaşması ve okuması kolay bir adrese çevirir.',
      'Tıklama sayısını görmek kampanyalarını ölçmeni sağlar.',
      'Tanımadığın kaynaklardan gelen kısa bağlantılara dikkat et.',
    ],
    sections: [
      {
        p: [
          'Uzun, parametrelerle dolu bir web adresini mesajla paylaşmaya çalıştığında karşına kırılan satırlar, okunmayan adresler ve hatalı kopyalamalar çıkar. Link kısaltma bu sorunu çözer: uzun adresi kısa ve akılda kalır bir adrese çevirir, kısa adrese tıklayan herkes asıl sayfaya yönlenir.',
        ],
      },
      {
        h: 'Link kısaltma nasıl çalışır?',
        p: [
          'Bir kısaltma hizmeti, uzun adresini bir veri tabanında kısa bir kodla eşleştirir. Kısa adrese (örneğin alanadi.com/aB3xYz) bir ziyaretçi geldiğinde hizmet kodu bulur ve ziyaretçiyi saniyenin küçük bir bölümünde asıl adrese yönlendirir. Bu yönlendirme sırasında tıklama kaydedilebilir; böylece bağlantının kaç kez açıldığını bilirsin.',
        ],
      },
      {
        h: 'Kısa bağlantıların faydaları',
        list: [
          'Okunabilirlik: kısa adres mesajlarda, sosyal medya biyografilerinde ve basılı materyallerde düzgün durur.',
          'Paylaşım kolaylığı: kopyalarken yarım kalma ve satır bölünmesi sorunu ortadan kalkar.',
          'Ölçüm: tıklama sayısını ve zaman içindeki dağılımı görebilirsin.',
          'QR kod uyumu: kısa adresten üretilen QR kod daha sade ve daha kolay taranır.',
          'Marka algısı: özel bir kısa adres düzenli ve güvenilir görünür.',
        ],
      },
      {
        h: 'Hangi durumlarda kullanılır?',
        list: [
          'Sosyal medya biyografisi ve gönderi açıklamaları',
          'E-posta imzası ve bültenler',
          'SMS ve mesajlaşma uygulamaları (karakter sınırı olan yerler)',
          'Afiş, broşür, kartvizit ve ambalajlardaki QR kodlar',
          'Etkinlik, kayıt ve anket formu bağlantıları',
        ],
      },
      {
        h: 'Güvenlik: kısa bağlantıya nasıl güvenilir?',
        p: [
          'Kısa adres hedefi gizlediği için kötü niyetli kişiler de bu yöntemi kullanabilir. Tanımadığın bir kaynaktan gelen kısa bağlantıya tıklamadan önce kimden geldiğini düşün, mümkünse hedefi önizle. Kendi bağlantılarını paylaşırken de sadece güvendiğin sayfalara yönlendirmelisin; kimlik avı, zararlı yazılım ve aldatıcı içerik yönlendirmeleri hizmet koşullarına aykırıdır.',
        ],
      },
      {
        h: 'Kısa bağlantılar süresiz çalışır mı?',
        p: [
          'Bu hizmetin sağlayıcısına bağlıdır. Kısaltıcı’da oluşturduğun bağlantılar sen silmediğin sürece çalışmaya devam eder. Bu da basılı materyallerde ve kalıcı paylaşımlarda önemli bir güvence sağlar.',
        ],
      },
    ],
  },
  {
    slug: 'link-tiklamalari-nasil-takip-edilir',
    title: 'Kısa Link Tıklamaları Nasıl Takip Edilir? UTM ile Doğru Ölçüm',
    description:
      'Paylaştığın bağlantının kaç kez tıklandığını nasıl görürsün? Tıklama takibinin temelleri ve UTM etiketleriyle kampanya ölçümü rehberi.',
    date: '2026-10-10',
    readMinutes: 5,
    category: 'Rehber',
    highlights: [
      'Toplam tıklama, son tıklama ve zaman içindeki dağılım ilgiyi gösterir.',
      'UTM etiketleri trafiğin kaynağını analiz araçlarında ayırmanı sağlar.',
      'Her kanal için ayrı kısa bağlantı oluşturmak karşılaştırmayı kolaylaştırır.',
    ],
    sections: [
      {
        p: [
          'Bir bağlantıyı paylaşmak işin yarısı; ne kadar ilgi gördüğünü bilmek diğer yarısı. Hangi gönderinin, hangi e-postanın ya da hangi afişin trafik getirdiğini ölçmeden bütçeyi ve zamanı doğru yere harcamak zordur. Bu yazıda kısa bağlantılarla tıklama takibinin nasıl çalıştığını ve UTM etiketleriyle ölçümü nasıl daha anlamlı hale getirebileceğini anlatıyoruz.',
        ],
      },
      {
        h: 'Tıklama takibi nasıl çalışır?',
        p: [
          'Kısa adrese her tıklandığında hizmet bunu kaydeder ve ziyaretçiyi hedefe yönlendirir. Böylece toplam tıklama sayısını, son tıklamanın zamanını ve zaman içindeki dağılımı görebilirsin. Kısaltıcı’da her bağlantının kendi sayfasında bu bilgiler yer alır.',
        ],
      },
      {
        h: 'Tıklama sayısını doğru yorumlamak',
        list: [
          'Tıklama, satış değildir: tıklamayı sonuca (kayıt, satın alma) bağlayan sayfa içi ölçümle birleştir.',
          'Aynı kişi birden fazla tıklayabilir: toplam tıklama tekil ziyaretçi sayısı demek değildir.',
          'Botlar ve bağlantı önizlemeleri sayıyı şişirebilir: sosyal ağlar paylaşım önizlemesi için bağlantıyı açabilir.',
          'Trendlere bak: tek bir günün sayısından çok zaman içindeki değişim size yol gösterir.',
        ],
      },
      {
        h: 'UTM etiketleri nedir?',
        p: [
          'UTM, hedef adrese eklenen küçük parametrelerdir ve analiz araçlarının trafiğin nereden geldiğini anlamasını sağlar. Başlıca parametreler şunlardır:',
        ],
        list: [
          'utm_source: trafiğin kaynağı (örneğin instagram, bulten)',
          'utm_medium: kanal türü (örneğin sosyal, eposta, qr)',
          'utm_campaign: kampanya adı (örneğin yaz-indirimi)',
        ],
      },
      {
        h: 'UTM ile kısa bağlantıyı birlikte kullanmak',
        p: [
          'UTM etiketli adresler uzun ve karışık görünür. Bu adresi önce etiketlerle hazırlayıp sonra kısaltırsan hem temiz paylaşılabilir bir bağlantı elde edersin hem de tıklama sayısını bağlantı bazında görürsün. Her kanal için ayrı bir kısa bağlantı oluşturmak, hangi kanalın daha çok ilgi çektiğini net biçimde ortaya koyar.',
        ],
      },
      {
        h: 'Küçük bir ölçüm planı',
        list: [
          'Hedefini yaz: daha çok kayıt mı, daha çok ziyaret mi?',
          'Her kanal için ayrı etiketli bir kısa bağlantı oluştur.',
          'Bağlantıları ve etiketlerini bir tabloda tut.',
          'Bir hafta sonra tıklama sayılarını karşılaştır ve ilgi gören kanala yatırım yap.',
          'Basılı materyalde QR kod kullan; her baskı için ayrı bağlantı oluşturarak hangisinin daha çok tarandığını gör.',
        ],
      },
    ],
  },
];

export const getBlogPost = (slug) => BLOG_POSTS.find((post) => post.slug === slug) || null;

/** Other posts for the "recommended" block under an article: same category first, then newest. */
export const getRelatedPosts = (slug, count = 3) => {
  const current = getBlogPost(slug);
  const others = BLOG_POSTS.filter((post) => post.slug !== slug);
  const sameCategory = others.filter((post) => current && post.category === current.category);
  const rest = others.filter((post) => !sameCategory.includes(post));
  return [...sameCategory, ...rest].slice(0, count);
};

export const BLOG_CATEGORIES = [...new Set(BLOG_POSTS.map((post) => post.category))];

/** URL-safe id for a heading (table of contents anchors). */
export const headingId = (text = '') =>
  text
    .toLocaleLowerCase('tr-TR')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const formatPostDate = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
