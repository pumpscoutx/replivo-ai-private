import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  name: string;
  password?: string;
  googleId?: string;
  avatar?: string;
  isEmailVerified: boolean;
  authProvider: 'local' | 'google' | 'both';
  lastLoginAt: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  toJSON(): any;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(email: string) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      },
      message: 'Please provide a valid email address'
    }
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  password: {
    type: String,
    required: function() {
      // Password is required only if authProvider is 'local' or 'both'
      return this.authProvider === 'local' || this.authProvider === 'both';
    },
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default
  },
  googleId: {
    type: String,
    sparse: true, // Allow multiple null values
    index: true
  },
  avatar: {
    type: String,
    validate: {
      validator: function(url: string) {
        if (!url) return true; // Allow empty
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      },
      message: 'Please provide a valid avatar URL'
    }
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  authProvider: {
    type: String,
    enum: ['local', 'google', 'both'],
    default: 'local'
  },
  lastLoginAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { 
    transform: function(doc, ret) {
      delete ret.password;
      return ret;
    }
  }
});

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ authProvider: 1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash password if it's modified
  if (!this.isModified('password')) return next();

  try {
    // Hash password with salt rounds of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password!, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Pre-save middleware to update authProvider
userSchema.pre('save', function(next) {
  if (this.password && this.googleId) {
    this.authProvider = 'both';
  } else if (this.googleId) {
    this.authProvider = 'google';
  } else if (this.password) {
    this.authProvider = 'local';
  }
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

// Static method to find user by email or Google ID
userSchema.statics.findByEmailOrGoogleId = function(email: string, googleId?: string) {
  const query: any = { email };
  if (googleId) {
    query.$or = [{ email }, { googleId }];
  }
  return this.findOne(query);
};

// Static method to create user from Google profile
userSchema.statics.createFromGoogle = function(googleProfile: any) {
  return this.create({
    email: googleProfile.emails[0].value,
    name: googleProfile.displayName,
    googleId: googleProfile.id,
    avatar: googleProfile.photos?.[0]?.value,
    isEmailVerified: true,
    authProvider: 'google',
    lastLoginAt: new Date()
  });
};

// Virtual for user display name
userSchema.virtual('displayName').get(function() {
  return this.name || this.email.split('@')[0];
});

// Virtual for user initials
userSchema.virtual('initials').get(function() {
  if (!this.name) return this.email.charAt(0).toUpperCase();
  return this.name
    .split(' ')
    .map((n: string) => n.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
});

// Method to link Google account to existing local account
userSchema.methods.linkGoogleAccount = function(googleId: string, googleProfile: any) {
  this.googleId = googleId;
  if (googleProfile.photos?.[0]?.value) {
    this.avatar = googleProfile.photos[0].value;
  }
  this.authProvider = 'both';
  this.isEmailVerified = true;
  return this.save();
};

// Method to unlink Google account
userSchema.methods.unlinkGoogleAccount = function() {
  this.googleId = undefined;
  if (this.authProvider === 'both') {
    this.authProvider = 'local';
  } else if (this.authProvider === 'google') {
    throw new Error('Cannot unlink Google account if it\'s the only authentication method');
  }
  return this.save();
};

// Method to update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLoginAt = new Date();
  return this.save();
};

// Method to check if user can use password authentication
userSchema.methods.canUsePassword = function(): boolean {
  return this.authProvider === 'local' || this.authProvider === 'both';
};

// Method to check if user can use Google authentication
userSchema.methods.canUseGoogle = function(): boolean {
  return this.authProvider === 'google' || this.authProvider === 'both';
};

// Static method to get user statistics
userSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        googleUsers: { $sum: { $cond: [{ $in: ['$authProvider', ['google', 'both']] }, 1, 0] } },
        localUsers: { $sum: { $cond: [{ $in: ['$authProvider', ['local', 'both']] }, 1, 0] } },
        verifiedUsers: { $sum: { $cond: ['$isEmailVerified', 1, 0] } }
      }
    }
  ]);
};

export const User = mongoose.model<IUser>('User', userSchema); 