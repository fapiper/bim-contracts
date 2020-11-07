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
    },
    actors: [
      {
        type: String,
        required: true,
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
    return this.findById(id).exec();
  },
  async updateAnPopulate(id, update) {
    await this.findByIdAndUpdate(id, update);
    return this.findAndPopulate(id);
  },
  findByUserId(userId) {
    return this.find({ actors: userId }).exec();
  },
};

module.exports = mongoose.model('Project', ProjectSchema);
