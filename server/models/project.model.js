const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Project schema
 */
const ProjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: [
        5,
        'The value of path `{PATH}` (`{VALUE}`) is shorter than the minimum allowed length ({MINLENGTH})',
      ],
    },
    actors: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

/**
 * Statics
 */
ProjectSchema.statics = {
  /**
   * List projects in ascending order of 'dueDate' timestamp (oldest ones first)
   */
  list({ skip = '0', limit = '0' } = {}) {
    return this.find()
      .sort({ name: 1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .exec();
  },
  findAndPopulate(id) {
    return this.findById(id).populate('actors').exec();
  },
  findByUserId(userId) {
    return this.find({ actors: userId }).populate('actors').exec();
  },
};

module.exports = mongoose.model('Project', ProjectSchema);
