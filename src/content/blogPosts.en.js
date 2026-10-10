/**
 * English blog posts, keyed by the Turkish post's slug (see blogPosts.tr.js). Every post needs an entry here:
 * slug (English URL), title, description, highlights and sections in the same shape as the Turkish source.
 */
export const POSTS_EN = {
  'etkinlik-konferans-qr-kod-kullanimi': {
    slug: 'qr-codes-for-events-and-conferences',
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
          'A QR code made from a shortened address has a simpler pattern, which improves scannability even in small prints. You can also change the destination later without reprinting the code.',
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
          'Using the same pattern in every channel looks professional. For example, an address tied to your name, like kisaltici.com/@name/portfolio, shows both the owner and the content.',
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
          'A QR code made from a short link has a less dense pattern, so it scans easily even in smaller prints. Each scan also counts as a click, so you can see which campaign attracted interest. If you need to change the destination later, you do not have to reprint the code, because the code points to the short address.',
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
