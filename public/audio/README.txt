SHORT AUDIO PREVIEWS (20-30 seconds each)

Name each file after the song id in src/data/catalog.js, plus "-preview.mp3":
  pyem-tye-preview.mp3
  million-dollars-preview.mp3
  prayer-preview.mp3
  my-love-preview.mp3
  mood-preview.mp3
  for-you-preview.mp3
  imara-preview.mp3

A preview player with a waveform appears automatically wherever its file exists. No file = no player, nothing breaks.
To add more songs, add the song id to `previewIds` in src/data/siteContent.js.

Cut a clip from a full song (needs ffmpeg, free from ffmpeg.org). Starts at 0:45, lasts 25 seconds, fades in and out:
  ffmpeg -i full-song.mp3 -ss 45 -t 25 -b:a 96k -af "afade=t=in:d=1,afade=t=out:st=24:d=1" pyem-tye-preview.mp3

Each clip should be about 300 KB. Only use previews of songs Eddy owns or has permission to share.
