import { addDays, startOfDay, toISODate } from "@/lib/date";

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

export type Note = {
  id: string;
  text: string;
  createdAt: string;
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
  notes: Note[];
};

const mockBaseDate = startOfDay(new Date());

function mockDate(offset: number) {
  return toISODate(addDays(mockBaseDate, offset));
}

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
        dueDate: mockDate(1),
        priority: "High",
      },
      {
        id: "fs-task-2",
        title: "Review speaker slide template pack",
        status: "Needs review",
        assignee: "Jordan",
        dueDate: mockDate(2),
        priority: "Medium",
      },
      {
        id: "fs-task-3",
        title: "Plan founder LinkedIn carousel run",
        status: "Planned",
        assignee: "Chris",
        dueDate: mockDate(6),
        priority: "Low",
      },
    ],
    assets: [
      {
        id: "fs-asset-1",
        name: "Pitch deck v12",
        type: "Google Slides",
        url: "https://example.com/fun-slides/pitch-deck",
        updatedAt: mockDate(-1),
      },
      {
        id: "fs-asset-2",
        name: "Webinar brief",
        type: "Notion doc",
        url: "https://example.com/fun-slides/webinar-brief",
        updatedAt: mockDate(-2),
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
        date: mockDate(2),
        type: "Review",
        owner: "Jordan",
      },
      {
        id: "fs-upcoming-2",
        title: "Sales deck handoff",
        date: mockDate(6),
        type: "Delivery",
        owner: "Maya",
      },
    ],
    notes: [
      {
        id: "fs-note-1",
        text: "Founder wants stronger before-and-after proof points in all presentation narratives.",
        createdAt: mockDate(0),
      },
      {
        id: "fs-note-2",
        text: "Short-form content should keep feeding webinar registration through next Friday.",
        createdAt: mockDate(-2),
      },
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
        dueDate: mockDate(0),
        priority: "High",
      },
      {
        id: "sv-task-2",
        title: "Refresh hero imagery for Bahamas package",
        status: "In progress",
        assignee: "Imani",
        dueDate: mockDate(4),
        priority: "Medium",
      },
      {
        id: "sv-task-3",
        title: "Build retargeting audience brief",
        status: "Planned",
        assignee: "Devon",
        dueDate: mockDate(7),
        priority: "Medium",
      },
    ],
    assets: [
      {
        id: "sv-asset-1",
        name: "Summer launch checklist",
        type: "Airtable",
        url: "https://example.com/swack-vacations/launch-checklist",
        updatedAt: mockDate(0),
      },
      {
        id: "sv-asset-2",
        name: "Bahamas social kit",
        type: "Figma",
        url: "https://example.com/swack-vacations/social-kit",
        updatedAt: mockDate(-3),
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
        title: "Partner hotel call",
        date: mockDate(1),
        type: "Meeting",
        owner: "Elle",
      },
      {
        id: "sv-upcoming-2",
        title: "Summer escape launch",
        date: mockDate(6),
        type: "Launch",
        owner: "Taylor",
      },
    ],
    notes: [
      {
        id: "sv-note-1",
        text: "Launch messaging should lead with value stacking rather than destination romance.",
        createdAt: mockDate(-1),
      },
      {
        id: "sv-note-2",
        text: "Paid media budget can flex upward if the first three launch days beat Memorial Day benchmarks.",
        createdAt: mockDate(-4),
      },
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
        dueDate: mockDate(0),
        priority: "High",
      },
      {
        id: "hn-task-2",
        title: "Draft Dallas location page revisions",
        status: "Needs review",
        assignee: "Jamie",
        dueDate: mockDate(3),
        priority: "High",
      },
      {
        id: "hn-task-3",
        title: "Collect before-and-after project photos",
        status: "Planned",
        assignee: "Sky",
        dueDate: mockDate(8),
        priority: "Low",
      },
    ],
    assets: [
      {
        id: "hn-asset-1",
        name: "Local SEO brief",
        type: "Google Doc",
        url: "https://example.com/hammer-and-nails/seo-brief",
        updatedAt: mockDate(-1),
      },
      {
        id: "hn-asset-2",
        name: "Service area map",
        type: "PDF",
        url: "https://example.com/hammer-and-nails/service-map",
        updatedAt: mockDate(-4),
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
        date: mockDate(0),
        type: "Deadline",
        owner: "Logan",
      },
      {
        id: "hn-upcoming-2",
        title: "Dallas page review",
        date: mockDate(4),
        type: "Review",
        owner: "Jamie",
      },
    ],
    notes: [
      {
        id: "hn-note-1",
        text: "Attribution is under-reporting PPC wins and hiding location-level ROI.",
        createdAt: mockDate(0),
      },
      {
        id: "hn-note-2",
        text: "Dallas page revisions should feature financing and booking speed above the fold.",
        createdAt: mockDate(-3),
      },
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
        dueDate: mockDate(1),
        priority: "Medium",
      },
      {
        id: "rn-task-2",
        title: "QA lead magnet download flow",
        status: "Done",
        assignee: "Noah",
        dueDate: mockDate(-1),
        priority: "Low",
      },
      {
        id: "rn-task-3",
        title: "Outline bathroom guide email sequence",
        status: "Planned",
        assignee: "Parker",
        dueDate: mockDate(9),
        priority: "Medium",
      },
    ],
    assets: [
      {
        id: "rn-asset-1",
        name: "2026 content calendar",
        type: "Notion doc",
        url: "https://example.com/renovation-navigator/content-calendar",
        updatedAt: mockDate(-2),
      },
      {
        id: "rn-asset-2",
        name: "Budget calculator wireframe",
        type: "Figma",
        url: "https://example.com/renovation-navigator/wireframe",
        updatedAt: mockDate(-5),
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
        date: mockDate(1),
        type: "Publish",
        owner: "Parker",
      },
      {
        id: "rn-upcoming-2",
        title: "Lead magnet results review",
        date: mockDate(8),
        type: "Meeting",
        owner: "Lena",
      },
    ],
    notes: [
      {
        id: "rn-note-1",
        text: "Calculator insights should be repackaged into short-form proof content next sprint.",
        createdAt: mockDate(-1),
      },
      {
        id: "rn-note-2",
        text: "Evergreen educational content is still the best lower-funnel conversion assist for this brand.",
        createdAt: mockDate(-5),
      },
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
        dueDate: mockDate(-1),
        priority: "High",
      },
      {
        id: "mm-task-2",
        title: "Audit GBP review response cadence",
        status: "In progress",
        assignee: "Kai",
        dueDate: mockDate(2),
        priority: "Medium",
      },
      {
        id: "mm-task-3",
        title: "Draft insurance FAQ landing page",
        status: "Planned",
        assignee: "Ari",
        dueDate: mockDate(6),
        priority: "Medium",
      },
    ],
    assets: [
      {
        id: "mm-asset-1",
        name: "Emergency messaging matrix",
        type: "Google Sheet",
        url: "https://example.com/mold-medics/messaging-matrix",
        updatedAt: mockDate(0),
      },
      {
        id: "mm-asset-2",
        name: "Insurance FAQ draft",
        type: "Google Doc",
        url: "https://example.com/mold-medics/insurance-faq",
        updatedAt: mockDate(-2),
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
        date: mockDate(0),
        type: "Approval",
        owner: "Harper",
      },
      {
        id: "mm-upcoming-2",
        title: "Local trust signal review",
        date: mockDate(5),
        type: "Review",
        owner: "Kai",
      },
    ],
    notes: [
      {
        id: "mm-note-1",
        text: "Urgency messaging needs to reassure without sounding alarmist.",
        createdAt: mockDate(-1),
      },
      {
        id: "mm-note-2",
        text: "Insurance-related search intent is growing and deserves a dedicated conversion path.",
        createdAt: mockDate(-4),
      },
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
        dueDate: mockDate(1),
        priority: "High",
      },
      {
        id: "vz-task-2",
        title: "Update store locator campaign copy",
        status: "In progress",
        assignee: "Reese",
        dueDate: mockDate(5),
        priority: "Medium",
      },
      {
        id: "vz-task-3",
        title: "Prep co-op reporting recap",
        status: "Planned",
        assignee: "Blair",
        dueDate: mockDate(10),
        priority: "Low",
      },
    ],
    assets: [
      {
        id: "vz-asset-1",
        name: "Launch promo matrix",
        type: "Google Sheet",
        url: "https://example.com/verizon-wireless-zone/promo-matrix",
        updatedAt: mockDate(-1),
      },
      {
        id: "vz-asset-2",
        name: "Retail signage set",
        type: "Dropbox folder",
        url: "https://example.com/verizon-wireless-zone/signage",
        updatedAt: mockDate(-3),
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
        title: "Store update sync",
        date: mockDate(2),
        type: "Meeting",
        owner: "Reese",
      },
      {
        id: "vz-upcoming-2",
        title: "Device launch kickoff",
        date: mockDate(6),
        type: "Launch",
        owner: "Morgan",
      },
    ],
    notes: [
      {
        id: "vz-note-1",
        text: "Retail and digital messaging need tighter alignment before launch week.",
        createdAt: mockDate(0),
      },
      {
        id: "vz-note-2",
        text: "Launch reporting should separate branded search lift from store locator engagement.",
        createdAt: mockDate(-3),
      },
    ],
  },
];
