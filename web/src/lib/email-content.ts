export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);
}

export function emailContent(title: string, body: string, url: string, label: string, unsubscribe?: string) {
  const text = `${title}\n\n${body}\n\n${label}: ${url}${unsubscribe ? `\n\nDisiscriviti: ${unsubscribe}` : ""}`;
  const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:32px;background:#111;color:#f8f8f8"><p style="letter-spacing:4px">JACOPO PECA</p><h1>${escapeHtml(title)}</h1><p style="line-height:1.7;white-space:pre-line">${escapeHtml(body)}</p><p><a style="display:inline-block;background:#fff;color:#111;padding:14px 22px" href="${escapeHtml(url)}">${escapeHtml(label)}</a></p><p style="font-size:12px;color:#aaa">Denim artigianale · Montesilvano · Italia</p>${unsubscribe ? `<p><a style="color:#aaa" href="${escapeHtml(unsubscribe)}">Disiscriviti dalla newsletter</a></p>` : ""}</div>`;
  return { text, html };
}
