### soundcloud-downloader
clone the project and run:
```sh
npm install
```
copy ur favorates song's link from soundcloud in favorates.json and:
```sh
node index.js
```
----
u can change directories to save songs and thumbnails in:
```javascript
const musicDir = `${require('os').homedir()}/Music`;
const thumbnailsDir = `${musicDir}/thumbnails`;
```
