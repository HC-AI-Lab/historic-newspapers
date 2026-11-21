// ===== BACKEND / STORAGE CONFIG (swap here, UI unchanged) =====
// Each paper's PDFs live on Google Drive. The viewer builds:
//   <base>/<driveId>
// When we move to the 400 GB project account (or another host),
// change `base` (and/or `type`) here — nothing else needs to change.
window.STORAGE = {
  type: "gdrive",
  // Google Drive "anyone with link" fetch URL pattern.
  // Must be drive.usercontent.google.com: it sends CORS headers
  // (access-control-allow-origin: *). drive.google.com/uc returns 403
  // to browser fetch() calls (requests carrying an Origin header).
  base: "https://drive.usercontent.google.com/download?export=download&id=",
  // Alternate (if the above is blocked on Workspace domains):
  // base: "https://www.googleapis.com/drive/v3/files/ID?alt=media"
};
