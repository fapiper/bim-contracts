const User = require('models/user.model');
const Project = require('models/project.model');
const helpers = require('util/helpers');

const { handle, handleErr } = helpers.handlers('User', 'users');
const id = helpers.id;

/**
 * Get user
 */
function get(req, res, next) {
  User.findById(id(req))
    .exec()
    .then((user) => handle(req, res, user))
    .catch((err) => handleErr(next, err, 'get(' + id(req) + ')'));
}

/**
 * Create new user
 */
function create(req, res, next) {
  const user = new User(req.body);
  console.log('got user', user);
  user
    .save()
    .then((savedUser) => res.json(savedUser))
    .catch((err) => handleErr(next, err, 'post()'));
}

/**
 * Update existing user
 */
function update(req, res, next) {
  User.findByIdAndUpdate(id(req), req.body, { new: true })
    .exec()
    .then((user) => handle(req, res, user))
    .catch((err) => handleErr(next, err, 'put(' + id(req) + ')'));
}

/**
 * Get user list
 */
function list(req, res, next) {
  const { limit = '0', skip = '0', address } = req.query;
  User.list({ limit, skip, address })
    .then((users) => res.json(users))
    .catch((err) => handleErr(next, err, 'getAll()'));
}

/**
 * Delete user
 */
function remove(req, res, next) {
  User.findByIdAndRemove(id(req))
    .exec()
    .then((user) => handle(req, res, user))
    .catch((err) => handleErr(next, err, 'put(' + id(req) + ')'));
}

/**
 * Get user projects
 */
function getUserProjects(req, res, next) {
  Project.findByUserId(id(req))
    .then((projects) => res.json(projects))
    .catch((err) => handleErr(next, err, 'getUserProjects(' + id(req) + ')'));
}

module.exports = { get, create, update, list, remove, getUserProjects };
