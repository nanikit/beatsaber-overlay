# Beat saber overlay

Currently support only BeatSaberPlus_SongOverlay mod.

For use: https://nanikit-bs.pages.dev/

Demo: https://nanikit-bs.pages.dev/test/ui?query=0?ranked=true (click to switch)

Demo(Left layout):
https://nanikit-bs.pages.dev/test/ui?layout=left&query=13377,ca62,1e3ab,19172,30348

Demo(Beatsaver page 1):
[https://nanikit-bs.pages.dev/test/ui?query=0?](https://nanikit-bs.pages.dev/test/ui?query=0?)

Demo(CJK, Cyrillic test): https://nanikit-bs.pages.dev/test/ui?query=d2d2,33725,3307a,33750,32e6b

I made it for personal use so I can change design without notice. If you have any opinion just tell
me.

### Configuration

You can make variance by query parameters. (e.g:
https://nanikit-bs.pages.dev/test/ui?layout=left&hide=njs,bpm)

- `layout` (`left`, `right`): overall layout (default: `right`)
- `outline_color`: text outline color (default: `black`)
- `letter_color`: text fill color (default: `white`)
- `hide`: hide some info (default: none)
  - `njs`: note jump speed
  - `bpm`: beats per minute
  - `id`: beatmap id
  - `time`: time progress
  - `acc`: current accuracy
