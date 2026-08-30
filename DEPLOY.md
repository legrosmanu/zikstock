# Deployment Guide for Zikstock

This guide explains how to deploy the Zikstock application:
- **Backend API & Database**: Google Cloud Platform (GCP) using **Cloud Run** and **Firestore** (Native mode) in the `europe-west1` (Paris) region.
- **Frontend**: **Cloudflare Pages** (Global Edge CDN hosting with automatic Git deployments).

---

## 1. Prerequisites

1. Install the **[Google Cloud CLI](https://cloud.google.com/sdk/docs/install)**.
2. Sign up/login to the **[Google Cloud Console](https://console.cloud.google.com/)**.
3. Create a GCP Project (e.g. `zikstock-prod`) and make sure billing is enabled.
4. Create a free account on **[Cloudflare](https://dash.cloudflare.com/)**.

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
   - `https://zikstock.pages.dev` (Cloudflare Pages preview URL)
   - `https://zikstock.com` and `https://www.zikstock.com` (custom production domains)
7. Click **Create** and copy your **Client ID** (looks like `xxxxxx-xxxxxx.apps.googleusercontent.com`).

---

## 3. Initial GCP Setup (Backend & Database)

Run the following commands in your terminal to authenticate and prepare your GCP environment:

```bash
# 1. Login to your Google Cloud Account
gcloud auth login

# 2. Configure Docker authentication for Artifact Registry in europe-west1
gcloud auth configure-docker europe-west1-docker.pkg.dev

# 3. Set your project context
gcloud config set project [YOUR_PROJECT_ID]

# 4. Enable required Google Cloud APIs
gcloud services enable \
    run.googleapis.com \
    artifactregistry.googleapis.com \
    firestore.googleapis.com
```

### Database Setup (Firestore)
Create the Firestore database in **Native mode** inside the `europe-west1` region:

```bash
gcloud firestore databases create --location=europe-west1 --type=firestore-native
```

### Artifact Registry Setup
Create a repository to store the backend Docker images:

```bash
gcloud artifacts repositories create zikstock-repo \
    --repository-format=docker \
    --location=europe-west1 \
    --description="Zikstock Docker Images"
```

---

## 4. Backend Deployment (Cloud Run)

### Manual Deployment via CLI
1. Build & Push Backend image:
   ```bash
   gcloud builds submit backend \
       --tag europe-west1-docker.pkg.dev/[YOUR_PROJECT_ID]/zikstock-repo/backend:latest
   ```

2. Deploy the backend container to Cloud Run:
   ```bash
   gcloud run deploy zikstock-backend \
       --image europe-west1-docker.pkg.dev/[YOUR_PROJECT_ID]/zikstock-repo/backend:latest \
       --platform managed \
       --region europe-west1 \
       --allow-unauthenticated \
       --set-env-vars GCLOUD_PROJECT=[YOUR_PROJECT_ID],GOOGLE_CLIENT_ID=[YOUR_GOOGLE_CLIENT_ID],FRONTEND_URL="https://zikstock.pages.dev,https://zikstock.com,https://www.zikstock.com"
   ```

3. Note the Backend Service URL output (e.g., `https://zikstock-backend-xxxxxx-ew.a.run.app`).

### Automatic Deployment via GitHub Actions
A GitHub Actions workflow is provided in `.github/workflows/deploy.yml` which deploys the backend container to Cloud Run on manual dispatch or release.

---

## 5. Frontend Deployment (Cloudflare Pages)

1. In the **Cloudflare Dashboard**, navigate to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
2. Connect your GitHub repository `zikstock`.
3. Configure the build settings:
   - **Framework preset**: `Vite`
   - **Root directory**: `frontend`
   - **Build command**: `pnpm build`
   - **Build output directory**: `dist`
4. Add the following **Environment variables**:
   - `NODE_VERSION`: `20` (or `22`)
   - `VITE_API_URL`: Your backend URL (e.g. `https://zikstock-backend-xxxxxx-ew.a.run.app` or `https://api.zikstock.com`)
   - `VITE_GOOGLE_CLIENT_ID`: Your Google OAuth Client ID
5. Click **Save and Deploy**. Cloudflare Pages will automatically rebuild and deploy the frontend on every commit pushed to `main`.

---

## 6. Custom Domain & DNS Configuration

1. In Cloudflare, add your domain `zikstock.com`.
2. Update your domain's Nameservers at your registrar (e.g. OVH) to point to Cloudflare's assigned nameservers.
3. In your Cloudflare Pages project, go to **Custom domains** > **Set up a custom domain** and add `zikstock.com` and `www.zikstock.com`.
4. (Optional) For the backend API (`api.zikstock.com`), create a CNAME record in Cloudflare DNS pointing to your Cloud Run hostname and configure an Origin Rule to rewrite the Host header.
