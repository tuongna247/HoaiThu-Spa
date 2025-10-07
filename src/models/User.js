const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId && !this.facebookId;
    },
    minlength: 6
  },
  // OAuth provider information
  googleId: {
    type: String,
    sparse: true
  },
  facebookId: {
    type: String,
    sparse: true
  },
  provider: {
    type: String,
    enum: ['local', 'google', 'facebook'],
    default: 'local'
  },
  profilePicture: {
    type: String,
    default: ''
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: [
      'admin',           // Master Admin - full system access
      'country_admin',   // Country Admin - regional management
      'supplier',        // Supplier - manage tours/activities 
      'supervisor',      // Supervisor - manage supplier users
      'accountant',      // Accountant - financial access
      'mod',            // Moderator - legacy role
      'customer'        // End user - book activities
    ],
    default: 'customer'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  // Basic profile fields
  phone: {
    type: String,
    trim: true
  },
  locale: {
    type: String,
    default: 'en',
    enum: ['en', 'vi', 'zh', 'ko', 'ja', 'th']
  },
  country_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Country'
  },
  // Role-specific permissions
  permissions: [{
    type: String,
    enum: [
      'manage_users', 'manage_tours', 'manage_bookings', 'manage_finances',
      'view_analytics', 'approve_suppliers', 'manage_countries', 'system_admin'
    ]
  }]
}, {
  timestamps: true
});

// Indexes are automatically created by unique: true and sparse: true properties above

// Hash password before saving (only for local auth)
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
UserSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);