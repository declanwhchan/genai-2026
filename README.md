# PathoQuery
PathoQuery is an AI-powered platform that visualizes the progression of diseases through the human body, which we designed in hopes of educating the general public about how diseases spread and affect different body parts.

## 🔍 Overview
PathoQuery allows users to simply prompt its system with a known disease (e.g. COVID-19 or Influenza) or symptoms and circumstances in natural language, and the app generates an interactive map on the human body, locating where the diseases are most prevalent, and provides a stage-by-stage visualization for how a disease progresses. The RAG system built with watsonx.ai is trained on journal articles published on PubMed to provide reliable and scientifically-evident information for viral infections. For diseases out of the scope of trained data, the model returns LLM-generated information while citing and justifying the quality of the generated text. 

## 🛠️ Tech Stack
Frontend: React, Vite, three.js, Tailwind CSS
Backend: Flask, Python, IBM WatsonX, Entrez API

## 📊 Features
- **IBM watsonx.ai** integration for context-based RAG system to process user prompts and provide structured disease information
- **Interactive 3D visualization** of the human body with disease progression
- **Hoverable** 3D organs (embedded through 3D coordinates) with concise disease information
- **Stage-by-stage** disease progression visualization
- **Robust user interface** with intuitive navigation and search functionality (e.g. search for specific diseases or symptoms)

## 📝 Next steps
- **Implement 3D Visualizations:** Overcome our initial challenges by creating 3D animations of pathogen transmission and impact on a cellular/tissue level. 
- **Expand Disease Vector Database:** Include a much wider range of diseases, moving beyond viral infections.
- **Enhance User Interaction:** Add features that allow users to dive deeper into specific symptoms or body parts affected, helping deepen the user's understanding and intuition of the disease.

Authors: Declan, Sujay, Navneet, Jolie
