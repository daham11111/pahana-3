export const ORDER_STATUSES = [
  "Submitted",
  "Reviewing",
  "Price Quoted",
  "Payment Pending",
  "In Progress",
  "Quality Check",
  "Completed",
  "Delivered",
] as const;

export const ALL_STATUSES = [...ORDER_STATUSES, "Cancelled"] as const;

export const PAYMENT_STATUSES = [
  "Unpaid",
  "Payment Submitted",
  "Payment Verified",
  "Refunded",
] as const;

export type OrderStatus = (typeof ALL_STATUSES)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const STATUS_NOTICE: Record<string, string> = {
  Reviewing: "Your assignment is currently being reviewed.",
  "Price Quoted": "A new price quote is available.",
  "Payment Pending": "Payment is pending for your order.",
  "In Progress": "Your assignment is now in progress.",
  "Quality Check": "Your assignment is in quality check.",
  Completed: "Your assignment is ready for download.",
  Delivered: "Your assignment has been delivered.",
  Cancelled: "Your order has been cancelled.",
};

export const ASSIGNMENT_TYPES = [
  "Essay",
  "Report",
  "Coding",
  "Presentation",
  "Case study",
  "Other",
];

export const REF_STYLES = ["Harvard", "APA", "IEEE", "MLA", "None"];

export const CAMPUSES: Record<string, string[]> = {
  "State universities": [
    "University of Colombo",
    "University of Peradeniya",
    "University of Sri Jayewardenepura",
    "University of Kelaniya",
    "University of Moratuwa",
    "University of Jaffna",
    "University of Ruhuna",
    "Eastern University, Sri Lanka",
    "South Eastern University of Sri Lanka",
    "Rajarata University of Sri Lanka",
    "Sabaragamuwa University of Sri Lanka",
    "Wayamba University of Sri Lanka",
    "Uva Wellassa University",
    "The Open University of Sri Lanka",
    "University of Vavuniya",
    "University of the Visual & Performing Arts",
    "Gampaha Wickramarachchi University of Indigenous Medicine",
    "Ocean University of Sri Lanka",
    "Buddhist and Pali University of Sri Lanka",
    "Bhikkhu University of Sri Lanka",
    "General Sir John Kotelawala Defence University (KDU)",
    "Sri Lanka Institute of Advanced Technological Education (SLIATE)",
  ],
  "Private / degree-awarding": [
    "SLIIT",
    "NSBM Green University",
    "Informatics Institute of Technology (IIT)",
    "APIIT / Asia Pacific Institute of Information Technology",
    "CINEC Campus",
    "ICBT Campus",
    "ESOFT Metro Campus",
    "Horizon Campus",
    "Sri Lanka Technological Campus (SLTC)",
    "KAATSU International University",
    "BMS Campus",
    "Saegis Campus",
    "Royal Institute of Colombo",
    "IDM Nations Campus",
    "National Institute of Business Management (NIBM)",
    "Australian College of Business & Technology (ACBT)",
    "Lyceum Campus",
    "Sri Lanka Law College",
    "SLIDA",
  ],
};

export const ALLOWED_FILE = /\.(pdf|docx?|pptx?|xlsx?|zip|png|jpe?g|gif|webp)$/i;
export const MAX_FILE_BYTES = 20 * 1024 * 1024;
export const MAX_FILES = 8;

export const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;

export const lkr = (n?: number | null) =>
  n ? "LKR " + Number(n).toLocaleString("en-LK") : "Custom quote";

export const fmt = (t: string | number | Date) =>
  new Date(t).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export const fmtDate = (t?: string | null) =>
  t ? new Date(t).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export const kb = (bytes: number) => `${Math.round(bytes / 1024)} KB`;

export const PENDING_STATUSES = ["Submitted", "Reviewing", "Price Quoted", "Payment Pending"];
export const ACTIVE_STATUSES = ["In Progress", "Quality Check"];
export const DONE_STATUSES = ["Completed", "Delivered"];
