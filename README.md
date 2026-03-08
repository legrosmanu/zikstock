# Zikstock

Zikstock is a platform to help musicians to play music.  

How can Zikstock do this?  
Zikstock allows you to store the musical resources you need to learn a new song, decide which song to play with your friends, and so on.

A musical resource is a Web link to a tablature, a tutorial, ba acktracking,... , all you need to play music alone or together.  
You'll be able to group them as a song, and the songs as a songbook.

## Testing

### Firebase Emulator Setup

The integration tests require the Firestore Emulator to run locally. This allows you to test Firestore operations without connecting to a real Firebase project.

There are two ways to run the emulator: using Docker (recommended for simplicity) or installing it manually.

#### Option 1: Using Docker (Recommended)

1. **Start the Firestore Emulator via Docker Compose:**

   ```bash
   docker compose up -d
   ```

   The emulator will automatically run on `localhost:8080`.

#### Option 2: Manual Installation

1. **Install Firebase CLI globally:**

   ```bash
   npm install -g firebase-tools
   ```

2. **Start the Firestore Emulator:**

   ```bash
   firebase emulators:start --only firestore
   ```

   The emulator will typically run on `localhost:8080`.


2. **In a separate terminal, run the tests:**

   ```bash
   cd backend
   pnpm test
   ```

   The test environment variables (including `FIRESTORE_EMULATOR_HOST`) are automatically loaded from `.env.test`.
