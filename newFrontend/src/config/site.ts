export const siteConfig = {
  name: "SABER",
  title: "SABER: Sensor-Agnostic Bridged Embedding Retrieval for All-Weather Earth Observation & Disaster Intelligence",
  motto: "Eliminating Cloud Blindness for India's Disaster Response in 28 Milliseconds",
  institution: "Atal Bihari Vajpayee Indian Institute of Information Technology and Management Gwalior (ABV-IIITM Gwalior)",
  competition: "Ideas for India: Innovation Challenge 2026 (Optum) · Sovereign Technology for India Track",
  team: ["Chandaluri Hemateja", "Shivansh Katiyar", "Prabal Poddar", "Srijan Singh"],
  url: "https://github.com/hemateja-1/SABER_X",
  getStartedUrl: "/dashboard/format/disaster-command",
  ogImage: "https://github.com/hemateja-1/SABER_X/raw/main/visualizations/saber_banner.png",
  description:
    "Sovereign Deep-Tech AI platform projecting heterogeneous satellite sensors (SAR, Optical, Panchromatic) into a unified 768-D latent space via Conditional Flow Matching (CFM) Neural ODEs to eliminate cloud blindness in 28ms for NDRF, SDMA, and ISRO.",
  version: "v2.0-Sovereign",
  links: {
    github: "https://github.com/hemateja-1/SABER_X",
    pitchDeck: "/dashboard/format/pitch-deck",
    disasterCommand: "/dashboard/format/disaster-command",
    queryInspector: "/dashboard/format/query",
  },
};

export type SiteConfig = typeof siteConfig;
