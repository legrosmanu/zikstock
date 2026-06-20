# GCP Deployment Guide for Zikstock

This guide explains how to deploy the Zikstock application (Backend + Frontend) to Google Cloud Platform (GCP) using **Cloud Run** and **Firestore** (Native mode) in the `europe-west9` (Paris) region.

---

## 1. Prerequisites

1. Install the **[Google Cloud CLI](https://cloud.google.com/sdk/docs/install)**.
2. Sign up/login to the **[Google Cloud Console](https://console.cloud.google.com/)**.
3. Create a GCP Project (e.g. `zikstock-prod`) and make sure billing is enabled.

---

## 2. Obtain your Google Client ID

Zikstock uses Google Sign-In, which requires an OAuth client ID:
1. Open the GCP Console and navigate to **APIs & Services** > **Credentials**.
2. If you haven't configured the consent screen yet, click **Configure Consent Screen**, choose **External**, fill in the application details, and save.
3. Click **Create Credentials** > **OAuth client ID**.
4. Select Application Type: **Web application**.
5. Name it (e.g., `Zikstock Web`).
6. Add the following to **Authorized JavaScript origins**:
   - `http://localhost:5173` (for local development)
   - Your frontend URL (once deployed; you can update this list later in the console).
7. Click **Create** and copy your **Client ID** (looks like `xxxxxx-xxxxxx.apps.googleusercontent.com`).

---

## 3. Initial GCP Setup

Run the following commands in your terminal to authenticate and prepare your environment:

```bash
# 1. Login to your Google Cloud Account
gcloud auth login

# 2. Configure Docker authentication for Artifact Registry in europe-west9
gcloud auth configure-docker europe-west9-docker.pkg.dev

# 3. Set your project context
gcloud config set project [YOUR_PROJECT_ID]

# 4. Enable required Google Cloud APIs
gcloud services enable \
    run.googleapis.com \
    artifactregistry.googleapis.com \
    firestore.googleapis.com
```

---

## 4. Database Setup (Firestore)

Create the Firestore database in **Native mode** inside the `europe-west9` region:

```bash
gcloud firestore databases create --location=europe-west9 --type=firestore-native
```

---

## 5. Deployment Steps

### Step A: Create an Artifact Registry Repository
Create a repository to store the Docker images for the frontend and backend:

```bash
gcloud artifacts repositories create zikstock-repo \
    --repository-format=docker \
    --location=europe-west9 \
    --description="Zikstock Docker Images"
```

### Step B: Build & Deploy Backend to Cloud Run
1. Submit the backend build to GCP:
   ```bash
   gcloud builds submit backend \
       --tag europe-west9-docker.pkg.dev/[YOUR_PROJECT_ID]/zikstock-repo/backend:latest
   ```

2. Deploy the backend container to Cloud Run:
   Replace `[YOUR_GOOGLE_CLIENT_ID]` and `[YOUR_PROJECT_ID]` with your actual credentials:
   ```bash
   gcloud run deploy zikstock-backend \
       --image europe-west9-docker.pkg.dev/[YOUR_PROJECT_ID]/zikstock-repo/backend:latest \
       --platform managed \
       --region europe-west9 \
       --allow-unauthenticated \
       --set-env-vars GCLOUD_PROJECT=[YOUR_PROJECT_ID],GOOGLE_CLIENT_ID=[YOUR_GOOGLE_CLIENT_ID]
   ```

3. **Important**: Note the URL of the deployed backend (e.g., `https://zikstock-backend-xxxxxx-ew.a.run.app`) printed in the output. You need it for Step C.

### Step C: Build & Deploy Frontend to Cloud Run
1. Submit the frontend build, passing the Backend API URL and Google Client ID as build arguments so Vite can package them:
   ```bash
   gcloud builds submit frontend \
       --tag europe-west9-docker.pkg.dev/[YOUR_PROJECT_ID]/zikstock-repo/frontend:latest \
       --build-arg VITE_API_URL=[YOUR_BACKEND_URL] \
       --build-arg VITE_GOOGLE_CLIENT_ID=[YOUR_GOOGLE_CLIENT_ID]
   ```

2. Deploy the frontend container to Cloud Run:
   ```bash
   gcloud run deploy zikstock-frontend \
       --image europe-west9-docker.pkg.dev/[YOUR_PROJECT_ID]/zikstock-repo/frontend:latest \
       --platform managed \
       --region europe-west9 \
       --allow-unauthenticated
   ```

Your app is now live! The console will print the URL of the frontend deployment.

---

## 6. Post-Deployment Settings

Go back to **APIs & Services** > **Credentials** in the GCP Console, edit your OAuth 2.0 Client ID, and add your frontend's deployed Cloud Run URL to the list of **Authorized JavaScript origins** so Google Sign-In functions correctly in production.
