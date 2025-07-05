import isItLocal from "./js/utils/is-it-local/isItLocal.js";

document.title = isItLocal(window.location.hostname) ? '(local) ' + document.title : document.title;