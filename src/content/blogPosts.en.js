/**
 * English blog posts, keyed by the Turkish post's slug (see blogPosts.tr.js). Every post needs an entry here:
 * slug (English URL), title, description, highlights and sections in the same shape as the Turkish source.
 */
export const POSTS_EN = {
  'kisa-link-nasil-olusturulur': {
    slug: 'how-to-create-a-short-link',
    seoTitle: 'How to Create a Short Link, Step by Step',
    title: 'How to Create a Short Link: A Step-by-Step Guide and Things to Watch For',
    description:
      'The steps to create a short link from a long address, tips for copying and sharing, click tracking and common mistakes. An example flow with Kısaltıcı.',
    highlights: [
      'To create a short link, copy the long address and paste it into a shortening service.',
      'After creating it, test the link and use a separate short link for each channel.',
      'Watch the click count to see which channel works.',
    ],
    sections: [
      {
        p: [
          'Sharing a long web address is a hassle: it breaks in messages, looks messy in a bio and invites typing mistakes. A short link solves this. Here is how to create one from start to finish.',
        ],
      },
      {
        h: '1. Prepare the long address',
        p: [
          'Copy the full address of the page you want to share from your browser’s address bar. Make sure it starts with https:// and that the page opens. If you will track a campaign, you can prepare the address with UTM tags first.',
        ],
      },
      {
        h: '2. Paste it into the shortening service',
        p: [
          'On Kısaltıcı, after starting a plan and signing in, paste the address into the box on the main screen and choose to shorten it. If you like, you can create a QR code for the same address, and on the Professional and Business plans you can write the end of the address yourself.',
        ],
      },
      {
        h: '3. Copy and test',
        list: [
          'Copy the short link that is created.',
          'Open it in a new tab and check that it goes to the right page.',
          'Open it on mobile too: does the page look fast and tidy?',
        ],
      },
      {
        h: '4. Share',
        list: [
          'Social media bios and post descriptions',
          'Email, messages and newsletters',
          'As a QR code on printed materials',
        ],
      },
      {
        h: '5. Track the clicks',
        p: [
          'On each link’s own page you see the total clicks, the last click and the distribution over time. If you create separate short links for different channels, you can easily compare which channel gets more interest.',
        ],
      },
      {
        h: 'Common mistakes',
        list: [
          'Sharing the link without testing it.',
          'Using the same short link in every channel and blurring the measurement.',
          'Copying the destination wrongly: a short link’s destination cannot be changed later, so you would need to create a new link.',
          'Pointing to a temporary page that will expire.',
        ],
      },
    ],
  },

  'link-kisaltici-secerken-kriterler': {
    slug: 'choosing-a-link-shortener',
    seoTitle: '7 Criteria for Choosing a Link Shortener',
    title: '7 Criteria for Choosing a Link Shortener: Which Service Should You Use?',
    description:
      'Learn seven criteria to check when choosing a link shortening service: security, continuity, measurement, QR codes, custom links and price.',
    highlights: [
      'The most important criterion is that links keep working for a long time.',
      'Choose a plan by your need for measurement, QR codes and custom links.',
      'Prefer a service with abuse monitoring and transparent pricing.',
    ],
    sections: [
      {
        p: [
          'There are many link shortening services. Even if they all seem to do the same job, the differences can have big consequences for printed materials, campaigns or your brand’s reputation. Look at these seven criteria when choosing.',
        ],
      },
      {
        h: '1. Continuity: how long do links live?',
        p: [
          'If a short link is printed on a business card or poster, it needs to work for years. Check that the service keeps links working until the user deletes them and does not set a time limit.',
        ],
      },
      {
        h: '2. Security and abuse monitoring',
        p: [
          'A service that monitors for phishing and harmful content and offers abuse reporting protects both you and your visitors. A domain’s reputation depends on the care taken here.',
        ],
      },
      {
        h: '3. Click measurement',
        p: [
          'Check information such as total clicks, the distribution over time and, if needed, how far back the history goes. Measurement is the basis for improving your campaigns.',
        ],
      },
      {
        h: '4. QR code support',
        p: [
          'If you use printed materials, a service that can create QR codes and offers customization such as color, shape and logo makes your job easier. When the QR code points to the short link, scans are counted.',
        ],
      },
      {
        h: '5. Custom links',
        p: [
          'For brand recognition, being able to write the end of the address yourself can matter. A custom link means memorable, trust-building addresses.',
        ],
      },
      {
        h: '6. Transparent pricing',
        list: [
          'See the plan limits (daily links, QR codes, statistics period) clearly.',
          'Learn the trial period and cancellation terms in advance.',
          'Check payment security and invoice details.',
        ],
      },
      {
        h: '7. Support and legal transparency',
        p: [
          'Choose a provider that clearly publishes who runs the service, its privacy policy and its terms of use. If contact details and refund terms are unclear, you will struggle when a problem comes up.',
        ],
      },
    ],
  },

  'etkinlik-daveti-qr-kod': {
    slug: 'qr-code-for-event-invitations',
    seoTitle: 'QR Codes for Event Invitations',
    title: 'QR Codes for Event Invitations: Send Guests to Registration and the Venue with One Scan',
    description:
      'Use QR codes on invitations, posters and social media visuals to send guests to the registration page and the venue. Design, size and measurement tips.',
    highlights: [
      'The QR code on an invitation should do one job: registration, location or schedule.',
      'Place it large enough with high contrast and write a clear call to action next to it.',
      'Use a separate short link for each invitation channel to see which one brings guests.',
    ],
    sections: [
      {
        p: [
          'A wedding, a launch, a workshop or a conference: however beautiful the invitation, the guest’s next step must be easy. A QR code makes that step easier by taking the invitee to the registration form, the location or the event schedule with one scan.',
        ],
      },
      {
        h: 'What should the QR code on an invitation be for?',
        list: [
          'RSVP or a registration form',
          'A location and directions page',
          'Schedule and speaker information',
          'Extra links such as a gift list or donation page',
        ],
      },
      {
        h: 'Design and placement',
        list: [
          'Use at least 2 x 2 cm on a printed invitation and much larger on a poster.',
          'High contrast: a dark pattern on a light background.',
          'Leave blank space around it; do not let decoration or text run over the code.',
          'Write a short call to action next to it, such as "Scan to RSVP".',
          'Test with different phones before printing.',
        ],
      },
      {
        h: 'Why does a short link help?',
        p: [
          'A code made from a short address is simpler and scans comfortably even in small prints. And when you create a separate short link for each invitation channel (printed invitation, WhatsApp, social media), you can see which channel brings attendance.',
        ],
      },
      {
        h: 'For digital invitations',
        p: [
          'In invitations sent by email or message, use a clickable short link instead of a QR code; people can already tap on their phones. Keep the QR code for printed materials and screen displays.',
        ],
      },
      {
        h: 'After the event',
        p: [
          'Do not let the page the link leads to stay empty once the event is over. Show a thank-you message, photos or the announcement of the next event.',
        ],
      },
    ],
  },

  'kisa-linkler-nasil-calisir': {
    slug: 'how-short-links-work',
    seoTitle: 'How Do Short Links Work?',
    title: 'How Do Short Links Work? What Redirects, Short Codes and Click Counting Do Behind the Scenes',
    description:
      'What happens behind a short link? Learn in plain language how short codes, redirect types and click counting work.',
    highlights: [
      'A short link is a redirect that maps a short code to a long address.',
      'The redirect takes a few milliseconds, and the click is recorded during it.',
      'How reliable a link is depends on the service keeping it working.',
    ],
    sections: [
      {
        p: [
          'Short links look simple, but a small system works behind them: a code, a database and a redirect. In this article we explain step by step what happens behind the scenes when you click a short link.',
        ],
      },
      {
        h: '1. A short code is created',
        p: [
          'When you shorten an address, the service generates a short, unique code for it (for example aB3xYz). The code and the long address are matched in a database. The code must be unique; two addresses cannot carry the same code.',
        ],
      },
      {
        h: '2. A visitor arrives at the short address',
        p: [
          'When someone clicks the short link, their browser sends a request to the short domain and code. The request reaches the server of the service that manages the link.',
        ],
      },
      {
        h: '3. The server finds the code and redirects',
        p: [
          'The server looks the code up in its database, finds the long address it belongs to and tells the browser "go to this address" (an HTTP redirect). The browser follows the redirect automatically and the visitor reaches the real page. The whole process usually takes a tiny fraction of a second.',
        ],
      },
      {
        h: '4. The click is recorded',
        p: [
          'During the redirect, the service creates a click record with basic information such as the time. That is how you can see how many times the link was opened and how clicks are distributed over time. A click count does not mean the number of unique visitors.',
        ],
      },
      {
        h: 'Redirect types',
        list: [
          'Permanent redirect (301/308): the address has moved for good; browsers and search engines may cache it.',
          'Temporary redirect (302/307): the address goes somewhere else for now; short link services often use it so each click can be counted every time.',
        ],
      },
      {
        h: 'Safety and continuity',
        p: [
          'Because a short link hides its destination, it can be misused; trustworthy services therefore monitor for phishing and harmful content. How long a link keeps working also depends on the service keeping it alive; that continuity matters for a link you will use on printed materials.',
        ],
      },
    ],
  },

  'qr-kod-ile-yol-tarifi': {
    slug: 'qr-code-for-directions',
    seoTitle: 'QR Codes for Directions and Location Sharing',
    title: 'QR Codes for Directions and Location Sharing: Bring Customers to Your Shop with One Scan',
    description:
      'Turn your map location link into a short link and a QR code so customers can find you easily. Tips for windows, business cards and invitations.',
    highlights: [
      'Copy your location link from a map app, shorten it and turn it into a QR code.',
      'Use the code on business cards, windows and invitations so customers get directions with one tap.',
      'Test it: confirm the map app opens the right location on different phones.',
    ],
    sections: [
      {
        p: [
          'Customers finding you is the first step of a sale. Instead of explaining "where we are" by writing out an address, if you turn a map link into a QR code, customers reach directions with one scan.',
        ],
      },
      {
        h: 'How do you get the map link?',
        p: [
          'In the map app you use, find your business or location and copy the link with the share option. The interface changes from app to app and over time; look for the share option on the location screen.',
        ],
      },
      {
        h: 'Why shorten it and turn it into a QR code?',
        list: [
          'Map links can be long; a QR code made from a short address scans more easily.',
          'The short link’s click count shows how many people looked at directions.',
          'With a separate link for each placement, you see which spot works best.',
        ],
      },
      {
        h: 'Where can you use it?',
        list: [
          'On business cards, brochures and invitations',
          'On the shop window and sign (large enough to read from afar)',
          'On the contact page of your website',
          'On shipping and package cards',
          'At fair and event stands',
        ],
      },
      {
        h: 'Tips for a good result',
        list: [
          'Write "Scan for directions" next to the code.',
          'Test with a few different phones and confirm the right location opens.',
          'If the address or location changes, prepare a new link and code and update the old materials.',
          'Add your opening hours and phone number next to it.',
        ],
      },
    ],
  },

  'e-posta-imzasi-link-qr': {
    slug: 'email-signature-link-and-qr-code',
    seoTitle: 'Add a Link and QR Code to Your Email Signature',
    title: 'How to Add a Link and QR Code to Your Email Signature: Turn Every Message into a Small Ad',
    description:
      'Add a short link and QR code to your email signature to turn every message into traffic. What to write, how to measure and which mistakes to avoid.',
    highlights: [
      'Use one clear link and call to action in the signature; do not put a link on every line.',
      'A short link keeps the signature clean and shows how many people clicked.',
      'Update the link regularly so the signature does not go stale when a campaign ends.',
    ],
    sections: [
      {
        p: [
          'If you send dozens of emails a day, each one carries the small space under your signature. That space is often filled only with a name, title and phone number. Yet a single well-chosen link can become a steady source of traffic.',
        ],
      },
      {
        h: 'What should you add to the signature?',
        list: [
          'One main link: your website, booking page, portfolio or most important campaign.',
          'A short call to action: "See our services", "Book a slot".',
          'If you like, a small QR code; handy for people who read on a desktop but want to scan with a phone.',
        ],
      },
      {
        h: 'Why a short link?',
        p: [
          'Long addresses look messy in a signature and can break lines in some email clients. A short link looks neat and lets you see the click count. If you create a separate short address for your signature link, you can separate the interest from this channel from others.',
        ],
      },
      {
        h: 'How do you set up a good signature?',
        list: [
          'Keep it short: a name, title, one way to reach you and one link are enough.',
          'Put the text link ahead of images; some clients block images by default.',
          'Print or add the QR code large enough, but avoid images that take up space in the signature.',
          'Test on mobile too: the signature should not overflow on a phone.',
        ],
      },
      {
        h: 'Common mistakes',
        list: [
          'Adding several links: attention is split and clicks drop.',
          'Leaving an outdated campaign link in the signature.',
          'Spreading the link without testing it: a typo repeats across thousands of messages.',
          'Using a very large image: it weighs the email down and increases the risk of hitting a spam filter.',
        ],
      },
      {
        h: 'Measure the results',
        p: [
          'After a month, look at the click count of the link in your signature. If your team uses the same signature, you can create a separate short link for each person and see whose emails bring more clicks.',
        ],
      },
    ],
  },

  'freelancer-portfolyo-linki': {
    slug: 'freelancer-portfolio-link',
    seoTitle: 'How to Share a Freelancer Portfolio Link',
    title: 'How to Share a Freelancer Portfolio Link: Create a Memorable, Measurable Address',
    description:
      'Ways to share your portfolio link with clients and employers more effectively: a short, memorable address, a QR code and view measurement.',
    highlights: [
      'A portfolio address should be short, readable and professional.',
      'Use a separate short link for each application or platform and see which works.',
      'Use the same link on business cards, your CV and profiles to build a consistent brand.',
    ],
    sections: [
      {
        p: [
          'As a freelancer, the visibility of your work depends largely on your portfolio link. When a potential client sees you for the first time, they decide in a few seconds: will they click the link or not? A long, messy address lowers trust, while a short, tidy one leaves a professional impression.',
        ],
      },
      {
        h: 'What should a good portfolio address look like?',
        list: [
          'Short and readable: an address you can say on the phone and type by hand.',
          'Consistent: the same address on business cards, CV, profiles and email signature.',
          'Trustworthy: a meaningful structure instead of random characters.',
        ],
      },
      {
        h: 'Strengthen your brand with a custom link',
        p: [
          'On Kısaltıcı’s Professional and Business plans you can write the end of the address yourself, for example lnk1.tr/@name/portfolio. An address like that shows both the owner and the content, and it is memorable.',
        ],
      },
      {
        h: 'A separate link for each channel',
        p: [
          'Separate links that lead to the same portfolio but are used in different places: a job application, a social media profile, a business card. Each one’s click count is shown separately, so you learn which channel brings you more interest and spend more time on it.',
        ],
      },
      {
        h: 'Where should you use a QR code?',
        list: [
          'On the back of or next to your business card',
          'At fair, event and meetup stands',
          'On printed CVs and presentation files',
          'On the last slide of your presentation',
        ],
      },
      {
        h: 'Prepare your portfolio page',
        list: [
          'Use a page that loads fast and reads well on mobile.',
          'Show your best three works at the top.',
          'Keep your contact details visible and easy to find.',
          'Remove old work that no longer represents you.',
        ],
      },
    ],
  },

  'pazaryeri-magaza-baglantisi': {
    slug: 'share-your-marketplace-store-link',
    seoTitle: 'Guide to Sharing Your Marketplace Store Link',
    title: 'Guide to Sharing Your Marketplace Store Link: Short Links and QR Codes for Trendyol, Hepsiburada and Others',
    description:
      'Short link and QR code tips to use your marketplace store or product link more effectively on social media, packaging and print.',
    highlights: [
      'Turn the store or product link into a short link and create a separate one for each channel.',
      'Use QR codes on packaging, shipping cards and shop windows.',
      'Follow the marketplace’s rules; read its campaign and redirect rules in advance.',
    ],
    sections: [
      {
        p: [
          'If you sell on a marketplace, most of your traffic comes from the marketplace’s own search. But you can also bring extra traffic from your own channels (social media, email, a physical shop, packaging). For that you need to share your store or product link correctly.',
        ],
      },
      {
        h: 'Why a short link?',
        list: [
          'Marketplace addresses can be long and full of parameters; a short link looks tidy when shared.',
          'With a separate short link for each channel, you can see which channel brings more visits.',
          'A QR code made from a short address is easier to scan.',
        ],
      },
      {
        h: 'Where can you use it?',
        list: [
          'Social media bios and post descriptions',
          'On product packaging and shipping cards as a QR code',
          'Email signatures and newsletters',
          'Physical shop windows and the till',
          'Fair and event stands',
        ],
      },
      {
        h: 'A QR code on packaging',
        p: [
          'For the customer who receives your product, the package is a second sales opportunity. By putting a QR code that leads to your store link on the packaging or shipping card, you can send your customer to new products or your reviews page. Print the code at an adequate size with high contrast and write a short call to action next to it.',
        ],
      },
      {
        h: 'Mind the rules',
        p: [
          'Marketplaces’ rules on campaigns, redirects and communication differ. Read in advance the rules on directing customers off the marketplace or asking for reviews, and share in a way that complies with them. A redirect that breaks the rules can put your store at risk.',
        ],
      },
      {
        h: 'A measurement plan',
        list: [
          'Create a separate short link for each channel.',
          'Keep the links and where they are used in a table.',
          'After a week, compare the click counts.',
          'Invest more in the channel that gets the most interest.',
        ],
      },
    ],
  },

  'instagram-biyografi-link-ekleme': {
    slug: 'how-to-add-a-link-to-your-instagram-bio',
    seoTitle: 'Add a Link to Your Instagram Bio',
    title: 'How to Add a Link to Your Instagram Bio: Step by Step and Common Mistakes',
    description:
      'Steps to add a link to your Instagram profile, ways to make better use of the single link and common mistakes. Measurement tips with short links.',
    highlights: [
      'You add the link in the link field of the profile edit screen; the interface can change over time.',
      'Use a short, readable address and write the call to action in your bio.',
      'Create a separate short link for each platform and campaign and compare clicks.',
    ],
    sections: [
      {
        p: [
          'On Instagram you cannot put clickable links under your posts, so the link field on your profile is one of the most valuable spots. Used well, it sends followers to your website, your shop or your newest content.',
        ],
      },
      {
        h: 'How do you add the link?',
        list: [
          'Open your profile in the Instagram app and tap "Edit profile".',
          'Find the Links (or Website) field and add your link.',
          'Make sure the address starts with https:// and is typed correctly.',
          'Save, then open your profile from another account and test the link.',
        ],
        p: [
          'Menu names and steps can change as the app is updated; the field you need is usually on the profile edit screen.',
        ],
      },
      {
        h: 'Why should you use a short link?',
        p: [
          'Long addresses with parameters look messy on a profile and do not inspire trust. A short link looks clean and lets you measure clicks. When you create a separate short link for each campaign, you can see which content brought clicks.',
        ],
      },
      {
        h: 'Support the link in your bio',
        list: [
          'Write a clear call to action in your bio text: "New guide below".',
          'Say what the link is: menu, booking, shop.',
          'Point to the profile link in your posts and stories too.',
        ],
      },
      {
        h: 'Common mistakes',
        list: [
          'Linking to a broken or expired page.',
          'Sending people to a page that loads slowly on mobile.',
          'Leaving the same link in place and never updating it for campaigns.',
          'Making a small typo when typing the link: always test after saving.',
        ],
      },
      {
        h: 'Measure the results',
        p: [
          'After a week, look at the click count. If clicks went up after a certain post, do more of that kind of content; if not, change the call to action or the link destination.',
        ],
      },
    ],
  },

  'google-yorum-baglantisi-qr-kod': {
    slug: 'google-review-link-and-qr-code',
    seoTitle: 'Google Review Link and QR Code',
    title: 'How to Share a Google Review Link: Get More Reviews with a Short Link and QR Code',
    description:
      'Ways to turn your review link into a short link and a QR code to get more Google reviews from customers. Placement and message tips.',
    highlights: [
      'The fewer steps a customer needs to leave a review, the more likely you are to get one.',
      'Shorten the review link and turn it into a QR code; add it at the till, on tables or on receipts.',
      'Use a separate short link for each placement to see which works.',
    ],
    sections: [
      {
        p: [
          'For local businesses, Google reviews are one of the strongest ways to win new customers. But even happy customers may give up if they must search, scroll and click to leave a review. The solution: a link and QR code that take them to the review page with one tap.',
        ],
      },
      {
        h: 'Where do you get the review link?',
        p: [
          'In the account where you manage your business profile, the profile screen offers an option to ask for reviews or share a review link. From there you can copy a link that goes straight to your business’s review page. The interface can change over time; look for the option in the profile management screen.',
        ],
      },
      {
        h: 'Why should you shorten the link?',
        list: [
          'A long review address does not sit well in messages and print; a short link looks clean.',
          'A QR code made from a short address is simpler and scans easily even in small prints.',
          'With a separate link for each placement, you see which spot brings more reviews.',
        ],
      },
      {
        h: 'Where should you put the QR code?',
        list: [
          'Next to the till, at eye level at the moment of payment.',
          'On table cards or the back of the menu.',
          'On receipts, invoices or product cards in packages.',
          'In the thank-you message you send after service (as a short link).',
        ],
      },
      {
        h: 'How do you write an effective message?',
        list: [
          'Be short and warm: "Would you share your experience with us?"',
          'Say what to tap: "Scan the code, it takes 30 seconds."',
          'Do not reward or steer the review; platform rules may restrict offering incentives in exchange for reviews.',
        ],
      },
      {
        h: 'Track the results',
        p: [
          'When each placement has its own short link, you can compare click counts. For example, if the code at the till differs from the one on tables, you put more effort into the one that works better. Even a small weekly check shows which method brings reviews.',
        ],
      },
    ],
  },

  'qr-menu-nasil-hazirlanir': {
    slug: 'how-to-make-a-qr-menu',
    seoTitle: 'How to Make a QR Menu',
    callout: {
      title: 'Looking for a ready-made QR menu solution?',
      text: 'If you want to set up a QR menu for your restaurant or café, take a look at our service ZuuQRMenu.',
      label: 'Discover ZuuQRMenu',
      href: 'https://www.zuuqrmenu.com/',
    },
    title: 'How to Make a QR Menu: A Step-by-Step Guide for Restaurants and Cafés',
    description:
      'A guide to making a QR menu for restaurants and cafés: the menu page, short link, QR code size, placement and update tips.',
    highlights: [
      'Publish the menu on a single page that opens fast on mobile.',
      'Shorten the address and turn it into a QR code; print it at least 3 x 3 cm on tables.',
      'When prices change, update the page; you do not need to reprint the QR code.',
    ],
    sections: [
      {
        p: [
          'A QR menu reduces paper menu costs, makes price changes easier and offers customers a contactless experience. A well-made QR menu is more than a code: a fast-loading menu page, a code printed at the right size and a regular update routine work together.',
        ],
      },
      {
        h: '1. Publish the menu on a mobile-friendly page',
        p: [
          'The customer who scans the code will see a page on their phone. Prefer a fast-loading, scrollable and readable menu page over a large PDF. Separate the categories clearly, write prices openly and make sure the page opens even on weak mobile internet.',
        ],
      },
      {
        h: '2. Shorten the address',
        p: [
          'If your menu page’s address is long, shorten it. A QR code made from a short address has a simpler pattern and scans comfortably even on small table cards. Each scan also counts as a click; you can see which table or branch opens the menu more.',
        ],
      },
      {
        h: '3. Create the QR code and test it',
        list: [
          'Turn your short link into a QR code and choose a high-contrast design.',
          'Scan it with different phones and in different lighting.',
          'Make sure there is enough blank space around the code.',
        ],
      },
      {
        h: '4. Right size and placement',
        list: [
          'At least 3 x 3 cm on a table card or stand.',
          'Much larger at the entrance or on a wall if it will be scanned from afar.',
          'Write a short call to action next to the code, such as "Scan for the menu".',
          'Print on matte surfaces; glare on glossy ones makes scanning harder.',
        ],
      },
      {
        h: '5. Set up an update routine',
        p: [
          'When a price or item changes, update the content of your menu page. Because the short address stays the same, you do not need to reprint the codes. If you need to change the destination address itself, you must prepare a new short link and new code; so choose the menu page’s address as a permanent one from the start.',
        ],
      },
      {
        h: '6. Do not forget the customer experience',
        p: [
          'Keep a few printed menus for customers who do not have or do not want to use a phone. A QR menu should be an option, not a requirement.',
        ],
      },
    ],
  },

  'whatsapp-link-paylasimi': {
    slug: 'share-links-on-whatsapp',
    seoTitle: 'Sharing Links on WhatsApp',
    title: 'Sharing Links on WhatsApp: Direct Message Link, Short Link and QR Code',
    description:
      'How do you create a direct message link that opens a WhatsApp chat with you in one tap? Sharing and measurement tips with a short link and QR code.',
    highlights: [
      'With your phone number you can create a direct message link and send customers to a chat in one tap.',
      'Shorten the link and turn it into a QR code; use it on windows, business cards and social media.',
      'Use a separate short link for each channel to see where customers came from.',
    ],
    sections: [
      {
        p: [
          'For many businesses, customer communication starts on WhatsApp. Instead of waiting for customers to save your number and write a message, you can share a link that starts the chat with one tap. When you shorten that link and turn it into a QR code, you can use it everywhere.',
        ],
      },
      {
        h: 'What is a direct message link?',
        p: [
          'A direct message link takes the person who taps it to a WhatsApp chat with your number. The link starts with wa.me/ followed by your phone number written with the country code, without a plus sign or spaces. For example, it looks like wa.me/905xxxxxxxxx. If you like, you can also add ?text= at the end of the link to define a ready-made message.',
        ],
      },
      {
        h: 'Why should you shorten it?',
        list: [
          'Long links with a ready message look messy; a short link looks tidy.',
          'A QR code made from a short address is easier to scan.',
          'With a separate link for each place of use, you see which channel brings more chats.',
        ],
      },
      {
        h: 'Where can you use it?',
        list: [
          'As a QR code on windows, at the till and on table cards',
          'On business cards and brochures',
          'In social media bios and post descriptions',
          'In your email signature and on contact buttons on your website',
          'In campaign messages and posters',
        ],
      },
      {
        h: 'How do you write a good ready message?',
        list: [
          'Keep it short and say who it is from: "Hello, I am writing from your website."',
          'Make the request clear: "I would like a price quote" or "I would like to book".',
          'Use a different ready message for each channel; that way you see who started the chat from where.',
        ],
      },
      {
        h: 'Measurement and privacy',
        p: [
          'The short link’s click count shows how many people tried to start the chat; whether the chat really started you see on the WhatsApp side. When collecting customer information, follow personal data protection rules and state what you will use their data for when you share your number.',
        ],
      },
    ],
  },

  'kisa-link-seo-etkisi': {
    slug: 'do-short-links-hurt-seo',
    seoTitle: 'Do Short Links Hurt SEO?',
    title: 'Do Shortened Links Hurt SEO? A Guide to Using Them Correctly',
    description:
      'Do short links affect search rankings? Learn how redirects relate to SEO and where to use a short link and where not to.',
    highlights: [
      'A short link alone does not hurt your rankings; using it in the wrong place can cause problems.',
      'Use short links on social media, in email and on print; use the original address in your own site’s internal links.',
      'Do not expect a direct ranking benefit from a short link; its value is in measurement and easy sharing.',
    ],
    sections: [
      {
        p: [
          'Everyone who uses link shortening asks the same question: do short links hurt SEO? The short answer: not when used in the right place. But knowing what a short link does and does not do keeps you from setting the wrong expectations.',
        ],
      },
      {
        h: 'How does a short link work for SEO?',
        p: [
          'A short link is a redirect: a visitor or a search engine bot arrives at the short address and the service redirects them to the original page. Search engines follow redirects and end up evaluating the original page. So using a short link does not stop the content of the destination page from being indexed.',
        ],
      },
      {
        h: 'Should you expect a ranking benefit from a short link?',
        p: [
          'No. You should not assume that a link pointing at a short link from another site will guarantee a contribution to the destination page’s ranking. The value of a short link is not in SEO but in easy sharing, trust and click measurement. What contributes to rankings is the destination page’s own content and quality links pointing directly to it.',
        ],
      },
      {
        h: 'Where should you use a short link?',
        list: [
          'Social media bios and post descriptions',
          'Email newsletters and signatures',
          'SMS and messaging apps',
          'QR codes on posters, business cards and packaging',
          'Anywhere you need to measure a campaign',
        ],
      },
      {
        h: 'Where should you not use a short link?',
        list: [
          'In your own site’s internal links: link to your own pages with the original address and do not add an unnecessary redirect.',
          'In menus, footers and in-content links: the original address is clearer for search engines and users.',
          'When linking out to other sites: a visible destination gives trust to both the reader and the search engine.',
        ],
      },
      {
        h: 'Safety and reputation',
        p: [
          'Because of links to phishing and malicious sites, some short link domains can gain a bad reputation. So use a trustworthy service, point your links only at pages you trust and do not leave the destination page empty when a campaign ends. This is why Kısaltıcı has abuse reporting.',
        ],
      },
      {
        h: 'In short: a checklist',
        list: [
          'Original address in internal links, short link in external shares.',
          'See the short link as a measurement and sharing tool, not a ranking tool.',
          'Keep destination pages fast, mobile friendly and trustworthy.',
          'Before deleting important campaign links, think about where the redirect should go.',
        ],
      },
    ],
  },

  'utm-parametreleri-nasil-olusturulur': {
    slug: 'how-to-create-utm-parameters',
    seoTitle: 'How to Create UTM Parameters',
    title: 'How to Create UTM Parameters: A Step-by-Step Guide with Examples',
    description:
      'What are UTM tags, what do the five parameters do and how do you name them consistently? A guide to building UTM links with example addresses.',
    highlights: [
      'Three core parameters are enough: utm_source, utm_medium, utm_campaign.',
      'Use lowercase and hyphens; do not split one source across different spellings.',
      'Shorten the UTM address: it shares cleanly and shows its click count per link.',
    ],
    sections: [
      {
        p: [
          'When a campaign gets hundreds of clicks, the real question is where the traffic came from. UTM parameters are small tags added to the end of the destination address to answer that. Set up correctly, they show clearly which channel, campaign and piece of content worked.',
        ],
      },
      {
        h: 'What are the UTM parameters?',
        list: [
          'utm_source (required): where the traffic came from. Example: instagram, newsletter, google',
          'utm_medium (required): the channel type. Example: social, email, qr, cpc',
          'utm_campaign (required): the campaign name. Example: summer-sale-2026',
          'utm_term (optional): the keyword in paid search',
          'utm_content (optional): separates different links or visuals in the same campaign. Example: top-button, bottom-text',
        ],
      },
      {
        h: 'An example UTM address',
        p: [
          'Say your destination page is https://example-site.com/campaign. The address you use in a newsletter becomes:',
          'https://example-site.com/campaign?utm_source=newsletter&utm_medium=email&utm_campaign=summer-sale-2026',
          'For the same page in your Instagram bio, you use utm_source=instagram and utm_medium=social. That way you see the results of the two channels separately.',
        ],
      },
      {
        h: 'Rules for consistent naming',
        list: [
          'Always use lowercase: Instagram and instagram can become two different sources in analytics tools.',
          'Use hyphens instead of spaces: summer-sale, not summer sale.',
          'Avoid special characters: letters like ş, ğ, ı can break in an address.',
          'Choose short, meaningful names; keep a glossary table and use the same terms across the team.',
          'Do not add UTM tags to your own site’s internal links: it splits sessions and corrupts source data.',
        ],
      },
      {
        h: 'Why should you shorten a UTM address?',
        p: [
          'UTM addresses look long and messy; they can break in messages and may look untrustworthy. When you prepare the address with its tags and then shorten it, you get a clean link and see each short link’s own click count. UTM shows behavior after visitors arrive on your site, while the short link counter shows the click. The two complement each other.',
        ],
      },
      {
        h: 'Common mistakes',
        list: [
          'Writing the same source differently (newsletter, Newsletter, bulten).',
          'Forgetting to add tags and dropping the traffic into "direct".',
          'Adding too many parameters: the three core ones are enough for most jobs.',
          'Not saving the tagged addresses: keep them in a table.',
        ],
      },
    ],
  },

  'statik-ve-dinamik-qr-kod-farki': {
    slug: 'static-vs-dynamic-qr-codes',
    seoTitle: 'Static vs Dynamic QR Codes',
    title: 'Static vs Dynamic QR Codes: What Is the Difference and Which Should You Choose?',
    description:
      'The differences between static and dynamic QR codes, their advantages and when to choose which. Where a short link fits in.',
    highlights: [
      'A static QR code embeds the content directly in the code; it cannot be changed and scans cannot be counted.',
      'In a code that points to a short link, scans are counted as clicks.',
      'Static suits permanent, simple jobs; a short-link code makes sense when you need measurement.',
    ],
    sections: [
      {
        p: [
          'When you start creating QR codes, you often hear the words "static" and "dynamic". Both look the same, but the logic behind them differs, and that difference matters for measurement, flexibility and scannability.',
        ],
      },
      {
        h: 'What is a static QR code?',
        p: [
          'A static QR code embeds a text or address directly in the pattern. Once generated, its content does not change, and the person who scans it goes straight to that address. Because no service sits in between, the code works forever, but you cannot know how many people scanned it.',
        ],
      },
      {
        h: 'What is a dynamic QR code?',
        p: [
          'A dynamic QR code carries a short address instead of the destination address directly. The person who scans it first arrives at the short address and is then redirected to the real destination. This way the scan count is recorded. Because the address in the code is short, the pattern stays simple and scans easily even in smaller prints.',
        ],
      },
      {
        h: 'The differences at a glance',
        list: [
          'Content: in a static code the address is inside the pattern; in a dynamic code there is a short address.',
          'Measurement: a static code has no scan count; a short-address code counts each scan as a click.',
          'Pattern density: a long address makes a static code complex; a short address simplifies the pattern.',
          'Dependency: a static code is independent of any service; a short-address code depends on the short link continuing to work.',
        ],
      },
      {
        h: 'Which should you choose?',
        list: [
          'For fixed jobs such as Wi-Fi details, a short text or personal use, a static code is enough.',
          'For jobs where you want to measure scans, such as campaigns, menus, posters and business cards, a short-link code fits better.',
          'Shortening a long address first, instead of embedding it in the code, improves scannability.',
        ],
      },
      {
        h: 'The QR code in Kısaltıcı',
        p: [
          'The QR code you create in Kısaltıcı points to your short link, so each scan shows up in the link’s click count. Because the short link keeps working until you delete it, you can use it on printed materials with confidence. Remember: a short link’s destination cannot be changed after it is created; if you need a different destination, create a new link.',
        ],
      },
    ],
  },

  'etkinlik-konferans-qr-kod-kullanimi': {
    slug: 'qr-codes-for-events-and-conferences',
    seoTitle: 'QR Codes at Events and Conferences',
    title: 'QR Codes at Events and Conferences: Registration, Schedule and Feedback',
    description:
      'How to use QR codes at events for registration, schedules, maps and feedback. Placement tips and ideas for measuring results.',
    highlights: [
      'Give each QR code one job: registration, schedule, map or feedback.',
      'Place codes where everyone can see them, and print them large enough.',
      'Use a separate short link for each code to see afterwards which ones were scanned.',
    ],
    sections: [
      {
        p: [
          'At events, people already have their phones in hand. A QR code is the fastest way to send attendees to the right information without handing out paper. Used in the right place for the right purpose, it makes organizing easier and lets you measure attendee behavior.',
        ],
      },
      {
        h: 'Where QR codes work best',
        list: [
          'Registration and check-in: send people to the sign-up form or their ticket.',
          'Schedule and speakers: open the current program page, so changes show up instantly.',
          'Maps and directions: link to a venue or booth map.',
          'Feedback: point to a short survey at the end of a session.',
          'Sponsor and catalog links: open a product or service page at booths.',
        ],
      },
      {
        h: 'Give every code a single job',
        p: [
          'One code that tries to do several things confuses attendees. Use a separate code and a short label for each purpose: "See the schedule", "Give feedback". Nobody has to wonder what they are about to open.',
        ],
      },
      {
        h: 'Placement and size',
        list: [
          'Put codes at eye level at the registration desk and entrance, where they are easy to reach.',
          'On stage and wall screens, show them large enough to scan from the back rows.',
          'Leave blank space around them and keep the contrast high.',
          'On digital screens, keep the code up long enough between transitions.',
        ],
      },
      {
        h: 'Prepare and test in advance',
        p: [
          'Print the codes before the event and test them with different phones. Mobile data can be weak at venues, so keep destination pages light and fast. If possible, print the local Wi-Fi details next to the code.',
        ],
      },
      {
        h: 'Measure the results',
        p: [
          'When each code has its own short link, you can see which ones were scanned most. For example, how often the feedback code was opened is an indirect sign of how engaging a session was. You can plan the next event with this data.',
        ],
      },
    ],
  },

  'e-posta-bultenlerinde-link-kullanimi': {
    slug: 'links-in-email-newsletters',
    seoTitle: 'Links in Email Newsletters: 7 Tips',
    title: 'Links in Email Newsletters: 7 Ways to Get More Clicks',
    description:
      'How should you place links in your newsletters to get clicked more? Seven practical tips: a clear call to action, a single goal and measurement.',
    highlights: [
      'Pick one main goal and one clear call to action for each email.',
      'Use meaningful link text that says what the link is.',
      'Create a separate short link for each newsletter and compare which one works.',
    ],
    sections: [
      {
        p: [
          'Email newsletters are still one of the most effective direct channels, but readers give them little attention. Even with a good open rate, link placement decides whether people click. Here are seven methods to apply.',
        ],
      },
      {
        h: '1. Pick one main goal',
        p: [
          'Each email should ask for one thing: read an article, look at a product, fill in a form. Many equally weighted links force readers to choose and lower clicks.',
        ],
      },
      {
        h: '2. Write meaningful link text',
        p: [
          'Instead of "click here", say what will happen: "Read the guide", "Book your appointment". The link text sets the expectation before the click.',
        ],
      },
      {
        h: '3. Use both a button and a text link',
        p: [
          'Some readers click the visual button, others the link inside the text. Having both leaves nobody out. Point both to the same short link so the numbers are collected in one place.',
        ],
      },
      {
        h: '4. Use short, clean links',
        p: [
          'Long addresses with parameters can break in plain-text emails and look untrustworthy. A short link looks tidy and avoids copy errors.',
        ],
      },
      {
        h: '5. Place it above the fold',
        p: [
          'The main call to action should be visible on the first screen. Most readers do not scroll to the end of an email.',
        ],
      },
      {
        h: '6. Design for mobile',
        p: [
          'Most emails are opened on phones. Keep buttons large enough for a finger and check that the destination page loads quickly on mobile.',
        ],
      },
      {
        h: '7. Measure each newsletter separately',
        p: [
          'Create a separate short link for each newsletter and compare the click counts. After a few issues you can clearly see which subject line, send time and call to action work best.',
        ],
      },
    ],
  },

  'kampanya-link-planlama-kontrol-listesi': {
    slug: 'link-campaign-planning-checklist',
    seoTitle: 'Link Campaign Planning Checklist',
    title: 'Short Link Campaign Planning Checklist: Email, Social Media and Print',
    description:
      'Why is a separate short link per channel important in a campaign? A practical checklist from setting a goal to reporting.',
    highlights: [
      'Create a separate short link for each channel to see clearly which one works.',
      'Test every link on mobile before launch.',
      'Compare results at the end of the first week, not only when the campaign ends.',
    ],
    sections: [
      {
        p: [
          'A campaign’s success is often decided by the preparation before sharing. If you do not know which link you used where, you cannot interpret the results. This checklist helps you set up a common routine for email, social media and print.',
        ],
      },
      {
        h: '1. Write down the goal and how you will measure it',
        p: [
          'What is the campaign for: sign-ups, sales, event attendance, visits? Write the goal in one sentence and think about how close a click is to that goal. A click shows interest, not an outcome; judge the result together with conversions on the destination page.',
        ],
      },
      {
        h: '2. Create a separate link for each channel',
        p: [
          'Separate links that go to the same page but are used in different channels: newsletter, Instagram, WhatsApp, a poster QR code. With a separate short link for each, the click counts become a channel comparison on their own.',
        ],
      },
      {
        h: '3. Prepare the destination page',
        list: [
          'Does the page load fast and look right on mobile?',
          'Is there a single, clear call to action?',
          'What will the page show once the campaign ends? Consider a redirect rather than removing it.',
        ],
      },
      {
        h: '4. Test before launch',
        list: [
          'Open every short link with different phones and browsers.',
          'Scan QR codes at their real printed size before printing.',
          'Make sure links are clickable in emails and messages.',
        ],
      },
      {
        h: '5. Track and compare',
        p: [
          'Watch the numbers in the first days; if a channel is far below expectations, it is not too late to change the message or timing. When the campaign ends, note the best and worst channels; that is the most valuable information for the next campaign.',
        ],
      },
      {
        h: '6. Archive',
        p: [
          'Keep the links, the channels they were used in and the results in a table. Links created in Kısaltıcı keep working until you delete them, so old codes on printed material are not wasted.',
        ],
      },
    ],
  },

  'sosyal-medya-biyografi-link-ipuclari': {
    slug: 'social-media-bio-link-tips',
    seoTitle: 'Social Media Bio Link Tips',
    title: 'Adding a Link to Your Social Media Bio: 6 Tips for More Clicks',
    description:
      'Ways to use the single link in your bio more effectively: a short, readable address, a clear call to action and per-platform measurement.',
    highlights: [
      'A short, readable address builds trust and increases clicks.',
      'Using a separate link per platform shows which one works.',
      'Write a short call to action that says what people will find.',
    ],
    sections: [
      {
        p: [
          'Most social media profiles let you add only one link. That small space can be the most valuable spot for your website, your shop or your latest content. These tips help you make better use of it.',
        ],
      },
      {
        h: 'Use a short, readable link',
        p: [
          'Long addresses full of parameters look messy and do not inspire trust. A short link looks tidy in a bio and people understand where they are going.',
        ],
      },
      {
        h: 'Say what the link is',
        p: [
          'Add a short prompt next to the link: "New guide", "Book a slot", "Menu". People click more when they are told what to do.',
        ],
      },
      {
        h: 'Create a separate link for each platform',
        p: [
          'Separate links that lead to the same page but are used on different platforms. Since every link in Kısaltıcı has its own click count, you can easily compare which platform brings traffic.',
        ],
      },
      {
        h: 'Keep the link up to date',
        list: [
          'When a campaign ends, update the destination with a redirect.',
          'A link to a broken or outdated page hurts trust.',
          'Review the link in your bio every month.',
        ],
      },
      {
        h: 'Put mobile first',
        p: [
          'Most social media traffic comes from phones. Make sure the destination page loads quickly on mobile and the buttons are easy to tap.',
        ],
      },
      {
        h: 'Look at the results',
        p: [
          'Watch the click count for a month. If you notice clicks rising after a certain kind of post, you can keep producing that kind of content.',
        ],
      },
    ],
  },

  'kartvizit-afis-menu-qr-kod-ipuclari': {
    slug: 'qr-codes-on-print-materials',
    seoTitle: 'QR Codes on Print Materials',
    title: 'QR Codes on Business Cards, Posters and Menus: Size, Placement and Design Tips',
    description:
      'How big should a QR code on print materials be, where should it go and how should it be designed? Practical sizes and common mistakes.',
    highlights: [
      'At least 2 x 2 cm on a business card; much larger on posters, depending on scanning distance.',
      'Add a short line next to the QR code saying what it does.',
      'Test at real size with different phones before sending to print.',
    ],
    sections: [
      {
        p: [
          'A QR code on print behaves differently from one on a screen: light, paper surface, distance and print quality all affect scanning. That is why a code that works on screen can cause trouble in print. Here is what to know before printing.',
        ],
      },
      {
        h: 'Choose the right size',
        list: [
          'Business cards and brochures: at least 2 x 2 cm.',
          'Menus and table cards: 3 x 3 cm or larger.',
          'Posters and shop windows: aim for a side length of roughly one tenth of the scanning distance.',
        ],
      },
      {
        h: 'Keep the contrast',
        p: [
          'A dark pattern on a light background is the most reliable combination. When designing in color, make sure the pattern is clearly darker than the background. On glossy, reflective paper, glare can make scanning harder; prefer matte surfaces.',
        ],
      },
      {
        h: 'Leave the quiet zone',
        p: [
          'The blank frame around the code is necessary for scanning. Text, lines or images must not intrude into this area.',
        ],
      },
      {
        h: 'Placement and call to action',
        list: [
          'Put the QR code at eye level in an easy-to-reach spot.',
          'Write a short call to action next to it: "Scan to see the menu".',
          'Do not place it on surfaces that fold or curl.',
        ],
      },
      {
        h: 'Use a short link',
        p: [
          'A QR code made from a shortened address has a simpler pattern, which improves scannability even in small prints. Because the short address stays the same, updating the content of the destination page does not require reprinting the code.',
        ],
      },
      {
        h: 'Do not print without testing',
        p: [
          'Make a test print and scan it with different phones in different lights. A small test is far cheaper than throwing away thousands of prints.',
        ],
      },
    ],
  },

  'sahte-qr-kod-quishing-korunma': {
    slug: 'protect-yourself-from-fake-qr-codes',
    seoTitle: 'Protect Yourself from Fake QR Codes',
    title: 'How to Protect Yourself from Fake QR Codes (Quishing)',
    description:
      'How QR code phishing attacks work and how to spot them. Security tips for both users and people who share QR codes.',
    highlights: [
      'Trust the source before scanning; check whether a sticker was placed over the code.',
      'Check the address your phone shows before opening it.',
      'When sharing your own QR codes, use a short, familiar address.',
    ],
    sections: [
      {
        p: [
          'QR codes are easy and fast, which is why attackers like them too. In "quishing", a fake QR code takes the user to a phishing page or a malicious site. The good news is that a few habits reduce the risk a lot.',
        ],
      },
      {
        h: 'How does the attack work?',
        p: [
          'The attacker sticks their own code over a legitimate QR code, or sends a fake code by email or message. The person who scans it lands on a fake page that looks like a bank or a familiar service and enters their details there.',
        ],
      },
      {
        h: 'Checklist before scanning',
        list: [
          'Is the code in a trustworthy place? Is there a sticker or a shifted layer on top of it?',
          'Be suspicious of codes in emails or messages from unknown sources.',
          'Do not trust messages that pressure you with urgency ("your account will be closed").',
        ],
      },
      {
        h: 'After scanning',
        list: [
          'When your phone shows the address, read all of it. Is the domain familiar?',
          'Be extra careful on pages that ask for login details, card numbers or verification codes.',
          'If in doubt, close the page and contact the organization through channels you already know.',
        ],
      },
      {
        h: 'Tips for people who share QR codes',
        list: [
          'Show your codes in safe places you can check.',
          'Use a short, familiar address; long, complicated addresses raise suspicion.',
          'Write who published the code and what it is for next to it.',
          'Check printed codes regularly to see whether something has been stuck on them.',
        ],
      },
      {
        h: 'Security at Kısaltıcı',
        p: [
          'Kısaltıcı’s terms of use prohibit redirects to phishing, malware and deceptive content, and such links can be disabled. Before clicking a short link you do not know, always think about who sent it.',
        ],
      },
    ],
  },

  'ozel-kisa-link-marka-baglantisi': {
    slug: 'custom-short-links-for-your-brand',
    seoTitle: 'Custom Short Links for Your Brand',
    title: 'What Is a Custom Short Link? 5 Benefits of a Branded Link',
    description:
      'How does a readable, memorable custom short link increase trust and recall compared to random codes? Benefits and tips.',
    highlights: [
      'A custom link is a readable, memorable address.',
      'Name them in one consistent style for brand consistency and trust.',
      'On Kısaltıcı you can create custom links on the Professional and Business plans.',
    ],
    sections: [
      {
        p: [
          'The end of a short link usually consists of random characters, like aB3xYz. It works but is hard to remember. With a custom short link you choose the end of the address yourself, such as "portfolio", "menu" or "campaign".',
        ],
      },
      {
        h: '1. It is memorable',
        p: [
          'A meaningful word is much easier to remember than a random code. This makes a big difference for links shared aloud, such as on the radio, in presentations or on the phone.',
        ],
      },
      {
        h: '2. It builds trust',
        p: [
          'People want to know what they are clicking. An address that describes the content looks more trustworthy than random characters.',
        ],
      },
      {
        h: '3. It keeps your brand consistent',
        p: [
          'Using the same pattern in every channel looks professional. For example, an address tied to your name, like lnk1.tr/@name/portfolio, shows both the owner and the content.',
        ],
      },
      {
        h: '4. It makes sharing easier',
        p: [
          'A short, readable address can be typed by hand on a business card, in a presentation or in a video. It reduces copy errors.',
        ],
      },
      {
        h: '5. It makes measurement meaningful',
        p: [
          'When every campaign has a meaningful name, you immediately see in reports which link brought what.',
        ],
      },
      {
        h: 'Tips',
        list: [
          'Keep it short and avoid unnecessary words.',
          'Use lowercase and a consistent naming style.',
          'In campaign links, add the year or period to avoid clashes.',
          'Avoid characters that are easy to mistype.',
        ],
      },
      {
        h: 'Custom links on Kısaltıcı',
        p: [
          'On the Professional and Business plans you can write the end of the address yourself. You can return to an automatic code with one click whenever you like.',
        ],
      },
    ],
  },

  'qr-kod-nasil-olusturulur': {
    slug: 'how-to-create-a-qr-code',
    seoTitle: 'How to Create a QR Code',
    title: 'How to Create a QR Code: A Step-by-Step Guide',
    description:
      'Learn step by step how to create a QR code for a link, design one that scans well and looks good, and avoid the most common mistakes.',
    highlights: [
      'Shorten a long address first; the QR pattern becomes simpler and easier to scan.',
      'High contrast, enough blank space and a sensible size determine scannability.',
      'Test with different phones before sending to print.',
    ],
    sections: [
      {
        p: [
          'QR codes are the most practical way to reach a link with a single scan on menus, posters, business cards and packaging. A well-made QR code scans quickly and reflects your brand. In this guide we explain how to create a QR code from a link and the tricks to get it right from the start.',
        ],
      },
      {
        h: 'What is a QR code and how does it work?',
        p: [
          'A QR code is a two-dimensional barcode with text or a web address embedded in it. A phone camera reads the code and offers to open the address inside. The more data a code holds, the more complex the pattern and the harder it is to scan. That is why shortening a long web address first is safer than embedding it directly.',
        ],
      },
      {
        h: 'Creating a QR code step by step',
        list: [
          'Choose the destination: the address the code opens should look good on mobile.',
          'Shorten the link: a short address simplifies the code and lets you count clicks.',
          'Create the QR code: paste your link, pick the QR code option and download the code.',
          'Customize the design if needed: color, module shape, corner style and the logo in the middle can be adjusted.',
          'Test before printing: scan with different phones and from different distances.',
        ],
      },
      {
        h: 'Rules for a scannable QR code',
        list: [
          'Use high contrast: a dark pattern on a light background is safest. A light pattern on a dark background does not scan in some readers.',
          'Keep the quiet zone: leave at least four modules of blank space around the code.',
          'Do not shrink it: aim for at least 2 x 2 cm for printed codes, and much larger for posters scanned from far away.',
          'Do not overdo the logo: the logo in the middle should cover only a small part of the code. A very large logo breaks scanning.',
          'Prefer a vector format: SVG does not blur in large prints.',
        ],
      },
      {
        h: 'The advantage of a QR code from a shortened link',
        p: [
          'A QR code made from a short link has a less dense pattern, so it scans easily even in smaller prints. Each scan also counts as a click, so you can see which campaign attracted interest. The short address inside the code stays the same, so updating the content of the destination page does not require reprinting the code.',
        ],
      },
      {
        h: 'The most common mistakes',
        list: [
          'Sending to print without testing.',
          'Choosing low-contrast or overly decorative colors.',
          'Redirecting to a page that is not mobile friendly.',
          'Not writing what the code is for next to it: a short note like "Scan to see the menu" increases scans.',
        ],
      },
      {
        h: 'Creating a QR code with Kısaltıcı',
        p: [
          'On Kısaltıcı, when you paste your link and choose the QR code option, a standard code is ready. On the Starter plan and above, you can adjust colors, module shape, corner style and the image in the middle with the custom design screen. The settings are saved with your link, so you can download the code again with the same look whenever you want.',
        ],
      },
    ],
  },

  'link-kisaltma-nedir': {
    slug: 'what-is-link-shortening',
    seoTitle: 'What Is Link Shortening?',
    title: 'What Is Link Shortening? Benefits and How to Use It',
    description:
      'How does link shortening work, what is it for and when does it help? Learn the benefits of short links and security tips.',
    highlights: [
      'A short link turns a long address into one that is easy to share and read.',
      'Seeing click counts lets you measure your campaigns.',
      'Be careful with short links from sources you do not know.',
    ],
    sections: [
      {
        p: [
          'When you try to share a long web address full of parameters in a message, you run into broken lines, unreadable addresses and copy mistakes. Link shortening solves this: it turns the long address into a short, memorable one, and everyone who clicks the short address is redirected to the original page.',
        ],
      },
      {
        h: 'How does link shortening work?',
        p: [
          'A shortening service matches your long address with a short code in a database. When a visitor arrives at the short address (for example domain.com/aB3xYz), the service finds the code and redirects the visitor to the original address in a fraction of a second. The click can be recorded during this redirect, so you know how many times the link was opened.',
        ],
      },
      {
        h: 'Benefits of short links',
        list: [
          'Readability: a short address looks tidy in messages, social media bios and printed materials.',
          'Easy sharing: no more half-copied addresses or broken lines.',
          'Measurement: you can see the click count and its distribution over time.',
          'QR code compatibility: a QR code from a short address is simpler and easier to scan.',
          'Brand perception: a custom short address looks tidy and trustworthy.',
        ],
      },
      {
        h: 'When is it used?',
        list: [
          'Social media bios and post descriptions',
          'Email signatures and newsletters',
          'SMS and messaging apps (places with character limits)',
          'QR codes on posters, brochures, business cards and packaging',
          'Event, registration and survey form links',
        ],
      },
      {
        h: 'Security: how can you trust a short link?',
        p: [
          'Because a short address hides the destination, bad actors can use this method too. Before clicking a short link from a source you do not know, think about who sent it and preview the destination if you can. When sharing your own links, only point to pages you trust; redirects to phishing, malware and deceptive content violate the terms of use.',
        ],
      },
      {
        h: 'Do short links work forever?',
        p: [
          'It depends on the service provider. Links created in Kısaltıcı keep working until you delete them. That is an important guarantee for printed materials and permanent shares.',
        ],
      },
    ],
  },

  'link-tiklamalari-nasil-takip-edilir': {
    slug: 'how-to-track-short-link-clicks',
    seoTitle: 'How to Track Short Link Clicks',
    title: 'How to Track Short Link Clicks: Accurate Measurement with UTM',
    description:
      'How do you see how many times your shared link was clicked? The basics of click tracking and a guide to campaign measurement with UTM tags.',
    highlights: [
      'Total clicks, last click and distribution over time show interest.',
      'UTM tags let analytics tools separate the source of traffic.',
      'Creating a separate short link for each channel makes comparison easier.',
    ],
    sections: [
      {
        p: [
          'Sharing a link is half the job; knowing how much interest it got is the other half. Without measuring which post, email or poster brought traffic, it is hard to spend budget and time in the right place. In this article we explain how click tracking with short links works and how to make measurement more meaningful with UTM tags.',
        ],
      },
      {
        h: 'How does click tracking work?',
        p: [
          'Every time the short address is clicked, the service records it and redirects the visitor to the destination. This way you can see the total click count, the time of the last click and the distribution over time. In Kısaltıcı, this information is on each link’s own page.',
        ],
      },
      {
        h: 'Interpreting click counts correctly',
        list: [
          'A click is not a sale: combine clicks with on-page measurement that ties them to the outcome (sign-up, purchase).',
          'The same person can click more than once: total clicks do not mean unique visitors.',
          'Bots and link previews can inflate numbers: social networks may open a link to build a share preview.',
          'Look at trends: the change over time guides you better than the number of a single day.',
        ],
      },
      {
        h: 'What are UTM tags?',
        p: [
          'UTM tags are small parameters added to the destination address that let analytics tools understand where the traffic came from. The main parameters are:',
        ],
        list: [
          'utm_source: the source of the traffic (for example instagram, newsletter)',
          'utm_medium: the channel type (for example social, email, qr)',
          'utm_campaign: the campaign name (for example summer-sale)',
        ],
      },
      {
        h: 'Using UTM together with a short link',
        p: [
          'Addresses with UTM tags look long and messy. If you prepare the address with tags first and then shorten it, you get a clean, shareable link and see the click count per link. Creating a separate short link for each channel shows clearly which channel attracts more interest.',
        ],
      },
      {
        h: 'A small measurement plan',
        list: [
          'Write down your goal: more sign-ups or more visits?',
          'Create a separate tagged short link for each channel.',
          'Keep the links and their tags in a table.',
          'After a week, compare the click counts and invest in the channel that gets attention.',
          'For print, use QR codes; create a separate link for each print run to see which is scanned more.',
        ],
      },
    ],
  },
};
