"use strict";
exports.__esModule = true;
var shell = require("shelljs");
// shell.cp("-R", "src/public/index.html", "dist/public/index.html")
// shell.cp("-R", "src/public/static", "dist/public/")
shell.cp("-R", "src/config", "dist/");
shell.cp("-R", "src/public", "dist/");
