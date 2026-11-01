// Code-rendered flow diagrams: boxes, arrows, labels in plain HTML.
// Colour and type come from the page's CSS custom properties (assets/flow.css),
// so a theme or font change restyles every diagram with no redraw.
//
// A flow is a list of steps. A step can carry `side`: a branch that leaves the main
// line (a failure path, a review queue), drawn as a dashed box off that step.
(function () {
  const FLOWS = {
    madmadhouse: {
      title: "MADMADHOUSE pipeline",
      steps: [
        { label: "Instagram", note: "53 flyer posts, captions with no year" },
        { label: "Harvest", note: "A browser session writes every post to a schema" },
        { label: "Validator", note: "Reconciles each post against the account's count", side: "Any mismatch stops the run" },
        { label: "Dates", note: "Decoded from each post's shortcode" },
        { label: "Flyer data", note: "Venue, date, lineup, each with a confidence", side: "Low confidence goes to human review" },
        { label: "madmadhouse.com", note: "Archive and booking CV, computed from the data" },
      ],
    },
  };

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  window.renderFlow = function (el, name) {
    const f = FLOWS[name];
    if (!el || !f) return;
    el.outerHTML = `
      <figure class="flow" role="group" aria-label="${esc(f.title)}">
        <ol class="flow-steps">
          ${f.steps.map((s, i) => `
          <li class="flow-step">
            <div class="flow-node">
              <span class="flow-k">${String(i + 1).padStart(2, '0')}</span>
              <span class="flow-label">${esc(s.label)}</span>
              <span class="flow-note">${esc(s.note)}</span>
            </div>
            ${s.side ? `<div class="flow-side"><span class="visually-hidden">Branch: </span>${esc(s.side)}</div>` : ''}
          </li>`).join('')}
        </ol>
      </figure>`;
  };
  window.FLOWS = FLOWS;
})();
