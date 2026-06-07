export type Task = {
  id: string;
  title: string;
  status: "In progress" | "Needs review" | "Planned" | "Done";
  assignee: string;
  dueDate: string;
  priority: "High" | "Medium" | "Low";
};

export type Asset = {
  id: string;
  name: string;
  type: string;
  url: string;
  updatedAt: string;
};

export type Contact = {
  id: string;
  name: string;
  role: string;
  email: string;
  channel: string;
};

export type UpcomingItem = {
  id: string;
  title: string;
  date: string;
  type: string;
  owner: string;
  brandName?: string;
};

export type Brand = {
  id: string;
  name: string;
  description: string;
  status: "On track" | "Needs attention" | "Launching soon";
  website: string;
  tasks: Task[];
  assets: Asset[];
  contacts: Contact[];
  upcoming: UpcomingItem[];
  notes: string[];
};

export const mockBrands: Brand[] = [
  {
    id: "fun-slides",
    name: "Fun Slides",
    description:
      "Presentation-first storytelling brand focused on sales decks, founder narratives, and launch-ready visual systems.",
    status: "On track",
    website: "https://funslides.example.com",
    tasks: [
      {
        id: "fs-task-1",
        title: "Finalize Q3 webinar landing page copy",
        status: "In progress",
        assignee: "Maya",
        dueDate: "Jun 10",
        priority: "High",
      },
      {
        id: "fs-task-2",
        title: "Review new slide template pack",
        status: "Needs review",
        assignee: "Jordan",
        dueDate: "Jun 11",
        priority: "Medium",
      },
      {
        id: "fs-task-3",
        title: "Plan founder LinkedIn carousel series",
        status: "Planned",
        assignee: "Chris",
        dueDate: "Jun 14",
        priority: "Low",
      },
    ],
    assets: [
      {
        id: "fs-asset-1",
        name: "Pitch deck v12",
        type: "Google Slides",
        url: "https://example.com/fun-slides/pitch-deck",
        updatedAt: "Jun 6",
      },
      {
        id: "fs-asset-2",
        name: "Webinar brief",
        type: "Notion doc",
        url: "https://example.com/fun-slides/webinar-brief",
        updatedAt: "Jun 5",
      },
    ],
    contacts: [
      {
        id: "fs-contact-1",
        name: "Avery Stone",
        role: "Founder",
        email: "avery@funslides.example.com",
        channel: "Email",
      },
      {
        id: "fs-contact-2",
        name: "Nina Perez",
        role: "Design Lead",
        email: "nina@funslides.example.com",
        channel: "Slack",
      },
    ],
    upcoming: [
      {
        id: "fs-upcoming-1",
        title: "Webinar creative review",
        date: "Jun 11",
        type: "Review",
        owner: "Jordan",
      },
      {
        id: "fs-upcoming-2",
        title: "Sales deck handoff",
        date: "Jun 14",
        type: "Delivery",
        owner: "Maya",
      },
    ],
    notes: [
      "Founder wants stronger before-and-after proof points in all presentation narratives.",
      "Short-form content should ladder back to the webinar registration push through mid-June.",
    ],
  },
  {
    id: "swack-vacations",
    name: "Swack Vacations",
    description:
      "Travel brand balancing destination campaigns, email nurture, and seasonal booking pushes across multiple offers.",
    status: "Launching soon",
    website: "https://swackvacations.example.com",
    tasks: [
      {
        id: "sv-task-1",
        title: "Approve summer escape offer stack",
        status: "Needs review",
        assignee: "Taylor",
        dueDate: "Jun 9",
        priority: "High",
      },
      {
        id: "sv-task-2",
        title: "Refresh hero imagery for Bahamas package",
        status: "In progress",
        assignee: "Imani",
        dueDate: "Jun 12",
        priority: "Medium",
      },
      {
        id: "sv-task-3",
        title: "Build retargeting audience brief",
        status: "Planned",
        assignee: "Devon",
        dueDate: "Jun 15",
        priority: "Medium",
      },
    ],
    assets: [
      {
        id: "sv-asset-1",
        name: "Summer launch checklist",
        type: "Airtable",
        url: "https://example.com/swack-vacations/launch-checklist",
        updatedAt: "Jun 7",
      },
      {
        id: "sv-asset-2",
        name: "Bahamas social kit",
        type: "Figma",
        url: "https://example.com/swack-vacations/social-kit",
        updatedAt: "Jun 4",
      },
    ],
    contacts: [
      {
        id: "sv-contact-1",
        name: "Rory Blake",
        role: "Marketing Director",
        email: "rory@swackvacations.example.com",
        channel: "Email",
      },
      {
        id: "sv-contact-2",
        name: "Elle Price",
        role: "Paid Media Manager",
        email: "elle@swackvacations.example.com",
        channel: "Zoom",
      },
    ],
    upcoming: [
      {
        id: "sv-upcoming-1",
        title: "Summer escape launch",
        date: "Jun 13",
        type: "Launch",
        owner: "Taylor",
      },
      {
        id: "sv-upcoming-2",
        title: "Partner hotel call",
        date: "Jun 10",
        type: "Meeting",
        owner: "Elle",
      },
    ],
    notes: [
      "Launch messaging should lead with value stacking rather than destination romance for better conversion.",
      "Paid media budget can flex upward if the first three days outperform the Memorial Day benchmark.",
    ],
  },
  {
    id: "hammer-and-nails",
    name: "Hammer & Nails",
    description:
      "Home services brand coordinating location pages, local campaigns, and lead conversion improvements for a growing footprint.",
    status: "Needs attention",
    website: "https://hammerandnails.example.com",
    tasks: [
      {
        id: "hn-task-1",
        title: "Fix tracking gaps on quote form submissions",
        status: "In progress",
        assignee: "Logan",
        dueDate: "Jun 9",
        priority: "High",
      },
      {
        id: "hn-task-2",
        title: "Draft Dallas location page revisions",
        status: "Needs review",
        assignee: "Jamie",
        dueDate: "Jun 12",
        priority: "High",
      },
      {
        id: "hn-task-3",
        title: "Collect before-and-after project photos",
        status: "Planned",
        assignee: "Sky",
        dueDate: "Jun 16",
        priority: "Low",
      },
    ],
    assets: [
      {
        id: "hn-asset-1",
        name: "Local SEO brief",
        type: "Google Doc",
        url: "https://example.com/hammer-and-nails/seo-brief",
        updatedAt: "Jun 6",
      },
      {
        id: "hn-asset-2",
        name: "Service area map",
        type: "PDF",
        url: "https://example.com/hammer-and-nails/service-map",
        updatedAt: "Jun 3",
      },
    ],
    contacts: [
      {
        id: "hn-contact-1",
        name: "Marcus Hale",
        role: "Operations Manager",
        email: "marcus@hammerandnails.example.com",
        channel: "Phone",
      },
      {
        id: "hn-contact-2",
        name: "Tess Wu",
        role: "Franchise Marketing",
        email: "tess@hammerandnails.example.com",
        channel: "Slack",
      },
    ],
    upcoming: [
      {
        id: "hn-upcoming-1",
        title: "Analytics cleanup checkpoint",
        date: "Jun 9",
        type: "Deadline",
        owner: "Logan",
      },
      {
        id: "hn-upcoming-2",
        title: "Dallas page review",
        date: "Jun 12",
        type: "Review",
        owner: "Jamie",
      },
    ],
    notes: [
      "Lead quality is solid, but attribution is under-reporting PPC wins and hiding ROI.",
      "Location page revisions should feature financing and booking speed above the fold.",
    ],
  },
  {
    id: "renovation-navigator",
    name: "Renovation Navigator",
    description:
      "Education-driven remodeling brand using guides, lead magnets, and nurture sequences to convert high-intent homeowners.",
    status: "On track",
    website: "https://renovationnavigator.example.com",
    tasks: [
      {
        id: "rn-task-1",
        title: "Publish kitchen budget calculator article",
        status: "In progress",
        assignee: "Parker",
        dueDate: "Jun 10",
        priority: "Medium",
      },
      {
        id: "rn-task-2",
        title: "QA lead magnet download flow",
        status: "Done",
        assignee: "Noah",
        dueDate: "Jun 7",
        priority: "Low",
      },
      {
        id: "rn-task-3",
        title: "Outline bathroom guide email sequence",
        status: "Planned",
        assignee: "Parker",
        dueDate: "Jun 17",
        priority: "Medium",
      },
    ],
    assets: [
      {
        id: "rn-asset-1",
        name: "2026 content calendar",
        type: "Notion doc",
        url: "https://example.com/renovation-navigator/content-calendar",
        updatedAt: "Jun 5",
      },
      {
        id: "rn-asset-2",
        name: "Budget calculator wireframe",
        type: "Figma",
        url: "https://example.com/renovation-navigator/wireframe",
        updatedAt: "Jun 2",
      },
    ],
    contacts: [
      {
        id: "rn-contact-1",
        name: "Lena Brooks",
        role: "Content Strategist",
        email: "lena@renovationnavigator.example.com",
        channel: "Email",
      },
      {
        id: "rn-contact-2",
        name: "Eric Moss",
        role: "Developer",
        email: "eric@renovationnavigator.example.com",
        channel: "Slack",
      },
    ],
    upcoming: [
      {
        id: "rn-upcoming-1",
        title: "Calculator article publish",
        date: "Jun 10",
        type: "Publish",
        owner: "Parker",
      },
      {
        id: "rn-upcoming-2",
        title: "Lead magnet results review",
        date: "Jun 18",
        type: "Meeting",
        owner: "Lena",
      },
    ],
    notes: [
      "Evergreen educational content is steadily improving organic lead flow and lower-funnel conversion.",
      "Next content sprint should repurpose calculator insights into short-form social proof snippets.",
    ],
  },
  {
    id: "mold-medics",
    name: "Mold Medics",
    description:
      "Emergency-response style remediation brand where speed, trust, and local authority signals matter across every campaign touchpoint.",
    status: "Needs attention",
    website: "https://moldmedics.example.com",
    tasks: [
      {
        id: "mm-task-1",
        title: "Refresh emergency CTA messaging",
        status: "Needs review",
        assignee: "Harper",
        dueDate: "Jun 8",
        priority: "High",
      },
      {
        id: "mm-task-2",
        title: "Audit GBP review response cadence",
        status: "In progress",
        assignee: "Kai",
        dueDate: "Jun 11",
        priority: "Medium",
      },
      {
        id: "mm-task-3",
        title: "Draft insurance FAQ landing page",
        status: "Planned",
        assignee: "Ari",
        dueDate: "Jun 15",
        priority: "Medium",
      },
    ],
    assets: [
      {
        id: "mm-asset-1",
        name: "Emergency messaging matrix",
        type: "Google Sheet",
        url: "https://example.com/mold-medics/messaging-matrix",
        updatedAt: "Jun 7",
      },
      {
        id: "mm-asset-2",
        name: "Insurance FAQ draft",
        type: "Google Doc",
        url: "https://example.com/mold-medics/insurance-faq",
        updatedAt: "Jun 5",
      },
    ],
    contacts: [
      {
        id: "mm-contact-1",
        name: "Dana Ellis",
        role: "Owner",
        email: "dana@moldmedics.example.com",
        channel: "Phone",
      },
      {
        id: "mm-contact-2",
        name: "Owen Pike",
        role: "Field Operations",
        email: "owen@moldmedics.example.com",
        channel: "Text",
      },
    ],
    upcoming: [
      {
        id: "mm-upcoming-1",
        title: "CTA messaging sign-off",
        date: "Jun 8",
        type: "Approval",
        owner: "Harper",
      },
      {
        id: "mm-upcoming-2",
        title: "Local trust signal review",
        date: "Jun 12",
        type: "Review",
        owner: "Kai",
      },
    ],
    notes: [
      "Urgency messaging needs to reassure without sounding alarmist; trust and clarity should lead.",
      "Insurance-related search intent is growing and deserves a dedicated conversion path.",
    ],
  },
  {
    id: "verizon-wireless-zone",
    name: "Verizon / Wireless Zone",
    description:
      "Retail telecom portfolio blending promotional calendars, store-level updates, and partner coordination around device launches.",
    status: "Launching soon",
    website: "https://wirelesszone.example.com",
    tasks: [
      {
        id: "vz-task-1",
        title: "Approve device launch promo grid",
        status: "Needs review",
        assignee: "Morgan",
        dueDate: "Jun 9",
        priority: "High",
      },
      {
        id: "vz-task-2",
        title: "Update store locator campaign copy",
        status: "In progress",
        assignee: "Reese",
        dueDate: "Jun 13",
        priority: "Medium",
      },
      {
        id: "vz-task-3",
        title: "Prep co-op reporting recap",
        status: "Planned",
        assignee: "Blair",
        dueDate: "Jun 18",
        priority: "Low",
      },
    ],
    assets: [
      {
        id: "vz-asset-1",
        name: "Launch promo matrix",
        type: "Google Sheet",
        url: "https://example.com/verizon-wireless-zone/promo-matrix",
        updatedAt: "Jun 6",
      },
      {
        id: "vz-asset-2",
        name: "Retail signage set",
        type: "Dropbox folder",
        url: "https://example.com/verizon-wireless-zone/signage",
        updatedAt: "Jun 4",
      },
    ],
    contacts: [
      {
        id: "vz-contact-1",
        name: "Sasha Cole",
        role: "Regional Marketing",
        email: "sasha@wirelesszone.example.com",
        channel: "Email",
      },
      {
        id: "vz-contact-2",
        name: "Ben Tran",
        role: "Channel Partner Manager",
        email: "ben@wirelesszone.example.com",
        channel: "Teams",
      },
    ],
    upcoming: [
      {
        id: "vz-upcoming-1",
        title: "Device launch kickoff",
        date: "Jun 13",
        type: "Launch",
        owner: "Morgan",
      },
      {
        id: "vz-upcoming-2",
        title: "Store update sync",
        date: "Jun 11",
        type: "Meeting",
        owner: "Reese",
      },
    ],
    notes: [
      "Retail and digital messaging need tighter alignment so in-store staff can reinforce active promos.",
      "Launch week reporting should separate branded search lift from store locator engagement.",
    ],
  },
];
