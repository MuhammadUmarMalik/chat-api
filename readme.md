# Chat API

A real-time chat application backend built with Express.js, Socket.IO, and Prisma ORM.

## Features

- User authentication with JWT
- Real-time messaging with Socket.IO
- RESTful API endpoints for chat functionality
- MySQL database integration via Prisma ORM

## Technologies

- Node.js
- Express.js
- Socket.IO
- Prisma ORM
- MySQL
- JWT Authentication

## Getting Started

### Prerequisites

- Node.js (latest LTS version)
- MySQL database

### Installation

1. Clone the repository
   ```
   git clone <repository-url>
   cd chat-api
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   DATABASE_URL="mysql://username:password@localhost:3306/chat_db"
   JWT_SECRET="your-jwt-secret"
   ```

4. Set up the database with Prisma
   ```
   npx prisma migrate dev
   ```

5. Start the development server
   ```
   npm run dev
   ```

## API Endpoints

- `GET /` - Health check
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- Chat endpoints available at `/chat` routes

## Websocket Events

The application uses Socket.IO for real-time messaging functionality.
