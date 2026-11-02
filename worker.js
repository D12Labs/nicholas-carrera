// Media byte ranges. Workers Static Assets answers every request with the whole file (200),
// so a video can only seek inside what has already downloaded. For /public/media/* (see
// run_worker_first in wrangler.jsonc) this answers Range requests with 206 and just the slice.
export default {
  async fetch(request, env) {
    const res = await env.ASSETS.fetch(request);
    const m = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get('Range') || '');
    if (!m || res.status !== 200 || !res.body) return res;

    // The assets binding may stream without a length; then buffer once to learn the size.
    let body = res.body, size = Number(res.headers.get('Content-Length'));
    if (!size) {
      const buf = await res.arrayBuffer();
      size = buf.byteLength;
      body = new Blob([buf]).stream();
    }
    let start = m[1] === '' ? size - Number(m[2]) : Number(m[1]);
    let end = m[1] === '' || m[2] === '' ? size - 1 : Math.min(Number(m[2]), size - 1);
    if (start < 0) start = 0;
    if (start > end || start >= size) {
      return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
    }

    const headers = new Headers(res.headers);
    headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
    headers.set('Content-Length', String(end - start + 1));
    headers.set('Accept-Ranges', 'bytes');
    return new Response(slice(body, start, end), { status: 206, headers });
  },
};

// Stream bytes start..end (inclusive) out of a body without buffering the whole file.
function slice(body, start, end) {
  let pos = 0;
  return body.pipeThrough(new TransformStream({
    transform(chunk, ctl) {
      const from = Math.max(start - pos, 0), to = Math.min(end + 1 - pos, chunk.byteLength);
      if (from < to) ctl.enqueue(chunk.subarray(from, to));
      pos += chunk.byteLength;
      if (pos > end) ctl.terminate();
    },
  }));
}
