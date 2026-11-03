/**
 * Builds the test execution report from Playwright's JSON report.
 *   Input:  reports/json/results.json
 *   Output: reports/email-report.html                    (email body)
 *           reports/Oncquest_Test_Execution_Report.pdf   (email attachment)
 * On GitHub Actions it also writes the email subject to $GITHUB_OUTPUT.
 *
 * Usage: node scripts/email-report.js
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

const root = path.join(__dirname, '..');
const inputFile = path.join(root, 'reports/json/results.json');
const htmlFile = path.join(root, 'reports/email-report.html');
const pdfFile = path.join(root, 'reports/Oncquest_Test_Execution_Report.pdf');

const baseUrl = process.env.BASE_URL || 'https://oncquestlabs.com';
const report = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

// ---------- Collect one row per test per project ----------
const rows = [];
function walk(suite, file, describes) {
  for (const spec of suite.specs || []) {
    for (const test of spec.tests) {
      const last = test.results[test.results.length - 1] || {};
      // Titles look like "TC_HOME_001 - Home page loads @smoke" or "[TC_POP_01] Verify ... @regression"
      const match = spec.title.match(/^\[?(TC_[A-Z0-9_]+)\]?\s*-?\s*(.*)$/);
      rows.push({
        file,
        // Innermost named describe block, e.g. "2. Top Contact Bar & Utility Controls"
        module: describes.filter(Boolean).pop() || 'General',
        id: match ? match[1] : '—',
        scenario: (match ? match[2] : spec.title).replace(/\s*@\w+/g, '').trim(),
        project: test.projectName,
        status: test.status, // expected | unexpected | flaky | skipped
        duration: test.results.reduce((sum, r) => sum + (r.duration || 0), 0),
        error: (last.error && last.error.message) || '',
      });
    }
  }
  for (const child of suite.suites || []) walk(child, file, [...describes, child.title]);
}
report.suites.forEach((s) => walk(s, s.file, []));

if (rows.length === 0) {
  console.error(`No test results in ${path.relative(root, inputFile)} - run the tests first (without --reporter or --list, which skip/overwrite it).`);
  process.exit(1);
}

const count = (status, list = rows) => list.filter((r) => r.status === status).length;
const passed = count('expected');
const failed = count('unexpected');
const flaky = count('flaky');
const skipped = count('skipped');
const total = rows.length;
const pct = (ok, all) => (all ? ((ok / all) * 100).toFixed(1) : '0.0');
const passRate = pct(passed + flaky, total - skipped);
const allPassed = failed === 0;

const started = new Date(report.stats.startTime);
const durationSec = Math.round(report.stats.duration / 1000);
const fmtMin = (ms) => `${(ms / 60000).toFixed(1)}m`;
const runDate = started.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
const projects = report.config.projects.map((p) => p.name).join(', ');
const workers = report.config.workers;

const runUrl = process.env.GITHUB_RUN_ID
  ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
  : '';
const executedBy = process.env.GITHUB_RUN_NUMBER ? `GitHub Actions (run #${process.env.GITHUB_RUN_NUMBER})` : 'Local run';

// ---------- Per spec file summary ----------
const files = [];
for (const r of rows) {
  let f = files.find((x) => x.file === r.file);
  if (!f) files.push((f = { file: r.file, rows: [] }));
  f.rows.push(r);
}
const suiteName = (file) => `${file.replace(/\.spec\.js$/, '').replace(/[.-]/g, ' ').toUpperCase()} Test Suite`;

// ---------- HTML helpers ----------
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const shortError = (msg) => esc(msg.replace(/\u001b\[[0-9;]*m/g, '').split('\n').filter(Boolean).slice(0, 3).join('\n'));

const badge = {
  expected: '<span class="badge pass">PASSED</span>',
  unexpected: '<span class="badge fail">FAILED</span>',
  flaky: '<span class="badge flaky">FLAKY</span><div class="badge-note">Passed on retry</div>',
  skipped: '<span class="badge skip">SKIPPED</span>',
};

const summaryRows = files.map((f, i) => {
  const t = f.rows.length;
  const p = count('expected', f.rows);
  const fl = count('flaky', f.rows);
  const fa = count('unexpected', f.rows);
  const sk = count('skipped', f.rows);
  const ms = f.rows.reduce((s, r) => s + r.duration, 0);
  const modules = [...new Set(f.rows.map((r) => r.module + (r.project === 'mobile-chrome' ? ' (Mobile)' : '')))].join(', ');
  return `
      <tr>
        <td class="c muted">${i + 1}</td>
        <td><code>tests/${esc(f.file)}</code></td>
        <td><b>${esc(suiteName(f.file))}</b><div class="muted small">${esc(modules)}</div></td>
        <td class="c"><b>${t}</b></td>
        <td class="c green"><b>${p}</b></td>
        <td class="c ${fa ? 'red' : ''}"><b>${fa}</b></td>
        <td class="c amber"><b>${fl}</b></td>
        <td class="c small">${fmtMin(ms)}<br><span class="muted">(${Math.round(ms / 1000)}s)</span></td>
        <td class="c ${fa ? 'red' : 'green'}"><b>${pct(p + fl, t - sk)}%</b></td>
      </tr>`;
}).join('');

const matrixRows = rows.map((r, i) => `
      <tr class="${r.status === 'unexpected' ? 'row-fail' : ''}">
        <td class="c muted">${i + 1}</td>
        <td class="id">[${esc(r.id)}]</td>
        <td><span class="chip mono">${esc(r.file)}</span></td>
        <td><span class="chip">${esc(r.module)}${r.project === 'mobile-chrome' ? ' (Mobile)' : ''}</span></td>
        <td><b>${esc(r.scenario)}</b>${r.error && r.status === 'unexpected' ? `<pre class="err">${shortError(r.error)}</pre>` : ''}</td>
        <td class="c">${badge[r.status] || esc(r.status)}</td>
        <td class="c mono small">${(r.duration / 1000).toFixed(1)}s</td>
      </tr>`).join('');

const note = [
  `All ${total} automated tests ran against the live production site (<code>${esc(baseUrl)}</code>).`,
  'Lead forms are only checked for validation and are never submitted, so no real enquiries or bookings are created.',
  'The third-party cookie consent banner is blocked during the run.',
  flaky ? `<b>${flaky} test${flaky > 1 ? 's' : ''} failed on the first attempt and passed on retry</b> - see the FLAKY rows below.` : '',
  failed ? `<b class="red">${failed} test${failed > 1 ? 's' : ''} failed</b> - error details are shown in the red rows below.` : '',
].filter(Boolean).join(' ');

const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>Oncquest Test Execution Report</title>
<style>
  body { margin:0; padding:20px 10px; background:#eef1f6; font-family:'Segoe UI',Arial,sans-serif; color:#1f2937; font-size:12px; }
  .page { max-width:980px; margin:0 auto; background:#fff; border:1px solid #d6dbe4; }
  .wrap { padding:20px 22px; }
  table { border-collapse:collapse; width:100%; }
  .hdr td { vertical-align:middle; }
  .hdr-left { background:#1e3a8a; color:#fff; padding:18px 20px; }
  .hdr-left h1 { margin:0; font-size:22px; letter-spacing:.5px; }
  .hdr-left div { font-size:12px; opacity:.85; margin-top:4px; }
  .hdr-right { background:#0f172a; color:#e5e7eb; padding:14px 18px; font-size:12px; line-height:1.6; width:42%; }
  .tiles td { border:1px solid #d6dbe4; text-align:center; padding:0; }
  .tiles .lbl { background:#f3f5f9; font-size:10px; font-weight:700; color:#374151; padding:6px 4px; text-transform:uppercase; }
  .tiles .val { font-size:20px; font-weight:800; padding:8px 4px; }
  .verdict { display:inline-block; padding:3px 10px; border-radius:4px; font-size:11px; font-weight:800; }
  .verdict.ok { background:#dcfce7; color:#166534; border:1px solid #86efac; }
  .verdict.bad { background:#fee2e2; color:#991b1b; border:1px solid #fca5a5; }
  .note { background:#eff6ff; border:1px solid #bfdbfe; border-radius:6px; padding:10px 12px; margin:14px 0 18px; font-size:11px; line-height:1.5; color:#1e3a8a; }
  h2 { font-size:14px; color:#1e3a8a; margin:18px 0 0; padding-bottom:5px; border-bottom:3px solid #1e3a8a; display:flex; justify-content:space-between; }
  h2 span { font-size:11px; }
  .grid th { background:#eef1f6; font-size:10px; text-transform:uppercase; color:#374151; padding:7px 6px; border:1px solid #d6dbe4; }
  .grid td { border:1px solid #d6dbe4; padding:6px; vertical-align:middle; }
  .grid tr { page-break-inside:avoid; }
  .grid tfoot td { background:#eef1f6; font-weight:800; }
  .c { text-align:center; }
  .muted { color:#6b7280; } .small { font-size:10px; }
  .green { color:#15803d; } .red { color:#b91c1c; } .amber { color:#b45309; }
  .mono, code { font-family:Consolas,'Courier New',monospace; font-size:11px; }
  .id { color:#1d4ed8; font-weight:700; font-family:Consolas,'Courier New',monospace; font-size:11px; white-space:nowrap; }
  .chip { display:inline-block; border:1px solid #cbd2dd; background:#f8fafc; border-radius:3px; padding:1px 6px; font-size:10px; color:#4b5563; }
  .badge { display:inline-block; padding:2px 7px; border-radius:4px; font-size:10px; font-weight:800; }
  .badge.pass { background:#dcfce7; color:#15803d; border:1px solid #86efac; }
  .badge.fail { background:#fee2e2; color:#b91c1c; border:1px solid #fca5a5; }
  .badge.flaky { background:#fef3c7; color:#b45309; border:1px solid #fcd34d; }
  .badge.skip { background:#f3f4f6; color:#6b7280; border:1px solid #d1d5db; }
  .badge-note { font-size:9px; color:#b45309; margin-top:2px; }
  .row-fail td { background:#fff5f5; }
  .err { margin:5px 0 0; padding:6px; background:#fef2f2; border-radius:4px; font-size:10px; white-space:pre-wrap; color:#7f1d1d; font-weight:400; }
  .sign td { border:1px solid #d6dbe4; padding:8px; }
  .sign td.k { font-weight:700; background:#f8fafc; width:18%; }
  .btn { display:inline-block; padding:9px 16px; background:#1e3a8a; color:#fff !important; text-decoration:none; border-radius:5px; font-weight:700; font-size:12px; }
  .foot { margin-top:14px; padding-top:8px; border-top:1px solid #d6dbe4; font-size:10px; color:#6b7280; display:flex; justify-content:space-between; }
  @media print {
    body { background:#fff; padding:0; }
    .page { border:none; max-width:none; }
    .wrap { padding:0; }
    .no-print { display:none; }
    * { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  }
</style></head>
<body><div class="page"><div class="wrap">

  <table class="hdr"><tr>
    <td class="hdr-left">
      <h1>ONCQUEST AUTOMATION TEST REPORT</h1>
      <div>Playwright Test Execution Report &bull; Complete Suite (${total} Tests)</div>
    </td>
    <td class="hdr-right">
      <b>Target System:</b> ${esc(baseUrl)}<br>
      <b>Execution Run:</b> ${esc(runDate)} IST<br>
      <b>Test Engine:</b> Playwright JavaScript (Chromium Headless) &bull; ${workers} Worker${workers > 1 ? 's' : ''}<br>
      <b>Total Duration:</b> ${fmtMin(report.stats.duration)} (${durationSec}s) &bull; ${files.length} Spec Suites &bull; ${esc(projects)}
    </td>
  </tr></table>

  <table class="tiles" style="margin-top:14px;"><tr>
    <td><div class="lbl">Total Tests</div><div class="val">${total}</div></td>
    <td><div class="lbl">Passed</div><div class="val green">${passed}</div></td>
    <td><div class="lbl">Failed</div><div class="val ${failed ? 'red' : ''}">${failed}</div></td>
    <td><div class="lbl">Flaky / Retry</div><div class="val amber">${flaky}</div></td>
    <td><div class="lbl">Skipped</div><div class="val muted">${skipped}</div></td>
    <td><div class="lbl">Pass Rate</div><div class="val ${allPassed ? 'green' : 'red'}">${passRate}%</div></td>
    <td><div class="lbl">Result</div><div class="val"><span class="verdict ${allPassed ? 'ok' : 'bad'}">${allPassed ? `ALL ${total} PASSED` : `${failed} FAILED`}</span></div></td>
  </tr></table>

  <div class="note"><b>Execution notes:</b> ${note}</div>

  <h2>1. EXECUTION SUMMARY BY SPEC FILE (${files.length} SPEC SUITES) <span class="${allPassed ? 'green' : 'red'}">${passRate}% PASS RATE</span></h2>
  <table class="grid">
    <thead><tr><th>#</th><th>Spec File</th><th>Module Name &amp; Scope</th><th>Total</th><th>Passed</th><th>Failed</th><th>Flaky</th><th>Duration</th><th>Pass %</th></tr></thead>
    <tbody>${summaryRows}</tbody>
    <tfoot><tr>
      <td colspan="3">SUITE TOTAL (ALL ${files.length} SPEC SUITES)</td>
      <td class="c">${total}</td><td class="c green">${passed}</td><td class="c ${failed ? 'red' : ''}">${failed}</td><td class="c amber">${flaky}</td>
      <td class="c">${fmtMin(report.stats.duration)}</td><td class="c ${allPassed ? 'green' : 'red'}">${passRate}%</td>
    </tr></tfoot>
  </table>

  <h2>2. TEST CASE TRACEABILITY MATRIX (${total} TEST CASES) <span>PLAYWRIGHT EXECUTION RESULTS</span></h2>
  <table class="grid">
    <thead><tr><th>#</th><th>Test Case ID</th><th>Spec File</th><th>Component / Module</th><th>Test Scenario &amp; Assertion Objective</th><th>Status</th><th>Time</th></tr></thead>
    <tbody>${matrixRows}</tbody>
  </table>

  <h2>3. QA SIGN-OFF <span class="${allPassed ? 'green' : 'red'}">${allPassed ? 'ALL TESTS PASSED' : 'ACTION REQUIRED'}</span></h2>
  <table class="sign">
    <tr><td class="k">Scope:</td><td>${total} automated E2E test cases (${files.length} spec suites)</td>
        <td class="k">Final Result:</td><td><span class="verdict ${allPassed ? 'ok' : 'bad'}">${passRate}% PASSED (${failed} FAILURE${failed === 1 ? '' : 'S'})</span></td></tr>
    <tr><td class="k">Executed By:</td><td>${esc(executedBy)}</td>
        <td class="k">Execution Run:</td><td>${esc(runDate)} IST (${fmtMin(report.stats.duration)})</td></tr>
    <tr><td class="k">Automation Engineer:</td><td>${esc(process.env.REPORT_ENGINEER || '[ Automation Engineer ]')}</td>
        <td class="k">QA Sign-off:</td><td>[ QA Sign-off ]</td></tr>
  </table>

  ${runUrl ? `<div class="no-print" style="margin-top:16px;"><a class="btn" href="${runUrl}">View run on GitHub</a>
    <span class="muted small" style="margin-left:8px;">Screenshots, videos and traces: download "playwright-html-report" from the run page.</span></div>` : ''}

  <div class="foot no-print"><span>Oncquest Automation Test Execution Report &bull; ${esc(baseUrl)}</span><span>Total: ${passed + flaky} / ${total - skipped} Tests Passed (${passRate}%)</span></div>

</div></div></body></html>`;

(async () => {
  fs.writeFileSync(htmlFile, html);

  // Same report as a PDF, with a running header/footer and page numbers
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'load' });
  await page.pdf({
    path: pdfFile,
    format: 'A4',
    printBackground: true,
    margin: { top: '40px', bottom: '40px', left: '28px', right: '28px' },
    displayHeaderFooter: true,
    headerTemplate: `<div style="font-size:8px;width:100%;padding:0 28px;text-align:right;color:#6b7280;">Oncquest Automation Test Execution Report &bull; ${total} Tests</div>`,
    footerTemplate: `<div style="font-size:8px;width:100%;padding:0 28px;display:flex;justify-content:space-between;color:#6b7280;">
      <span>Target: ${esc(baseUrl)} &bull; ${passed + flaky}/${total - skipped} Tests Passed (${passRate}%)</span>
      <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span></div>`,
  });
  await browser.close();

  const date = started.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
  const subject = `${allPassed ? '✅ PASSED' : '❌ FAILED'} - Oncquest Test Report: ${passed + flaky}/${total - skipped} passed${failed ? `, ${failed} failed` : ''} (${date})`;
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `subject=${subject}\n`);

  console.log(subject);
  console.log(`HTML report: ${path.relative(root, htmlFile)}`);
  console.log(`PDF report:  ${path.relative(root, pdfFile)}`);
})();
