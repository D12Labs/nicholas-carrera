// Home grid + detail card content. Source of truth for the copy:
// copy-drafts/CARDS-v3-detail.md (cards 01 to 04, 07, 12). Edit there first, then here.
//
// grid:   still frames for the auto carousel on the home card (hard cut, no transition).
// grid can also be { video, poster } (one looping clip), "urap" (live sketch) or { reel, alt } (screens rolling upward).
// media:  1 to 3 items for the detail card panel. type: image | video | flow | urap.
//         image: round = device screen with rounded corners.
//         video: sound = has a score (controls, no autoplay); pixel = keep LED pixels crisp.
// fit:    "contain" keeps the whole frame on the grid card (posters); default crops to fill.
window.CARDS = [
  {
    slug: "madmadhouse",
    num: "01",
    brand: "MADMADHOUSE Collective",
    title: "MADMADHOUSE Archive & Booking CV",
    kind: "Pipeline, design and front end",
    tag: "Collective work · Design + development",
    status: "Live, 2026",
    sentence: "A low-maintenance pipeline that turns our Instagram into the collective's source of truth, feeding a flyer archive and a live booking sheet.",
    contribution: "Pipeline, design and front end, end to end",
    work: [
      "Built a Python validator so bad flyer data never reaches the site.",
      "Recovered missing years from Instagram's post IDs, so nobody retypes dates.",
      "Designed a drag-anywhere nav so visitors keep it within reach.",
    ],
    credit: "Co-run with Luis Arriaga, who brought the show history.",
    links: [{ label: "madmadhouse.com", href: "https://madmadhouse.com" }],
    grid: { video: "public/media/madmadhouse/archive-scroll.mp4", poster: "public/media/madmadhouse/archive-scroll-poster.webp", w: 960, h: 600, alt: "Scrolling the MADMADHOUSE flyer archive" },
    media: [
      { type: "video", src: "public/media/madmadhouse/archive-scroll.mp4", poster: "public/media/madmadhouse/archive-scroll-poster.webp", w: 960, h: 600, caption: "The archive on madmadhouse.com" },
      { type: "image", src: "public/media/madmadhouse/info-light.webp", w: 1440, h: 900, caption: "About the collective, on the Info page" },
      { type: "image", src: "public/media/madmadhouse/whistler-light.webp", w: 1440, h: 900, caption: "The latest night: The Whistler, 1 Nov 2026" },
    ],
  },
  {
    slug: "urap",
    num: "02",
    brand: "DePaul URAP",
    title: "LLM Semantic 3D Geometry",
    kind: "AI research and creative tech",
    tag: "Research · AI + creative tech",
    status: "DePaul URAP, 2026",
    sentence: "Do language models reason about form? Six months testing whether words like \"compulsive\" become shapes, and finding the ceiling was my schema.",
    contribution: "Solo: research design, server, renderers",
    work: [
      "Built a FastAPI server so I could swap AI models without code changes.",
      "Tested four models on one renderer and found my schema dropped the shape.",
      "Rebuilt the renderer in TouchDesigner so the model's shapes finally appear.",
    ],
    credit: "Research under Nathan Koch, DePaul URAP, over two quarters.",
    links: [
      { label: "urap-geometry.pages.dev", href: "https://urap-geometry.pages.dev" },
      { label: "GitHub", href: "https://github.com/niconicocarrera/urap-2025-26" },
    ],
    grid: "urap",
    media: [
      { type: "urap", caption: "Descriptor demo: pick a word, set its intensity" },
    ],
  },
  {
    slug: "wabash",
    num: "03",
    brand: "Wabash Lights, Chicago",
    title: "Wabash Lights Data Visualization",
    kind: "Public installation and data viz",
    tag: "Public installation · Creative tech",
    status: "Ran live under the CTA tracks, 2025",
    sentence: "Decades of Chicago displacement data, translated onto an LED rail under the L tracks with zero text, axes, or legends.",
    contribution: "Solo: data cleaning, metric design, p5.js sketch",
    work: [
      "Organized the piece around a housing life cycle so the whole city fit.",
      "Cleaned census data across four releases in Tableau and code.",
      "Wrote the p5.js sketch so warm and cool light meet in one pixel.",
    ],
    credit: "Approved by Professor Leanne Wagner to run on the Wabash Lights installation. It no longer runs; this clip is the only footage.",
    links: [{ label: "p5.js sketch", href: "https://editor.p5js.org/niconico/sketches/JsD_jBcDK" }],
    grid: [
      { src: "public/media/wabash/irl-thumb.webp", w: 1400, h: 788, alt: "The LED rails lit under the Wabash L tracks at night" },
      { src: "public/media/wabash/irl-3.webp", w: 1400, h: 788, alt: "Warm and cool light running along the rails" },
      { src: "public/media/wabash/irl-9.webp", w: 1400, h: 788, alt: "The installation from the street" },
    ],
    media: [
      { type: "video", src: "public/media/wabash/irl.mp4", poster: "public/media/wabash/irl-thumb.webp", w: 1280, h: 720, caption: "Live on the rails under the L" },
      { type: "video", src: "public/media/wabash/source-stacked.mp4", w: 584, h: 412, pixel: true, caption: "The source animation: four rails, cut into eight lengths to fit" },
    ],
  },
  {
    slug: "cat",
    num: "04",
    brand: "DePaul x Caterpillar",
    title: "CAT SSO & Access Control",
    kind: "UX and systems design",
    tag: "Client project · UX + systems design",
    status: "DePaul x Caterpillar capstone, 2026",
    sentence: "Caterpillar asked for a faster login screen; we found rental dealers hiding the login fobs under the cab seats.",
    contribution: "Led the systems reframe and the stakeholder walkthrough",
    work: [
      "Reframed login around one question: why would an operator sign in?",
      "Combined Tesla's personalization with Toast's tap-in, then added offline sign-in.",
      "Rebuilt the status bar and NFC symbol after Caterpillar's expert review.",
    ],
    credit: "Team of four with Joelle Szatkowski, Ally Ohr, and Sanya Verma.",
    links: [],
    // Grid tile: nine screens of different kinds rolling past (tap, PIN, welcome, roading, guest,
    // service, operator management, offline access role, access restricted).
    grid: { alt: "The team's screens for the in-cab display, rolling past", reel: [
      { src: "public/media/caterpillar/screens/01-01-idle-screen.webp", w: 1264, h: 704 },
      { src: "public/media/caterpillar/screens/06-02-pinpad.webp", w: 1272, h: 712 },
      { src: "public/media/caterpillar/screens/01-03-welcome-operator.webp", w: 1264, h: 704 },
      { src: "public/media/caterpillar/screens/01-04-roading-screen.webp", w: 1272, h: 712 },
      { src: "public/media/caterpillar/screens/11-02-guest-mode.webp", w: 1264, h: 704 },
      { src: "public/media/caterpillar/screens/03-05-service-home-screen.webp", w: 1264, h: 704 },
      { src: "public/media/caterpillar/screens/04-05-operator-management-home.webp", w: 1264, h: 704 },
      { src: "public/media/caterpillar/screens/10-07-add-operator-access-role.webp", w: 1272, h: 712 },
      { src: "public/media/caterpillar/screens/05-03-access-restricted.webp", w: 1272, h: 712 },
    ] },
    media: [
      { type: "image", src: "public/media/caterpillar/full-01-idle.webp", w: 1264, h: 704, round: true, caption: "Idle: locate the reader in the cab and tap" },
      { type: "image", src: "public/media/caterpillar/full-02-guest-home.webp", w: 1264, h: 704, round: true, caption: "Guest Mode home, personal settings grayed out" },
      { type: "image", src: "public/media/caterpillar/full-03-offline-confirm.webp", w: 1272, h: 712, round: true, caption: "Adding an operator offline, confirm access" },
    ],
  },
  {
    slug: "cocotazo",
    num: "05",
    brand: "J.J. Goods",
    title: "COCOTAZO",
    kind: "Film score",
    tag: "Commissioned work · Film score",
    status: "Released Aug 2026",
    sentence: "The score for a three-chapter short by J.J. Goods, co-composed with Julee Tree Flowers.",
    contribution: "Co-composer, player, producer and mixer",
    work: [
      "Scored all three chapters to picture, timed to the cuts.",
      "Played Moog Mavis, Minilogue XD, NTS-1, and a Fender Mustang bass.",
      "Produced and mixed the score in Ableton 11.",
    ],
    credit: "With Julee Tree Flowers, for J.J. Goods. Produced by Yusef Agency and Gudfolk.",
    links: [],
    // No media yet: the reels need files from Nico. The card shows type only, never a placeholder image.
    grid: [],
    media: [],
  },
  {
    slug: "substanz",
    num: "06",
    brand: "Substanz Magazine",
    title: "Substanz",
    kind: "Web build and score",
    tag: "Client work · Web + score",
    status: "Live, 2026",
    sentence: "Built the website for Substanz, an online magazine, and wrote its score.",
    contribution: "Web build and score",
    work: [
      "Built the magazine's website by hand in HTML, CSS, and JavaScript.",
      "Scored the site's teaser video.",
    ],
    credit: "",
    links: [{ label: "substanzmagazine.com", href: "https://substanzmagazine.com" }],
    grid: { video: "public/media/substanz/site-scroll.mp4", poster: "public/media/substanz/site-scroll-poster.webp", w: 1280, h: 800, alt: "Scrolling substanzmagazine.com" },
    media: [
      { type: "video", src: "public/media/substanz/site-scroll.mp4", poster: "public/media/substanz/site-scroll-poster.webp", w: 1280, h: 800, caption: "substanzmagazine.com" },
      { type: "video", src: "public/media/substanz/teaser-full.mp4", poster: "public/media/substanz/teaser-full-poster.webp", w: 640, h: 480, sound: true, caption: "The site teaser, with my score" },
    ],
  },
];
