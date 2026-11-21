// ===== BACKEND / STORAGE CONFIG (swap here, UI unchanged) =====
// Each paper's PDFs live on Google Drive ("anyone with the link" = viewer).
// The viewer embeds Drive's own PDF viewer in an iframe, built from `preview`;
// the Download button opens `download`. `{id}` is replaced by the Drive file ID.
//
// Why an iframe and not fetch() + pdf.js: Google Drive returns 403 to every
// cross-site browser fetch (Sec-Fetch-Site: cross-site), on both
// drive.google.com/uc and drive.usercontent.google.com. Embedding its viewer works.
// To use our own pdf.js reader later, switch to the Drive API v3
// (https://www.googleapis.com/drive/v3/files/{id}?alt=media&key=<referrer-restricted key>).
//
// When we move to the 400 GB project account (or another host),
// change the patterns here; nothing else needs to change.
window.STORAGE = {
  type: "gdrive-embed",
  preview: "https://drive.google.com/file/d/{id}/preview",
  download: "https://drive.google.com/uc?export=download&id={id}",
};
