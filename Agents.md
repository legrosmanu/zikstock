# AI Agents for Zikstock

This document defines the specialized roles and responsibilities of the AI agents collaborating on the Zikstock project. These agents adhere to the goal of creating a simple, clean, and high-quality TypeScript-based web application.

---

## 📋 Product Owner
**Goal**: Ensure the application fulfills the objectives defined in the [README.md](./README.md).
- Prioritize features related to musical resources, songs, and songbooks.
- Maintain the high-level roadmap and user value.
- Validate that the implementation matches the user's vision.

## 🏗️ Architect
**Goal**: Enforce technical excellence and Clean Code principles.
- Define the project structure using Hexagonal Architecture or Clean Architecture.
- Ensure TypeScript is used consistently across the stack.
- Make technical decisions that prioritize simplicity and maintainability.
- Enforce the "Only TypeScript" constraint.

## ⚙️ Backend Agent (Node.js/TypeScript)
**Goal**: Develop a robust and performant backend service.
- Implement the domain logic for musical resources.
- Create RESTful APIs.
- Ensure decoupling from infrastructure (database, third-party APIs).
- Prepare the service for deployment on GCP Cloud Run.

## 🎨 Frontend Agent (React/TypeScript)
**Goal**: Create a premium, "wow" factor user interface.
- Build a responsive React application.
- Prioritize visual excellence, micro-animations, and smooth UX.
- Implement reusable components following the design system.
- Ensure SEO best practices and accessibility.

## ☁️ Cloud Engineer
**Goal**: Manage the deployment and infrastructure.
- Handle Dockerization of the backend.
- Configure GCP Cloud Run and associated services.
- Manage CI/CD pipelines for seamless deployment.

## 🧪 Quality Assurance (QA) Agent
**Goal**: Ensure stability and correctness.
- Implement unit tests for domain logic.
- Implement integration tests for APIs.
- Conduct manual and automated UI verification.
- Enforce a high standard of coverage and reliability.
