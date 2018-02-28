start /MIN mongod --dbpath E:\usr\local\mongodb-win32-x86_64-2008plus-ssl-3.6.1\data\db
start /D server /MIN node-dev dist/server.js
start /D client /MIN npm run dev


