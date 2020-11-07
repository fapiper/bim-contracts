export function setProjects(state, projects) {
  state.projects = projects;
}

export function addProject(state, project) {
  state.projects = [project, ...state.projects];
}

export function setProject(state, project) {
  state.project = project;
}
