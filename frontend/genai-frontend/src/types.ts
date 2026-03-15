export interface DiseaseStage {
  id: string;
  name: string;
  timeline: string;
  affectedOrgans: string[];
  symptoms: string[];
  biologicalProcess: string;
}

export interface Disease {
  id: string;
  name: string;
  stages: DiseaseStage[];
}

export const DISEASES: Disease[] = [
  // {
  //   id: "Test2",
  //   name: "Test2",
  //   stages: [
  //     {
  //       id: "congestion",
  //       name: "Congestion Stage",
  //       timeline: "Day 0-1",
  //       affectedOrgans: ["lungs", "blood"],
  //       symptoms: ["Sudden onset fever", "Chills", "Productive cough"],
  //       biologicalProcess: "Pathogen (bacteria/virus) enters lungs. Immune cells rush to infection site. Alveoli fill with fluid and blood cells, causing congestion."
  //     },
  //     {
  //       id: "red-hepatization",
  //       name: "Red Hepatization",
  //       timeline: "Day 1-3",
  //       affectedOrgans: ["lungs"],
  //       symptoms: ["Rust-colored sputum", "Chest pain", "Difficulty breathing"],
  //       biologicalProcess: "Alveoli fill with red blood cells, neutrophils, and fibrin. Lungs become firm and red, resembling liver tissue. Gas exchange is severely impaired."
  //     },
  //     {
  //       id: "gray-hepatization",
  //       name: "Gray Hepatization",
  //       timeline: "Day 3-7",
  //       affectedOrgans: ["lungs"],
  //       symptoms: ["Decreased fever", "Less sputum production", "Continued breathlessness"],
  //       biologicalProcess: "Red blood cells break down. Fibrin and neutrophils dominate. Lungs appear grayish. Immune response is actively fighting infection."
  //     },
  //     {
  //       id: "resolution",
  //       name: "Resolution",
  //       timeline: "Day 7-14",
  //       affectedOrgans: ["lungs", "immune"],
  //       symptoms: ["Gradual improvement", "Reduced cough", "Better breathing"],
  //       biologicalProcess: "Enzymatic digestion of exudate begins. Macrophages clear debris. Alveoli re-expand and normal lung architecture is restored."
  //     }
  //   ]
  // },
  // {
  //   id: "test",
  //   name: "TEST",
  //   stages: [
  //     {
  //       id: "all-organs",
  //       name: "All Organs Test Stage",
  //       timeline: "Validation",
  //       affectedOrgans: [
  //         "brain",
  //         "heart",
  //         "lungs",
  //         "liver",
  //         "kidneys",
  //         "esophagus",
  //         "stomach",
  //         "small_intestine",
  //         "large_intestine",
  //         "pancreas",
  //         "gallbladder",
  //         "appendix",
  //         "rectum",
  //         "spinal_cord",
  //         "eyes",
  //         "ears",
  //         "trachea",
  //         "diaphragm",
  //         "spleen",
  //         "tonsils",
  //         "lymph_nodes",
  //         "bladder",
  //         "urethra",
  //         "thyroid",
  //         "adrenal_glands",
  //         "uterus",
  //         "ovaries",
  //         "testes",
  //         "prostate",
  //         "skin"
  //       ],
  //       symptoms: ["Coordinate check", "Marker validation", "All organs highlighted"],
  //       biologicalProcess: "Testing stage used to verify that all 30 manually placed organ coordinates appear correctly on the body model in a single view."
  //     }
  //   ]
  // }
];

export const ORGAN_POSITIONS: Record<string, { x: number; y: number }> = {
  brain: { x: 50, y: 8 },
  spinal_cord: { x: 50, y: 24 },
  eyes: { x: 50, y: 12 },
  ears: { x: 50, y: 14 },
  nose: { x: 50, y: 15 },
  tonsils: { x: 50, y: 18 },
  throat: { x: 50, y: 20 },
  trachea: { x: 50, y: 24 },
  esophagus: { x: 48, y: 26 },
  thyroid: { x: 50, y: 22 },
  lymph_nodes: { x: 50, y: 27 },
  lungs: { x: 50, y: 35 },
  heart: { x: 53, y: 36 },
  diaphragm: { x: 50, y: 41 },
  liver: { x: 58, y: 42 },
  gallbladder: { x: 60, y: 45 },
  stomach: { x: 44, y: 45 },
  spleen: { x: 40, y: 40 },
  pancreas: { x: 48, y: 48 },
  adrenal_glands: { x: 50, y: 49 },
  kidneys: { x: 50, y: 52 },
  appendix: { x: 57, y: 60 },
  small_intestine: { x: 48, y: 58 },
  intestines: { x: 50, y: 60 },
  colon: { x: 50, y: 63 },
  large_intestine: { x: 50, y: 63 },
  rectum: { x: 50, y: 73 },
  bladder: { x: 50, y: 77 },
  urethra: { x: 50, y: 83 },
  uterus: { x: 50, y: 80 },
  ovaries: { x: 47, y: 79 },
  testes: { x: 50, y: 86 },
  prostate: { x: 50, y: 81 },
  skin: { x: 30, y: 30 },
  blood: { x: 50, y: 70 },
  immune: { x: 50, y: 75 },
  muscles: { x: 35, y: 50 },
  nerves: { x: 65, y: 55 },
  feet: { x: 50, y: 92 }
};

export const ORGAN_POSITIONS_3D: Record<string, { x: number; y: number; z: number }> = {
<<<<<<< Updated upstream
  brain: { x: 0, y: 1.6, z: 0 },
  eyes: { x: 0, y: 1.5, z: 0.15 },
  nose: { x: 0, y: 1.4, z: 0.15 },
  throat: { x: 0, y: 1.2, z: 0 },
  lungs: { x: 0.25, y: 0.6, z: 0 },
  heart: { x: -0.1, y: 0.5, z: 0.1 },
  liver: { x: 0.3, y: 0.2, z: 0.1 },
  pancreas: { x: -0.2, y: 0.1, z: 0.15 },
  stomach: { x: 0, y: 0.15, z: 0.2 },
  kidneys: { x: 0.25, y: 0, z: -0.15 },
  intestines: { x: 0, y: -0.3, z: 0.1 },
  blood: { x: 0, y: 0.3, z: -0.2 },
  immune: { x: 0, y: 0.8, z: -0.2 },
  muscles: { x: 0.4, y: 0.3, z: 0 },
  nerves: { x: 0, y: 0.5, z: -0.25 },
  feet: { x: 0, y: -1.6, z: 0 }
=======
  brain: { x: 0, y: 0.85, z: -0.02 },
  spinal_cord: { x: 0, y: 0.42, z: -0.12 },
  eyes: { x: 0, y: 0.82, z: 0.08 },
  ears: { x: 0.14, y: 0.79, z: 0.02 },
  nose: { x: 0, y: 0.75, z: 0.12 },
  tonsils: { x: 0, y: 0.69, z: 0.08 },
  throat: { x: 0, y: 0.65, z: 0 },
  trachea: { x: 0, y: 0.58, z: 0.08 },
  esophagus: { x: -0.02, y: 0.52, z: -0.03 },
  thyroid: { x: 0, y: 0.63, z: 0.06 },
  lymph_nodes: { x: 0.12, y: 0.58, z: -0.02 },
  lungs: { x: 0, y: 0.5, z: 0 },
  heart: { x: 0.1, y: 0.5, z: 0.1 },
  diaphragm: { x: 0, y: 0.34, z: 0.02 },
  liver: { x: -0.1, y: 0.2, z: 0.05 },
  gallbladder: { x: -0.14, y: 0.16, z: 0.1 },
  stomach: { x: 0.07, y: 0.2, z: 0.05 },
  spleen: { x: 0.16, y: 0.26, z: 0.02 },
  pancreas: { x: 0, y: 0.2, z: 0.1 },
  adrenal_glands: { x: 0.08, y: 0.14, z: -0.02 },
  kidneys: { x: 0.07, y: 0.1, z: 0 },
  appendix: { x: -0.08, y: -0.02, z: 0.08 },
  small_intestine: { x: 0, y: 0.02, z: 0.11 },
  intestines: { x: 0, y: 0.12, z: 0.1 },
  colon: { x: 0, y: -0.02, z: 0.06 },
  large_intestine: { x: 0, y: -0.02, z: 0.06 },
  rectum: { x: 0, y: -0.24, z: 0.02 },
  bladder: { x: 0, y: -0.32, z: 0.08 },
  urethra: { x: 0, y: -0.43, z: 0.1 },
  uterus: { x: 0, y: -0.3, z: 0.03 },
  ovaries: { x: 0.12, y: -0.28, z: 0.02 },
  testes: { x: 0, y: -0.5, z: 0.08 },
  prostate: { x: 0, y: -0.36, z: 0.06 },
  skin: { x: -0.28, y: 0.32, z: 0.12 },
  blood: { x: 0, y: 0.3, z: 0 },
  immune: { x: 0.1, y: 0.6, z: -0.02 },
  muscles: { x: -0.3, y: 0.3, z: 0 },
  nerves: { x: -0.1, y: 0.6, z: -0.02 },
  feet: { x: -0.15, y: -0.85, z: 0 }
>>>>>>> Stashed changes
};