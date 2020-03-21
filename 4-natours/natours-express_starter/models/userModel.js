/* eslint-disable no-console */
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User must have a name']
    },
    email: {
      type: String,
      required: [true, 'User must have a email'],
      unique: true,
      lowercase: true, // transform to lowercase
      validate: [validator.isEmail, 'User must have a valid email']
    },
    photo: String, // location of the file
    role: {
      type: String,
      enum: ['user', 'guide', 'lead-guide', 'admin'],
      default: 'user'
    },
    password: {
      type: String,
      required: [true, 'User must have a password'],
      minlength: 8,
      select: false
    },
    passwordConfirm: {
      type: String,
      required: [true, 'User must confirm password'],
      validate: {
        // this validation works only works on create & save, not with update
        validator: function(el) {
          // "el" is refered to the current "passwordConfirm" value
          return el === this.password;
        },
        message: 'Passwords are not the same!',
        select: false
      }
    },
    passwordChangedAt: Date,
    passwordRestToken: String,
    passwordResetExpires: Date
  },
  {
    // enabling virtuals to show in the model
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// crypting password, just before it is been saved to DB
userSchema.pre('save', async function(next) {
  // "this" refers to the current document
  if (!this.isModified('password')) return next(); // password is not encrypted when it is not modified/created

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined; // this only needs to validation hence no need to save it

  next();
});

// instance method
userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  //this.password does not work as it is specified as select: false, hence need to send as an argument
  return await bcrypt.compare(candidatePassword, userPassword);
};

// instance method to check & return if pwd is been changed (against a sent time+date)
userSchema.methods.changePasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    //"JWTTimestamp" comes in milliseconds, hence converting the DB value
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    //console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp;
  }

  return false;
};

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  // token will be saved with encryption
  this.passwordRestToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordRestToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  // un-encrypted token will be sent for the email delivery
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
