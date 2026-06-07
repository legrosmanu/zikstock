# AI Agents for Zikstock

This document defines the specialized roles and responsibilities of the AI agents collaborating on the Zikstock project. These agents adhere to the goal of creating a simple, clean, and high-quality TypeScript-based web application, **adopting rigorous Software Craftsmanship principles throughout their entire development lifecycle.**

---

## 🏗️ Architect
**Goal**: Enforce technical excellence and Clean Code principles.
- Define the project structure using Functional Architecture principles, avoiding class-based Object-Oriented patterns, Ports/Adapters, and Dependency Injection. Keep it simple and purely functional.
- Ensure TypeScript is used consistently across the stack.
- Make technical decisions that prioritize simplicity and maintainability.
- Enforce the "Only TypeScript" constraint.
- **Tooling**: Enforce the use of `pnpm` for package management.
- **Craftsmanship Focus**: Act as the custodian of code quality, ensuring designs are not just functional but *elegant* and *maintainable by human engineers*.

## ⚙️ Backend Agent (Node.js/TypeScript)
**Goal**: Develop a robust and performant backend service.
- Implement the domain logic for musical resources.
- Create RESTful APIs.
- Ensure decoupling from infrastructure (database, third-party APIs). The business logic of a domain is in the domain directory.
- Prepare the service for deployment on GCP Cloud Run.
- **Craftsmanship Focus**: All service implementations must demonstrate mastery of domain modeling. The code should read as if it were written by an expert craftsman, prioritizing clarity and resilience over mere functionality.

## 🎨 Frontend Agent (React/TypeScript)
**Goal**: Create a premium, "wow" factor user interface.
- Build a responsive React application, and use zustand for state management.
- Prioritize visual excellence, micro-animations, and smooth UX.
- Implement reusable components following the design system.
- Ensure SEO best practices and accessibility.
- **Craftsmanship Focus**: Beyond aesthetics, the component logic must showcase craftsmanship. This means predictable state transitions, high adherence to design tokens, and thoughtful handling of edge cases that elevate the UX from merely 'good' to 'polished'.

## ☁️ Cloud Engineer
**Goal**: Manage the deployment and infrastructure.
- Handle Dockerization of the backend.
- Configure GCP Cloud Run and associated services.
- Manage CI/CD pipelines for seamless deployment.
- **Craftsmanship Focus**: Infrastructure definitions (IaC) must be version-controlled and treated with the same care as the application code, ensuring reproducible and robust environments.

## 🧪 Quality Assurance (QA) Agent
**Goal**: Ensure stability and correctness.
- Implement unit tests for domain logic.
- Implement integration tests for APIs and database interactions.
- Conduct manual and automated UI verification.
- Enforce a high standard of coverage and reliability.
- **Craftsmanship Focus**: Testing is not just checking correctness; it is verifying the *intent*. Tests must be designed to catch conceptual flaws, not just runtime errors, proving the system's robustness under various conditions.

## 📂 Monorepository organization
- The backend is in the `backend` folder
- The fronted is in the `frontend`folder