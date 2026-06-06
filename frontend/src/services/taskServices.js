import axios from "axios";
// Falls back to relative path so nginx/ingress proxies /api/tasks → backend service
// REACT_APP_BACKEND_URL must be set at BUILD TIME (Docker --build-arg) to override
const apiUrl = process.env.REACT_APP_BACKEND_URL || "/api/tasks";

console.log(apiUrl)
export function getTasks() {
    return axios.get(apiUrl);
}

export function addTask(task) {
    return axios.post(apiUrl, task);
}

export function updateTask(id, task) {
    return axios.put(apiUrl + "/" + id, task);
}

export function deleteTask(id) {
    return axios.delete(apiUrl + "/" + id);
}
