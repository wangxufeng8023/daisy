const shell = require('shelljs')

const dstPath = "../server/dist/public"

shell.cp("-R", "dist/index.html", dstPath)
shell.cp('-R', 'dist/static', dstPath)