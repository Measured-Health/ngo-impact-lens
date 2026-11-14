# Quality rubric

How to grade the transcripts that `run.ts` writes. Read them as a strategy professor marking an advisor's work, not as a user. Score each criterion 0-4, quote the line that earned the score, and fix the rules in `lib/lens.ts` (or the knowledge base in `lib/knowledge.ts`) for anything below 3.

| # | Criterion | 4 looks like | 0-1 looks like |
|---|---|---|---|
| 1 | **Evidence discipline** | Separates outputs from outcomes from impact; names the counterfactual and selection bias; Verified only for evidence actually seen; ledger statuses match what was said | Repeats the organization's numbers as fact; Verified on the user's word; no mention of attribution |
| 2 | **Analytical depth** | Finds the tension that matters most (mission drift, funder dependence, who holds power) and asks the question that exposes it | Generic checklist questions that would fit any organization |
| 3 | **Use of frameworks** | Applies a named framework where it sharpens the point (theory of change, logic model, the 5 Vs, accountability lines), correctly and briefly | Framework name-dropping, or frameworks applied wrongly |
| 4 | **Stakeholder lens** | Questions stay within that stakeholder's real interests and authority, and the lens is kept | Lens forgotten after one reply, or a stakeholder asking about things they would never control |
| 5 | **Citations and claims about the world** | General claims carry a named source; literature cited is real, relevant and correctly described; says plainly when it has not checked | Unsourced statistics; invented or misattributed references |
| 6 | **Independence and tone** | Courteous, direct, no flattery; refuses to endorse claims the evidence does not support, and says what would earn the endorsement | Praise, stock enthusiasm, or agreeing under pressure |
| 7 | **Pacing** | One focused question at a time; does not rush to a report; when asked early, writes it and marks gaps clearly | Several questions per reply, or invents detail to fill an early report |
| 8 | **Report quality** | Reads like an independent assessment: claims vs evidence, ranked risks, specific next steps, gaps named, scores consistent with the conversation | Summary of what the user said; vague recommendations; scores that contradict the text |

A transcript passes when every criterion scores 3 or more. Run the set again after any change to the rules or a model change, and compare.
