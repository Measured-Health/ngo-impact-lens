"use client";

import { AREAS, CLAIM_STATUSES, type AreaScore, type Claim, type ClaimStatus } from "@/lib/lens";

// Scorecard and claims ledger. The scorecard uses one hue in two labelled columns
// (evidence, alignment): orange against green fails colour-blind separation, so
// identity comes from position and headings, never colour.

export const STATUS_LABEL: Record<ClaimStatus, string> = {
  verified: "Verified", partial: "Partly supported", untested: "Not yet tested", unsupported: "Unsupported", contradicted: "Contradicted",
};
const STATUS_ICON: Record<ClaimStatus, string> = { verified: "✓", partial: "◐", untested: "○", unsupported: "!", contradicted: "✕" };

export function StatusPill({ status }: { status: ClaimStatus }) {
  return <span className={"st st-" + status}><span aria-hidden="true">{STATUS_ICON[status]}</span>{STATUS_LABEL[status]}</span>;
}

function Bar({ value, label }: { value: number; label: string }) {
  return (
    <div className="sc-bar" role="img" aria-label={`${label} ${value} of 4`} title={`${label}: ${value} of 4`}>
      <span className="sc-track"><span className="sc-fill" style={{ width: `${(value / 4) * 100}%` }} /></span>
      <b>{value}</b>
    </div>
  );
}

export function Scorecard({ scores }: { scores: Record<string, AreaScore> }) {
  const scored = AREAS.filter((_, i) => scores[i + 1]).length;
  return (
    <section className="scorecard">
      <h2>Scorecard</h2>
      <p className="sc-sub">{scored} of {AREAS.length} areas scored. Evidence: 0 none, 1 anecdote, 2 own monitoring data, 3 systematic data with a comparison, 4 independent evaluation. Alignment: 0 contradicts the mission, 4 fully consistent.</p>
      <table>
        <thead><tr><th>Area</th><th>Evidence</th><th>Alignment</th></tr></thead>
        <tbody>
          {AREAS.map((a, i) => {
            const s = scores[i + 1];
            return (
              <tr key={a}>
                <td><span className="sc-area">{i + 1}. {a}</span>{s?.note ? <span className="sc-note">{s.note}</span> : null}</td>
                {s ? <><td><Bar value={s.evidence} label="Evidence" /></td><td><Bar value={s.alignment} label="Alignment" /></td></>
                  : <td colSpan={2} className="sc-none">Not examined yet: a gap</td>}
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

export function LedgerCounts({ claims }: { claims: Claim[] }) {
  return (
    <ul className="ledger-counts">
      {CLAIM_STATUSES.map((st) => {
        const n = claims.filter((c) => c.status === st).length;
        return n ? <li key={st}><StatusPill status={st} /><b>{n}</b></li> : null;
      })}
    </ul>
  );
}

/** Compact list for the sidebar; full table for the report annex. */
export function Ledger({ claims, full = false }: { claims: Claim[]; full?: boolean }) {
  if (!claims.length) return <p className="ledger-empty">No claims logged yet. As the organization makes claims about its reach, results, costs or causes, the advisor logs them here and tests them.</p>;
  if (!full) {
    return (
      <ol className="ledger">
        {claims.map((c) => (
          <li key={c.id}>
            <div className="lg-top"><b>{c.id}</b><StatusPill status={c.status} /></div>
            <p>{c.text}</p>
            {c.evidence ? <small>{c.evidence}</small> : null}
          </li>
        ))}
      </ol>
    );
  }
  return (
    <section className="ledger-annex">
      <h2>Claims ledger</h2>
      <div className="tbl">
        <table>
          <thead><tr><th>Id</th><th>Claim</th><th>Area</th><th>Status</th><th>Evidence or gap</th><th>Source</th></tr></thead>
          <tbody>
            {claims.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td><td>{c.text}</td><td>{c.area ? `${c.area}. ${AREAS[c.area - 1]}` : ""}</td>
                <td><StatusPill status={c.status} /></td><td>{c.evidence}</td><td>{c.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/** Tiny evidence/alignment marks for an area row in the sidebar. */
export function AreaMarks({ score }: { score?: AreaScore }) {
  if (!score) return null;
  return (
    <span className="area-marks" title={`Evidence ${score.evidence}/4, alignment ${score.alignment}/4. ${score.note}`}>
      E{score.evidence} A{score.alignment}
    </span>
  );
}
