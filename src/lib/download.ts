function pad(value: number) {
  return String(value).padStart(2, "0");
}

const REVOKE_URL_TIMEOUT_MS = 100;

export function buildPostcardFilename(date = new Date()) {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());
  const second = pad(date.getSeconds());

  return `poetry-bgm-studio-${year}${month}${day}-${hour}${minute}${second}.wav`;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, REVOKE_URL_TIMEOUT_MS);
}
