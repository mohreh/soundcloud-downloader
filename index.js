const SoundCloud = require('soundcloud-scraper');
const fs = require('fs');
const request = require('request');
const nodeId3 = require('node-id3');

const client = new SoundCloud.Client();
const musicDir = `${require('os').homedir()}/Music`;
const thumbnailsDir = `${musicDir}/thumbnails`;
if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir);
}

const downloadThumbnail = async (uri, filename, callback) => {
  return new Promise((resolve, _reject) => {
    request.head(uri, function (err, _res, _body) {
      if (err) {
        console.error(err);
      }

      request(uri)
        .pipe(fs.createWriteStream(`${thumbnailsDir}/${filename}`))
        .on('finish', callback)
        .on('close', resolve);
    });
  });
};

const downloadLink = async (link, next) => {
  const song = await client.getSongInfo(link);

  const format = (song.thumbnail || '').split('.').slice(-1)[0];
  if (
    song.thumbnail &&
    !fs.existsSync(`${thumbnailsDir}/${song.title}.${format}`)
  ) {
    await downloadThumbnail(song.thumbnail, `${song.title}.${format}`, () => {
      console.log(`Thumbnail For: \t ${song.title} \t downloaded`);
    });
  }

  const tags = {
    title: song.title || '',
    artist: song.author.name || '',
    album: song.genre || '',
  };

  if (fs.existsSync(`${musicDir}/${song.title}.mp3`)) {
    console.log(`Already existed:\t${song.title} - Moving to next`);
    next();
  } else {
    const stream = await song.downloadProgressive();
    const writer = stream.pipe(
      fs.createWriteStream(`${musicDir}/${song.title}.mp3`),
    );
    writer.on('finish', () => {
      let writeTag = nodeId3.write(tags, `${musicDir}/${song.title}.mp3`);
      console.log(
        `Finished writing:\t${song.title} - Moving to next - Tag Writed: ${writeTag}`,
      );
      next();
    });
  }
};

(async () => {
  const favorates = JSON.parse(fs.readFileSync('favorates.json'));
  console.log(favorates.length);

  let i = -1;
  const next = async () => {
    i++;
    if (i < favorates.length) {
      console.log('################################################');
      await downloadLink(favorates[i], next);
    }
  };
  await next();
})();
