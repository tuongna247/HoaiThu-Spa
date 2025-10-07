// MongoDB initialization script
// This script runs when the MongoDB container is first created

db = db.getSiblingDB('leetour');

// Create collections
db.createCollection('users');
db.createCollection('tours');
db.createCollection('bookings');
db.createCollection('suppliers');
db.createCollection('categories');
db.createCollection('cities');
db.createCollection('countries');

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.tours.createIndex({ title: 'text', description: 'text' });
db.bookings.createIndex({ userId: 1 });
db.bookings.createIndex({ tourId: 1 });

print('Database initialization completed successfully!');
