const mongoose = require('mongoose');

const SupplierUserSchema = new mongoose.Schema({
  supplier_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['owner', 'manager', 'staff', 'guide'],
    required: true
  },
  permissions: [{
    type: String,
    enum: [
      'manage_products', 'view_products', 'manage_bookings', 'view_bookings',
      'manage_schedules', 'view_analytics', 'manage_team', 'view_finances'
    ]
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'pending'
  },
  invited_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  invited_at: {
    type: Date,
    default: Date.now
  },
  joined_at: Date
}, {
  timestamps: true
});

// Composite unique index to prevent duplicate user-supplier relationships
SupplierUserSchema.index({ supplier_id: 1, user_id: 1 }, { unique: true });
SupplierUserSchema.index({ user_id: 1 });
SupplierUserSchema.index({ status: 1 });

// Helper method to get user's supplier roles
SupplierUserSchema.statics.getUserSupplierRoles = async function(userId) {
  return await this.find({ user_id: userId, status: 'active' })
    .populate('supplier_id', 'company_info.name status')
    .exec();
};

// Helper method to get supplier team members
SupplierUserSchema.statics.getSupplierTeam = async function(supplierId) {
  return await this.find({ supplier_id: supplierId })
    .populate('user_id', 'name email role isActive')
    .exec();
};

module.exports = mongoose.models.SupplierUser || mongoose.model('SupplierUser', SupplierUserSchema);