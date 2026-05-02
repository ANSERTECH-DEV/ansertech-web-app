# Ansertech Perú S.A.C. - B2B Quotation Optimization System

![Angular](https://img.shields.io/badge/Angular-16-DD0031?style=flat&logo=angular)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?style=flat&logo=spring)
![Google Cloud](https://img.shields.io/badge/GCP-Vertex_AI-4285F4?style=flat&logo=googlecloud)

## B2B Web Application

This project is a business-to-business (B2B) web application developed for internal and external enterprise operations at Ansertech Perú S.A.C. Its primary goal is to optimize the quotation process for goods and services within the highly demanding mining sector.

## Authors
- **Jorge Gerardo Quilla Luyo** - u20211b197@upc.edu.pe
- **Rony Piero Ticona Luque** - u201420422@upc.edu.pe

## Description
This application is designed to support business processes between companies, providing a scalable and maintainable web platform. By integrating advanced Artificial Intelligence models, the system reduces manual errors and significantly improves response times for B2B clients.

### Key Features
- **Automated RFQ Processing:** Extracts unstructured data from PDF requests (quotes, technical specifications) using Google Document AI.
- **Smart Spam Filtering:** Automatically classifies and filters incoming emails to prioritize valid business requests.
- **Intelligent Inventory Search:** Utilizes Text Embeddings and Vector Search to match requested items with the current stock contextually, not just by exact string matching.
- **Quotation Generation:** Generates structured, ready-to-review commercial proposals, minimizing human transcription.

## Technology Stack

### Frontend
- Angular 16
- TypeScript
- HTML5 / CSS3

### Backend & AI (Architecture)
- **Framework:** Java / Spring Boot
- **Database:** PostgreSQL
- **AI Platform:** Google Vertex AI
- **Deployment:** Google Cloud Platform

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or higher)
- [Angular CLI](https://angular.io/cli) (v16.x)
- Java 17+ (for backend services)
