const Project = require('@server/models/project.model');
const helpers = require('@server/util/helpers');

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
function update(req, res, next) {
  Project.findByIdAndUpdate(id(req), req.body, { new: true })
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

module.exports = { get, create, update, list, remove };
