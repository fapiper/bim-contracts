const Project = require('models/project.model');
const User = require('models/user.model');

const helpers = require('util/helpers');

const { handle, handleErr } = helpers.handlers('Project', 'projects');
const id = helpers.id;

/**
 * Get project
 */
function get(req, res, next) {
  Project.findAndPopulate(id(req))
    .then((project) => handle(req, res, project))
    .catch((err) => handleErr(next, err, 'get(' + id(req) + ')'));
}

/**
 * Create new project
 */
function create(req, res, next) {
  const project = new Project(req.body);

  project
    .save()
    .then((savedProject) => res.json(savedProject))
    .catch((err) => handleErr(next, err, 'post()'));
}

/**
 * Update existing project
 */
function update(req, res, next, isNew = true) {
  Project.findByIdAndUpdate(id(req), req.body, { new: isNew })
    .exec()
    .then((project) => handle(req, res, project))
    .catch((err) => handleErr(next, err, 'put(' + id(req) + ')'));
}

/**
 * Get project list
 */
function list(req, res, next) {
  const { limit = '0', skip = '0' } = req.query;
  Project.list({ limit, skip })
    .then((projects) => res.json(projects))
    .catch((err) => handleErr(next, err, 'getAll()'));
}

/**
 * Delete project
 */
function remove(req, res, next) {
  Project.findByIdAndRemove(id(req))
    .exec()
    .then((project) => handle(req, res, project))
    .catch((err) => handleErr(next, err, 'put(' + id(req) + ')'));
}

/**
 * Add actors to existing project
 */
async function addActor(req, res, next) {
  const userId = req.body.actorId || '';
  const exists = await User.exists({ _id: userId });
  if (exists) {
    return Project.updateAnPopulate(id(req), { $addToSet: { actors: userId } })
      .then((project) => handle(req, res, project))
      .catch((err) =>
        handleErr(next, err, 'addActor(' + userId + ', ' + id(req) + ')')
      );
  } else {
    return handleErr(
      next,
      'User not exists',
      'addActor(' + id(req) + ', ' + userId + ')'
    );
  }
}

module.exports = { get, create, update, list, remove, addActor };
