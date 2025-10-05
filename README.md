# Vercel Mobile

An unofficial mobile client for Vercel. Manage your projects, monitor deployments, and configure your infrastructure from your phone.

## What it does

This app gives you full access to your Vercel account from iOS or Android. You can view projects, check deployment status, manage environment variables, configure DNS records, and pretty much everything else you'd do from the web dashboard.

## Getting started

You'll need a Vercel access token to sign in. Create one at [vercel.com/account/tokens](https://vercel.com/account/tokens) and paste it into the app when you first open it.

## Development

Clone the repo and install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm start
```

Run on a specific platform:

```bash
npm run ios
npm run android
```

## Features

- Project management and overview
- Real-time deployment monitoring
- Domain and DNS configuration
- Environment variable management
- Runtime logs
- Team switching
- Promote deployments to production
- Redeploy previous builds

## Tech stack

Built with React Native and Expo. Uses TypeScript throughout and connects directly to the Vercel REST API.

## Note

This is an unofficial project and isn't affiliated with Vercel. It's just a mobile interface for their public API.
