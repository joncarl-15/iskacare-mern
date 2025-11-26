# Iska-Care MERN Migration

This project is a migration of the Iska-Care application to the MERN stack (MongoDB, Express, React, Node.js).

## Structure

- `client`: React frontend (Vite)
- `server`: Express backend

## Prerequisites

- Node.js installed
- MongoDB installed and running locally (or update `server/.env` with your MongoDB URI)

## Setup & Run

### Server

1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm run dev
   ```
   The server will run on `http://localhost:5000`.

### Client

1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The client will run on `http://localhost:5173`.

## Features

- **Modern Minimalist UI**: Clean white design with red accents.
- **Responsive Design**: Works on desktop and mobile.
- **Role-Based Access**: Switch between User and Staff login.
- **User Registration Restriction**: "Not Available yet" message for new user sign-ups.
- **Hero Section**: "Your Physical Health Matters" with Nurse Information.
