"use client";

import { useState } from "react";
import { GLOSSARY } from "@/lib/glossary";

// Searchable glossary of the field's terms, so people can check a word mid-conversation.
export function Glossary() {
  const [q, setQ] = useState("");
  const t = q.trim().toLowerCase();
  const hits = t ? GLOSSARY.filter((g) => g.term.toLowerCase().includes(t) || g.definition.toLowerCase().includes(t)) : GLOSSARY;
  return (
    <section className="glossary">
      <h2 className="side-title">Glossary</h2>
      <p className="side-sub">The words used in this field, and the ones they are most often confused with.</p>
      <input className="gl-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a term, e.g. outcome" aria-label="Find a term" />
      <dl>
        {hits.map((g) => (
          <div key={g.term} className="gl-item">
            <dt>{g.term}</dt>
            <dd>{g.definition}{g.confusedWith ? <span className="gl-conf">Not the same as: {g.confusedWith}</span> : null}</dd>
          </div>
        ))}
      </dl>
      {hits.length === 0 ? <p className="ledger-empty">No term matches. Ask the advisor what it means.</p> : null}
    </section>
  );
}
