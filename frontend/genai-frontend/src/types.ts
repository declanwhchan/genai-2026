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
  {
    id: "covid-19",
    name: "COVID-19",
    stages: [
      {
        id: "incubation",
        name: "Incubation Period",
        timeline: "Day 0-5",
        affectedOrgans: ["lungs", "throat"],
        symptoms: ["No symptoms", "Virus replication begins"],
        biologicalProcess: "SARS-CoV-2 virus enters the body through respiratory droplets, binding to ACE2 receptors in the respiratory tract. Viral replication begins in the upper respiratory system."
      },
      {
        id: "early-infection",
        name: "Early Infection",
        timeline: "Day 5-7",
        affectedOrgans: ["throat", "lungs", "nose"],
        symptoms: ["Fever", "Dry cough", "Fatigue", "Loss of taste/smell"],
        biologicalProcess: "Immune system recognizes the virus and triggers an inflammatory response. Cytokines are released, causing fever and fatigue. Virus spreads to lower respiratory tract."
      },
      {
        id: "acute-phase",
        name: "Acute Phase",
        timeline: "Day 7-14",
        affectedOrgans: ["lungs", "heart", "blood"],
        symptoms: ["Shortness of breath", "Chest pain", "Persistent fever", "Body aches"],
        biologicalProcess: "Inflammatory response intensifies. In severe cases, cytokine storm may occur, leading to acute respiratory distress syndrome (ARDS). Oxygen levels may drop."
      },
      {
        id: "recovery",
        name: "Recovery Phase",
        timeline: "Day 14-21",
        affectedOrgans: ["lungs", "immune"],
        symptoms: ["Gradual symptom improvement", "Reduced fever", "Less fatigue"],
        biologicalProcess: "Adaptive immune response develops. T-cells and antibodies work to clear the virus. Lung tissue begins to heal, though some inflammation may persist."
      }
    ]
  },
  {
    id: "diabetes-type2",
    name: "Type 2 Diabetes",
    stages: [
      {
        id: "prediabetes",
        name: "Prediabetes",
        timeline: "Months to Years",
        affectedOrgans: ["pancreas", "liver", "blood"],
        symptoms: ["Increased thirst", "Frequent urination", "Fatigue", "Blurred vision"],
        biologicalProcess: "Insulin resistance develops in muscle, fat, and liver cells. Pancreas produces more insulin to compensate, but blood glucose levels begin to rise above normal."
      },
      {
        id: "early-diabetes",
        name: "Early Type 2 Diabetes",
        timeline: "1-3 Years",
        affectedOrgans: ["pancreas", "blood", "kidneys", "eyes"],
        symptoms: ["Increased hunger", "Slow wound healing", "Tingling in extremities"],
        biologicalProcess: "Beta cells in the pancreas become exhausted and cannot produce enough insulin. Chronic hyperglycemia begins to damage small blood vessels in kidneys and eyes."
      },
      {
        id: "established-diabetes",
        name: "Established Diabetes",
        timeline: "3-10 Years",
        affectedOrgans: ["heart", "kidneys", "eyes", "nerves", "blood"],
        symptoms: ["Cardiovascular issues", "Neuropathy", "Retinopathy", "Nephropathy"],
        biologicalProcess: "Persistent high blood sugar damages blood vessels throughout the body. Advanced glycation end products (AGEs) accumulate, causing tissue damage. Microvascular and macrovascular complications develop."
      },
      {
        id: "complications",
        name: "Advanced Complications",
        timeline: "10+ Years",
        affectedOrgans: ["heart", "kidneys", "feet", "eyes", "nerves"],
        symptoms: ["Heart disease", "Kidney failure", "Vision loss", "Foot ulcers"],
        biologicalProcess: "Severe vascular damage leads to organ dysfunction. Nephropathy may progress to end-stage renal disease. Retinopathy can cause blindness. Peripheral neuropathy increases amputation risk."
      }
    ]
  },
  {
    id: "influenza",
    name: "Influenza (Flu)",
    stages: [
      {
        id: "incubation",
        name: "Incubation",
        timeline: "Day 0-2",
        affectedOrgans: ["throat", "nose"],
        symptoms: ["No symptoms", "Viral replication"],
        biologicalProcess: "Influenza virus enters through respiratory tract and attaches to epithelial cells. Viral replication begins in the upper respiratory system."
      },
      {
        id: "acute-illness",
        name: "Acute Illness",
        timeline: "Day 2-5",
        affectedOrgans: ["throat", "nose", "lungs", "muscles"],
        symptoms: ["High fever", "Severe body aches", "Headache", "Dry cough", "Fatigue"],
        biologicalProcess: "Widespread viral infection triggers strong immune response. Interferons and cytokines cause systemic symptoms. Virus spreads to lower respiratory tract."
      },
      {
        id: "recovery",
        name: "Recovery",
        timeline: "Day 5-10",
        affectedOrgans: ["lungs", "immune"],
        symptoms: ["Decreasing fever", "Reduced aches", "Persistent cough", "Fatigue"],
        biologicalProcess: "Immune system gains control. Antibodies and T-cells clear infected cells. Respiratory epithelium begins to regenerate, though cough may persist."
      }
    ]
  },
  {
    id: "pneumonia",
    name: "Pneumonia",
    stages: [
      {
        id: "congestion",
        name: "Congestion Stage",
        timeline: "Day 0-1",
        affectedOrgans: ["lungs", "blood"],
        symptoms: ["Sudden onset fever", "Chills", "Productive cough"],
        biologicalProcess: "Pathogen (bacteria/virus) enters lungs. Immune cells rush to infection site. Alveoli fill with fluid and blood cells, causing congestion."
      },
      {
        id: "red-hepatization",
        name: "Red Hepatization",
        timeline: "Day 1-3",
        affectedOrgans: ["lungs"],
        symptoms: ["Rust-colored sputum", "Chest pain", "Difficulty breathing"],
        biologicalProcess: "Alveoli fill with red blood cells, neutrophils, and fibrin. Lungs become firm and red, resembling liver tissue. Gas exchange is severely impaired."
      },
      {
        id: "gray-hepatization",
        name: "Gray Hepatization",
        timeline: "Day 3-7",
        affectedOrgans: ["lungs"],
        symptoms: ["Decreased fever", "Less sputum production", "Continued breathlessness"],
        biologicalProcess: "Red blood cells break down. Fibrin and neutrophils dominate. Lungs appear grayish. Immune response is actively fighting infection."
      },
      {
        id: "resolution",
        name: "Resolution",
        timeline: "Day 7-14",
        affectedOrgans: ["lungs", "immune"],
        symptoms: ["Gradual improvement", "Reduced cough", "Better breathing"],
        biologicalProcess: "Enzymatic digestion of exudate begins. Macrophages clear debris. Alveoli re-expand and normal lung architecture is restored."
      }
    ]
  }
];

export const ORGAN_POSITIONS: Record<string, { x: number; y: number }> = {
  brain: { x: 50, y: 8 },
  eyes: { x: 50, y: 12 },
  nose: { x: 50, y: 15 },
  throat: { x: 50, y: 20 },
  lungs: { x: 50, y: 35 },
  heart: { x: 50, y: 35 },
  liver: { x: 58, y: 42 },
  pancreas: { x: 42, y: 45 },
  stomach: { x: 48, y: 48 },
  kidneys: { x: 50, y: 52 },
  intestines: { x: 50, y: 60 },
  blood: { x: 50, y: 70 },
  immune: { x: 50, y: 75 },
  muscles: { x: 35, y: 50 },
  nerves: { x: 65, y: 55 },
  feet: { x: 50, y: 92 }
};

export const ORGAN_POSITIONS_3D: Record<string, { x: number; y: number; z: number }> = {
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
};