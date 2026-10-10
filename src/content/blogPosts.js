/**
 * Blog posts (Turkish). Add a new post by appending an object here: it appears on the landing page, /blog,
 * the sitemap and gets its own prerendered HTML on the next build.
 *
 * Section shape: { h: heading, p: [paragraphs], list: [bullets] }. Keep claims about the product accurate:
 * link shortening, QR codes (standard / custom designer on paid plans), click counts with last click and trend.
 * Newest first.
 */
export const BLOG_POSTS = [
  {
    slug: 'qr-kod-nasil-olusturulur',
    title: 'QR Kod Nasıl Oluşturulur? Adım Adım Rehber',
    description:
      'Bir bağlantı için QR kod oluşturmayı, taranabilir ve şık bir tasarım yapmayı ve en sık yapılan hataları adım adım öğren.',
    date: '2026-10-10',
    readMinutes: 5,
    category: 'Rehber',
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
    date: '2026-10-08',
    readMinutes: 4,
    category: 'Temel Bilgi',
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
    date: '2026-10-05',
    readMinutes: 5,
    category: 'Rehber',
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

/** Other posts for the "recommended" block under an article (newest first, current one excluded). */
export const getRelatedPosts = (slug, count = 2) => BLOG_POSTS.filter((post) => post.slug !== slug).slice(0, count);

export const formatPostDate = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
