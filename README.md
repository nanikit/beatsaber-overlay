# Beat saber overlay

Currently support only BeatSaberPlus_SongOverlay mod.

For use: https://nanikit-bs.pages.dev/

Demo: https://nanikit-bs.pages.dev/test/ui (click to switch)

Demo(Beatsaver page 1): [https://nanikit-bs.pages.dev/test/ui?query=0?](https://nanikit-bs.pages.dev/test/ui?query=0?)

Demo(Ranked songs): https://nanikit-bs.pages.dev/test/ui?query=0?ranked=true

Demo(Custom): https://nanikit-bs.pages.dev/test/ui?query=13377,ca62,28dfe,1e3ab,19172

I made it for personal use so I can change design without notice. If you have any opinion just tell me.

### Configuration

You can make variance by query parameters. (e.g: https://nanikit-bs.pages.dev/test/ui?layout=left&hide=njs,bpm)

- `layout` (`left`, `right`): overall layout (default: `right`)
- `hide`: hide some info (default: none)
  - `njs`: note jump speed
  - `bpm`: beats per minute
  - `id`: beatmap id
  - `time`: time progress
  - `acc`: current accuracy
