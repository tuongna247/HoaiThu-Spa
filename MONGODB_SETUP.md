# MongoDB Local Setup Guide

This guide will help you set up a local MongoDB database using Docker.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)

## Quick Start

### 1. Start MongoDB

Run the following command in the project root directory:

```bash
docker-compose up -d
```

This will start:
- **MongoDB** on port `27017`
- **Mongo Express** (Web UI) on port `8081`

### 2. Verify MongoDB is Running

```bash
docker-compose ps
```

You should see both `leetour-mongodb` and `leetour-mongo-express` containers running.

### 3. Access MongoDB

**Option A: Using Mongo Express (Web UI)**
- Open browser: http://localhost:8081
- No authentication required (disabled for local development)

**Option B: Using MongoDB Compass**
- Connection string: `mongodb://leetour:leetour123@localhost:27017/leetour?authSource=admin`

**Option C: Using MongoDB Shell**
```bash
docker exec -it leetour-mongodb mongosh -u leetour -p leetour123 --authenticationDatabase admin
```

## Configuration

### MongoDB Credentials
- **Username**: `leetour`
- **Password**: `leetour123`
- **Database**: `leetour`
- **Port**: `27017`

### Environment Variables

The `.env` file is already configured to use local MongoDB:

```
MONGODB_URI=mongodb://leetour:leetour123@localhost:27017/leetour?authSource=admin
```

## Common Commands

### Stop MongoDB
```bash
docker-compose down
```

### Stop and Remove Data (⚠️ This will delete all data)
```bash
docker-compose down -v
```

### View MongoDB Logs
```bash
docker-compose logs -f mongodb
```

### Restart MongoDB
```bash
docker-compose restart mongodb
```

## Database Initialization

The database is automatically initialized with the following collections:
- `users`
- `tours`
- `bookings`
- `suppliers`
- `categories`
- `cities`
- `countries`

Indexes are also created automatically for performance optimization.

## Switching Between Local and Cloud MongoDB

### Use Local MongoDB (Development)
In `.env`, uncomment the local URI:
```
MONGODB_URI=mongodb://leetour:leetour123@localhost:27017/leetour?authSource=admin
```

### Use Cloud MongoDB Atlas (Production)
In `.env`, comment out local URI and uncomment cloud URI:
```
# MONGODB_URI=mongodb://leetour:leetour123@localhost:27017/leetour?authSource=admin
MONGODB_URI=mongodb+srv://leetour:RN1vmYdHHjnTwEqM@cluster0.nz7bupo.mongodb.net/leetour?retryWrites=true&w=majority&appName=Cluster0
```

## Troubleshooting

### Port 27017 Already in Use
If you have another MongoDB instance running:
```bash
# Windows
netstat -ano | findstr :27017
taskkill /PID <PID> /F

# Stop the conflicting service
net stop MongoDB
```

### Container Won't Start
```bash
# Check logs
docker-compose logs mongodb

# Remove and recreate
docker-compose down
docker-compose up -d
```

### Can't Connect from Application
1. Ensure MongoDB container is running: `docker-compose ps`
2. Check `.env` file has correct `MONGODB_URI`
3. Restart your Next.js application

## Data Persistence

MongoDB data is persisted in a Docker volume named `mongodb_data`. This means your data will survive container restarts unless you explicitly remove the volume with `docker-compose down -v`.

## Security Note

⚠️ **These credentials are for local development only!**

Never use these credentials in production. For production:
1. Use strong, unique passwords
2. Use MongoDB Atlas or a secured MongoDB instance
3. Enable authentication and SSL/TLS
4. Use environment-specific `.env` files
