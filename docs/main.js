import isItLocal from "./js/is-it-local/isItLocal.js";

document.title = isItLocal ? '(local) ' + document.title : document.title;