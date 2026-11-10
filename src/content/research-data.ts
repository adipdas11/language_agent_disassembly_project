export type EvidenceSource = "paper" | "illustrative";
export interface AuthorConfig {
  name: string;
  affiliation: string;
  email: { local: string; domain: string };
}
export interface SiteContent {
  title: string;
  shortTitle: string;
  showAuthors: boolean;
  authors: AuthorConfig[];
}
export interface PromptSection {
  title: string;
  source: string;
  body: string;
}

export const siteConfig: SiteContent = {
  title: "REMAKE: Language-Agent Planning over Structured World States for Adaptive Dual-arm Robotic Disassembly",
  shortTitle: "REMAKE",
  showAuthors: true,
  authors: [
    {
      name: "Adip Ranjan Das",
      affiliation:
        "School of Engineering and Physical Sciences, Heriot-Watt University, Edinburgh, UK",
      email: { local: "ard2000", domain: "hw.ac.uk" },
    },
    {
      name: "David Neilan",
      affiliation:
        "School of Engineering and Physical Sciences, Heriot-Watt University, Edinburgh, UK",
      email: { local: "ddn4000", domain: "hw.ac.uk" },
    },
    {
      name: "Maria Koskinopoulou",
      affiliation:
        "School of Engineering and Physical Sciences, Heriot-Watt University, Edinburgh, UK",
      email: { local: "M.Koskinopoulou", domain: "hw.ac.uk" },
    },
  ],
};

export const datasets = [
  {
    label: "Local fastener dataset",
    href: "https://universe.roboflow.com/hard-drive/electronic_devices_local",
    detail: "Tool-camera localisation",
    description:
      "Close-up visual data for locating screw targets and aligning the tooling arm before contact.",
  },
  {
    label: "Global device dataset",
    href: "https://universe.roboflow.com/hard-drive/electronic_device_global",
    detail: "Scene components",
    description:
      "Scene-level visual data for detecting device parts, fixtures, and visible fasteners.",
  },
  {
    label: "Process-state dataset",
    href: "https://universe.roboflow.com/hard-drive/hdd_process_states",
    detail: "Alignment and removal verification",
    description:
      "Action-state visual data used to distinguish aligned, misaligned, and removed outcomes.",
  },
];
