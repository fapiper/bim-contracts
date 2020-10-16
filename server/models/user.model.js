const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * User schema
 */
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: 'User name is required',
      unique: true,
      minlength: [
        5,
        'The value of path `{PATH}` (`{VALUE}`) is shorter than the minimum allowed length ({MINLENGTH})',
      ],
      validate: [validateName, 'Please supply a valid user name'],
    },
    address: {
      type: String,
      trim: true,
      required: 'Address is required',
      unique: true,
    },
    iban: {
      type: String,
      trim: true,
      required: 'Iban is required',
    },
  },
  { timestamps: true }
);

function validateName(name) {
  // we just require the user name begins with a letter (only for demomstration purposes ...)
  var re = /^[A-Z,a-z].*$/;
  return re.test(name);
}

/**
 * Statics
 */
UserSchema.statics = {
  /**
   * List users in ascending order of 'name'
   */
  list({ skip = '0', limit = '0', address } = {}) {
    return this.find(address ? { address } : {})
      .sort({ name: 1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .exec();
  },
};

module.exports = mongoose.model('User', UserSchema);
