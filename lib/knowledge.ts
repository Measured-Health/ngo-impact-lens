// Reference knowledge for the advisor: theory of change, logic models and logframes,
// systems thinking, systems change, NGO strategy frameworks, value proposition,
// concept notes, mapping methods and a glossary, each with coaching questions and
// sources. Researched 13 Nov 2026 and written in our own words; frameworks are
// credited to their authors and no passages are reproduced from the sources.
// Items marked "unverified" could not be checked against a primary source.
// lib/glossary.ts mirrors the Glossary section; a unit test keeps them in step.

export const KNOWLEDGE = String.raw`# NGO Strategy & Impact Lens: Knowledge Base

Compiled 13 Nov 2026 for an advisor that coaches by asking questions. Each concept has a short explanation, key elements, and coaching questions. Items marked "unverified" could not be confirmed against a primary source during research.

---

## 1. Theory of change, logic models and results

### 1.1 Theory of change (ToC)
A theory of change explains how and why a desired long-term change is expected to happen in a particular context. It is built by working backwards from a long-term outcome to the preconditions that must be in place, and it makes explicit the assumptions that link each step (Center for Theory of Change; Anderson/Aspen Roundtable 2005).

Key elements (ActKnowledge/Aspen model):
- **Long-term outcome (goal):** the ultimate change sought; realistic for the initiative to contribute to, not a vague vision.
- **Backwards mapping:** ask "what must be true before this can happen?" repeatedly to build a pathway of change (outcomes framework) of preconditions.
- **Preconditions / intermediate outcomes:** changes that are necessary (not just helpful) for the next level.
- **Assumptions:** beliefs about why each link holds and about the context; these are where a ToC usually breaks.
- **Rationale:** the evidence or reasoning behind each causal link.
- **Interventions:** what the organization (or others) does to bring about each precondition; placed only after the pathway is mapped.
- **Indicators:** how each outcome will be recognized, with population, target threshold and timeframe.
- **Quality test (Aspen):** a ToC should be **plausible** (logic and evidence make sense to stakeholders), **doable** (enough resources and capacity to carry it out), and **testable** (specific and measurable enough to track progress).

Common mistakes:
- Starting from current activities and justifying them forward, instead of mapping back from the outcome.
- Long-term outcome too broad ("end poverty") or not owned by anyone.
- Hidden assumptions; leaps between outputs and big outcomes ("miracle steps").
- Ignoring other actors and context factors; treating the diagram as a one-off funder deliverable.

Coaching questions:
- What is the one long-term change you want to be held to, and for whom, by when?
- What has to be true just before that change can happen? And before that?
- Which link in your pathway are you least sure about? What evidence supports it?

### 1.2 Logic models (W.K. Kellogg Foundation)
A logic model is a picture of how a program is meant to work: what it puts in, what it does, and what it expects to change as a result (approach popularized by the W.K. Kellogg Foundation's Logic Model Development Guide, 2004). It is read as a chain of "if...then" statements and splits into **planned work** (resources, activities) and **intended results** (outputs, outcomes, impact).

Key elements (Kellogg terms):
- **Resources / inputs:** the people, money, organizational assets and community assets the program can draw on.
- **Activities:** what the program actually does: services, events, tools and processes.
- **Outputs:** the direct, countable products of those activities, such as sessions run or people reached.
- **Outcomes:** changes in participants, such as what they know, can do, do differently, or their circumstances. Kellogg divides them into short-term (about 1 to 3 years) and long-term (about 4 to 6 years); many funders add an intermediate tier. (Timeframes as commonly cited from the guide; the PDF could not be opened to confirm, so treat them as unverified.)
- **Impact:** deeper, longer-term change, intended or not, in communities, organizations or systems (Kellogg cites about 7 to 10 years; unverified).

How to read it: "If we have these resources, then we can do these activities; if we do these, then we deliver these outputs; if so, participants benefit in these ways (outcomes), and then these longer changes (impact) may follow."

How to build one (Kellogg sequence, simplified):
1. Describe the problem and community needs and assets.
2. Write desired results first: impact, then long-term and short-term outcomes.
3. Name the activities that will produce those outcomes, citing evidence or best practice.
4. Specify outputs (measurable products and reach) for each activity.
5. List the resources needed and the influential factors (context).
6. Check each arrow with "if...then" and with stakeholders; then use it to choose evaluation questions and indicators.

Coaching questions:
- Read your model aloud as "if...then" sentences. Where does a sentence sound unconvincing?
- Which outcomes are changes in people, and which are really outputs in disguise?
- Is there any activity that does not lead to an outcome? Any outcome with no activity feeding it?

### 1.3 Logical framework (logframe)
A logframe is a management matrix, used by most bilateral and multilateral donors, that sets out the intervention logic, how each level will be measured and verified, and the external assumptions needed to move up a level (OECD-DAC glossary; EU Project Cycle Management Guidelines). It is usually a 4x4 table.

Rows (vertical logic, bottom to top):
- **Activities:** tasks to produce outputs. (The indicator column here often holds means/inputs and costs.)
- **Outputs (EU: results):** products and services the project delivers and controls.
- **Purpose / outcome (EU: specific objective):** the direct change the project aims to achieve for the target group.
- **Goal (EU: overall objective):** the higher-level change the project contributes to, alongside others.

Columns:
- **Narrative summary (intervention logic).**
- **Objectively verifiable indicators (OVIs):** measures, with targets, of achievement at each level.
- **Means (sources) of verification (MoV):** where and how indicator data will be obtained (surveys, records, reports) and at what cost.
- **Assumptions / risks:** external conditions outside the project's control that must hold for the next level to be reached.

Logic: if activities are done and assumptions at that level hold, outputs are delivered; if outputs and their assumptions hold, the purpose is achieved; and so on. "Killer assumptions" (very likely to fail and critical) mean the design should change.

Coaching questions:
- What single change for the target group is your purpose? Is there only one?
- For each indicator, where exactly will the data come from, and who pays to collect it?
- Which assumptions are you quietly relying on? How likely are they, and can you influence any of them?

### 1.4 SMART indicators
An indicator is something you can observe or count that tells you whether a change is happening (see the OECD-DAC glossary for the formal definition). SMART is a common quality check for indicators and objectives (originating in Doran, 1981, with later variants).
- **Specific:** clear about what, who and where.
- **Measurable:** quantifiable or verifiable, with a baseline and target.
- **Achievable (attainable):** realistic given resources and context.
- **Relevant:** actually reflects the result it is meant to track.
- **Time-bound:** has a date or period.
Variants exist ("Realistic", "Assignable"). For qualitative and participatory indicators, Roche's SPICED (subjective, participatory, interpreted, cross-checked, empowering, diverse) is often used as a complement.

Coaching questions:
- What is the baseline value today, and what is the target, by when?
- Would two different people measure this indicator and get the same answer?
- Does the indicator measure the change, or only your activity?

### 1.5 Logic model vs logframe vs theory of change
- **Theory of change:** explains why and how change happens in a context, mapped backwards from a long-term outcome, including preconditions others must deliver and explicit assumptions and rationale. Broad, explanatory, often nonlinear; useful for strategy.
- **Logic model:** describes what one program does and expects (resources to impact) in a linear chain. Descriptive; useful for program planning, communication and evaluation design. Often shows little about why links hold.
- **Logframe:** a donor-oriented management and accountability matrix that adds indicators, means of verification and assumptions at each level. Tight, contractual; useful for monitoring and reporting.
Results chain levels (inputs, activities, outputs, outcomes, impact) are defined in the Glossary. A practical sequence: build the ToC first, select the part your organization owns, express it as a logic model, then translate it into a logframe if a funder requires one.

Common mistakes across all three:
- **Outputs written as outcomes** ("200 farmers trained" is an output; "farmers adopt improved practices" is an outcome).
- **Missing or trivial assumptions** ("funding continues", "no war") while the real causal assumptions (for example "trained farmers can afford inputs") are left out.
- **Activities without links**: activities that lead nowhere, or outcomes no activity feeds.
- Jumping from outputs to impact; indicators that count activity not change; no baseline; never revisited after the proposal.

Coaching questions:
- Which of the three tools do you have today, and which decision does each one serve?
- Where does your logframe purpose come from in your theory of change?
- Pick one outcome: is it a change in people, institutions or conditions, or something you delivered?

### 1.6 Attribution, contribution and the counterfactual
**Attribution** asks how much of an observed change was caused by the intervention, usually by comparing with a **counterfactual** (what would have happened without it), estimated through randomized or quasi-experimental designs. **Contribution** asks whether the intervention plausibly made a difference among several causes, which suits complex settings where a control group is impossible.

Coaching questions:
- What would have happened to these people without you?
- Who else was working on the same problem at the same time?
- Is a comparison group realistic for you, or is a credible contribution story more appropriate?

### 1.7 Contribution analysis (Mayne)
A theory-based approach that builds a credible "contribution story" by testing a ToC against evidence and alternative explanations, rather than proving attribution statistically (Mayne 2008, ILAC Brief 16).

Six steps:
1. Set out the cause-effect issue to be addressed.
2. Develop the postulated theory of change and risks to it (including other influencing factors).
3. Gather the existing evidence on the theory of change.
4. Assemble and assess the contribution story and challenges to it.
5. Seek out additional evidence.
6. Revise and strengthen the contribution story (iterate 4 to 6).

Coaching questions:
- What is the specific result you want to explain your role in?
- What are the rival explanations for that result?
- Which links in your story have the weakest evidence today?

### 1.8 Outcome harvesting (Wilson-Grau)
An evaluation approach that works backwards from observed change: it collects ("harvests") evidence of what changed (outcomes), then determines whether and how the intervention contributed. It suits advocacy, networks and complex programs where outcomes are not predictable in advance. An outcome is a change in the behavior, relationships, actions, policies or practices of a social actor.

Six steps (Wilson-Grau and Britt, Ford Foundation 2012):
1. Design the harvest (users, uses, questions).
2. Review documentation and draft outcome descriptions.
3. Engage with informants (change agents) to refine and add outcomes.
4. Substantiate a sample of outcomes with independent knowledgeable people.
5. Analyze and interpret.
6. Support use of findings.

Coaching questions:
- In the last year, who started doing something differently because of your work?
- How do you know? Who outside your team could confirm it?
- Which surprising or unintended changes have you seen?

---

## 2. Systems thinking

### 2.1 Core concepts (Meadows, "Thinking in Systems")
In Meadows' account, a system is a group of connected parts that together do something; how it behaves comes mainly from how it is put together, not from individual events.
- **Stocks:** accumulations you can count at a point in time (trained nurses, trust, funds in reserve, children out of school).
- **Flows:** rates that change stocks (hiring and attrition; enrollment and dropout).
- **Feedback loops:** a change in a stock affects flows into or out of that same stock. **Reinforcing** loops amplify (growth or collapse); **balancing** loops seek a goal and resist change.
- **Delays:** time between action and effect; a major source of oscillation and overreaction.
- **Boundaries:** what you include in the model depends on the question; no "true" boundary exists.

Coaching questions:
- What is the key stock in your problem? What fills it and what drains it?
- Are you working on the inflow or the outflow? Which is cheaper to change?
- Where are the long delays between your action and visible results?

### 2.2 Causal loop diagrams (CLDs)
A CLD shows variables connected by arrows with polarity, revealing feedback loops.
Notation:
- Arrow from cause to effect. **"+" (or "s")**: variables move in the same direction. **"-" (or "o")**: opposite direction.
- Loop label: **R** (reinforcing) if the number of "-" links is even (including zero); **B** (balancing) if odd.
- Double hash marks (//) on an arrow mark a significant delay.
- Variables are nouns that can go up or down ("staff morale", not "improve morale").

Building one, step by step:
1. Pick a problem behavior over time (a trend graph, not a single event).
2. List key variables, named neutrally as quantities.
3. Draw causal links and assign polarity, one link at a time.
4. Close loops; label each R or B; mark delays.
5. Tell the story of each loop aloud to check it makes sense.
6. Test with stakeholders and data; look for leverage and unintended effects.

Coaching questions:
- What trend over time worries you most? Can you sketch it?
- If X goes up, what happens to Y? Always, or with a delay?
- Which loop is driving growth in your program, and which loop will eventually slow it?

### 2.3 Iceberg model
A tool to move from reacting to events toward changing what produces them.
- **Events:** what happened (a clinic stockout).
- **Patterns / trends:** what has been happening over time (stockouts every rainy season).
- **Structures:** what causes the pattern (supply chain, policies, incentives, physical layout, feedback loops).
- **Mental models:** beliefs and assumptions that keep the structure in place ("rural clinics are low priority").
Leverage generally increases as you go deeper.

Coaching questions:
- Which event triggered this conversation? Has it happened before?
- What pattern do you see if you look back three to five years?
- What structures (rules, incentives, flows of money or information) produce that pattern?

### 2.4 System archetypes (Senge, "The Fifth Discipline")
Recurring structures with predictable behavior. NGO-relevant ones:
- **Fixes that fail:** a quick fix relieves a symptom but triggers delayed side effects that worsen the problem. *Example:* free food distribution undercuts local farmers' prices, deepening food insecurity next season.
- **Shifting the burden:** a symptomatic solution weakens the capacity for a fundamental solution, often creating dependency. *Example:* an NGO runs village schools, so the government never budgets for teachers there.
- **Limits to growth:** a reinforcing growth process hits a balancing constraint. *Example:* a successful program scales until supervision capacity or community trust runs out and quality drops.
- **Success to the successful:** two activities compete for limited resources; early winners get more, losers get less. *Example:* donors fund large, visible INGOs with strong reporting, starving local organizations of the capacity they need to compete.
- **Tragedy of the commons:** individuals each use a shared resource for their own gain until it collapses. *Example:* many NGOs survey the same communities, causing respondent fatigue; or agencies poach the same scarce local health workers.

Coaching questions:
- Has a solution you used before come back to bite you? What was the delay?
- Is your service making it easier for someone else to avoid their responsibility?
- What will slow your growth before it slows by itself? Can you address it now?

### 2.5 Meadows' 12 leverage points (least to most effective, as numbered by Meadows 1999)
12. Numbers and parameters, such as subsidy levels, fees or standards.
11. The size of buffers: reserves that cushion the system against shocks.
10. The physical layout of stocks and flows, such as infrastructure and networks.
9. How long delays are compared with how fast the system changes.
8. How strong the balancing loops are that keep the system in check.
7. How strongly the reinforcing loops drive growth or decline.
6. Who has access to which information.
5. The rules: incentives, penalties and constraints.
4. The ability of the system to reorganize and change its own structure.
3. The goals the system is pursuing.
2. The underlying mindset or paradigm the system grows from.
1. The ability to step outside any single paradigm.

Note: most NGO budgets go to level 12 (more money, more units); Meadows argued such parameters rarely change system behavior.

Coaching questions:
- Which leverage level is most of your work at today?
- Who lacks information that would change their behavior if they had it (level 6)?
- Which rule or incentive, if changed, would make your program unnecessary?

### 2.6 The Water of Systems Change (Kania, Kramer, Senge; FSG 2018)
Systems change means shifting the conditions that hold a problem in place. Six conditions on three levels:
- **Structural change (explicit):** policies; practices; resource flows.
- **Relational change (semi-explicit):** relationships and connections; power dynamics.
- **Transformative change (implicit):** mental models.
The authors stress that funders and NGOs must also examine their own internal conditions.

Coaching questions:
- Which of the six conditions most holds your problem in place?
- Which condition do you work on now, and which do you avoid?
- Who holds power over the decisions that matter, and how is it shifting?

---

## 3. Systems change, systems building and scaling

### 3.1 Systems building / strengthening local systems
In development usage, "systems building" or "systems strengthening" means improving the capacity of a whole set of interconnected actors (government, private, civil society, communities) to produce outcomes sustainably, rather than delivering services in parallel. Example: the WHO health system building blocks (service delivery, workforce, information, medicines, financing, leadership/governance).

**USAID Local Systems Framework (2014) and 5Rs technical note (2016):** a local system is the interconnected set of actors who jointly produce an outcome. The 5Rs are a lens for analysis and monitoring:
- **Results:** the outcomes the system produces.
- **Roles:** formal and informal roles of actors.
- **Relationships:** connections and interactions among actors.
- **Rules:** laws, norms, policies, procedures, traditions that shape behavior.
- **Resources:** financial, human, information, power and other resources.
Note: USAID was largely dismantled in 2025; the frameworks remain widely used as reference material.

**Service delivery versus systems change:** service delivery fills a gap directly (the NGO is the provider). Systems change alters the conditions so that the system itself performs (the NGO is a catalyst, convener or advocate). Many organizations combine both, using delivery to prove models and earn legitimacy.

Coaching questions:
- If you left tomorrow, which results would continue and which would stop?
- Who should be playing the role you are playing now?
- Which rule or resource flow would need to change for the system to deliver without you?

### 3.2 Collective impact (Kania and Kramer, SSIR 2011)
Commitment of actors from different sectors to a common agenda for a specific social problem. Five conditions:
1. **Common agenda.**
2. **Shared measurement systems.**
3. **Mutually reinforcing activities.**
4. **Continuous communication.**
5. **Backbone support organization** (dedicated staff that guide vision, support aligned activities, establish shared measurement, build public will, advance policy, mobilize funding).

Critiques and updates: critics noted top-down, funder-driven and professional-led efforts that sidelined communities and ignored power and equity. The 2022 SSIR article "Centering Equity in Collective Impact" (Kania, Williams, Schmitz, Brady, Kramer, Splansky Juster) redefines collective impact as a network of community members, organizations and institutions advancing equity by learning together and aligning actions to achieve population and systems-level change. It proposes five strategies: ground the work in data and context and target solutions; focus on systems change in addition to programs and services; shift power within the collaborative; listen to and act with community; build equity leadership and accountability. (Exact wording of strategy list from secondary summaries; verify against the article.)

Coaching questions:
- Do the partners actually share an agenda, or only a topic?
- Which shared measures would every partner be willing to report on?
- Who funds and staffs the backbone, and is it trusted as neutral?

### 3.3 Scaling out, up and deep (Moore, Riddell and Vocisano, 2015)
Three strategies by which innovations achieve systemic impact:
- **Scaling out:** replication and dissemination to reach more people and places.
- **Scaling up:** changing institutions at the level of policy, rules and laws.
- **Scaling deep:** changing relationships, cultural values and beliefs.
They are complementary; reach alone rarely changes systems.

Coaching questions:
- Is your growth plan about more sites, different rules, or different beliefs?
- What would it take for government to adopt or fund your model?
- Which values or norms must change for your solution to stick?

---

## 4. Strategy frameworks for NGOs

### 4.1 Ebrahim and Rangan contingency framework ("What Impact?", CMR 2014; HBS working paper 2010)
Not every organization should measure long-term impact; what to measure depends on two contingencies. Funders are often better placed to measure systemic impact.
Axes:
- **Theory of change (vertical): focused vs complex.** Focused = cause-effect linear and well understood. Complex = weakly understood, multiple causal factors.
- **Operational strategy (horizontal): focused vs complex (integrated).** Focused = a specific task or niche. Complex = the organization absorbs other functions along the causal chain to gain control (like vertical integration).

Four types of results and what to measure:
- **Niche (focused ToC, focused operations):** emergency and basic services (soup kitchens, ambulances, hotlines). Measure inputs, activities and outputs.
- **Integrated (focused ToC, complex operations):** service delivery across several links (Aravind Eye Hospital, job training with placement, immunization, disaster relief). Measure outputs and outcomes.
- **Institutional (complex ToC, focused operations):** advocacy and norm change (Amnesty, Greenpeace). Measure outputs and "influence" (intermediate outcomes), not impacts.
- **Ecosystem (complex ToC, complex operations):** multi-intervention systemic work (BRAC, Harlem Children's Zone, Oxfam, CARE). Measure outcomes and, where control is sufficient, impacts.
The authors say the quadrants are not a normative ladder. In Ebrahim's 2019 book "Measuring Social Change" the framework is revised to four strategies (niche, integrated, emergent, ecosystem) on axes of uncertainty about cause-effect and control over outcomes.

Coaching questions:
- How well understood is the cause-effect link in your work?
- How much of the causal chain do you control directly?
- Which quadrant are you in, and what results is it fair to hold you accountable for?

### 4.2 Accountability (Ebrahim)
NGOs face multiple, sometimes conflicting accountabilities (Ebrahim 2003, World Development):
- **Upward:** to donors, foundations, governments (often dominant, focused on funds and reports).
- **Downward:** to beneficiaries, communities, clients.
- **Internal:** to mission and staff (sometimes called lateral or horizontal; peer accountability to other NGOs is also discussed in the literature).
Five mechanisms: (1) reports and disclosure statements; (2) performance assessments and evaluations; (3) participation; (4) self-regulation (codes, standards); (5) social auditing. Ebrahim distinguishes tools (discrete techniques) from processes (ongoing, e.g. participation). Over-reliance on upward, short-term accountability can crowd out learning and downward accountability.

Coaching questions:
- To whom do you feel most accountable in practice? To whom should you be?
- How can a community member complain about you, and what happens when they do?
- Which reports do you produce that no one uses for decisions?

### 4.3 Legal structure choice (Brumme and Trelstad)
Harvard Business Review article (2023), "Should Your Start-up Be For-Profit or Nonprofit?". From the abstract: legal structure is a critical early decision; hybrid structures add complexity; switching later is hard; align structure with mission, market and funding sources. Full text not accessed; specific decision criteria in the article are **unverified**. Commonly cited factors in the field: who pays (customers vs donors), ability to generate returns for investors, need for equity or philanthropic capital, mission lock and control, tax treatment.

Coaching questions:
- Who will pay for the value you create: users, third parties or donors?
- Could the model ever return capital to investors? Would that change your mission?
- What kinds of money do you need in the next three years?

### 4.4 Advocacy Strategy Framework (Coffman and Beer, Center for Evaluation Innovation 2015)
A one-page tool for articulating an advocacy theory of change. Two dimensions:
- **Audiences (x-axis):** from the public through influencers to decision makers.
- **Changes (y-axis):** from awareness through will to action.
Tactics are placed in the space according to which audience they target and which change they seek (for example, public awareness campaigns vs lobbying decision makers). The exact intermediate labels on each axis are as recalled from the framework and partly **unverified**.

Coaching questions:
- Whose behavior must change for your policy goal to happen?
- Do they need awareness, will, or action from you right now?
- Which tactics are you using, and where do they sit on the grid?

### 4.5 Public value strategic triangle (Mark Moore, "Creating Public Value", 1995)
A strategy is sound when three elements align:
- **Public value:** the value the organization creates for society.
- **Legitimacy and support (authorizing environment):** stakeholders who grant authority and resources.
- **Operational capacity:** the resources, skills and partners to deliver.

Coaching questions:
- What public value do you create that society would miss?
- Who authorizes and funds you, and do they value the same thing?
- Where is the triangle weakest for you today?

### 4.6 Intended impact and theory of change (Bridgespan)
Bridgespan uses **intended impact** as a clear statement of what the organization will hold itself accountable for achieving within a manageable time frame (who it serves, what outcomes), and **theory of change** as how it will achieve that impact (approach and programs). Together they guide decisions about what to start, stop, and invest in.

Coaching questions:
- In one sentence: which people, what change, by when?
- Which current program does not serve that statement? Would you stop it?
- What would your board say you are accountable for? Is it the same?

### 4.7 Engine of Impact (Meehan and Jonker, 2017)
Stanford book drawing on a survey of nonprofit leaders. Seven components, grouped as strategic leadership (mission, strategy, impact evaluation, insight and courage) and organizational capacity/operations (organization, funding, board governance). The grouping labels are **unverified** against the book text.

Coaching questions:
- Which of the seven components is weakest in your organization?
- Do you have the courage to stop programs your evaluation shows are not working?
- Is your funding model matched to your strategy?

---

## 5. Value proposition for social ventures

### 5.1 Value Proposition Canvas (Osterwalder et al., Strategyzer 2014)
Zooms into two blocks of the Business Model Canvas and checks fit between them.
- **Customer profile:** customer **jobs** (functional, social, emotional tasks they try to get done); **pains** (obstacles, risks, bad outcomes); **gains** (outcomes and benefits they want).
- **Value map:** **products and services**; **pain relievers** (how you reduce specific pains); **gain creators** (how you produce specific gains).
- **Fit:** problem-solution fit, then product-market fit, then business model fit.

Coaching questions:
- What job is your beneficiary trying to get done, in their own words?
- Which pains are most severe and most frequent?
- Which of your features relieve no ranked pain?

### 5.2 Beneficiary versus payer split
In many nonprofits the person who benefits is not the one who pays. Two value propositions are needed: one for beneficiaries (users) and one for payers (donors, governments, corporates, impact investors). Risks: the organization optimizes for the payer; beneficiary feedback is weak because no purchase decision signals value. Social enterprises often hold an impact value proposition and a commercial value proposition that must each stand up.

Coaching questions:
- Who uses your service, and who pays for it?
- What does each group value, and where do they conflict?
- How do you hear what beneficiaries value, when they cannot vote with money?

### 5.3 Social Business Model Canvas
An adaptation of the Business Model Canvas by the Social Innovation Lab (Australia; associated with Ingrid Burkett). It adds blocks such as type of intervention, segments split into beneficiaries and customers, social value proposition alongside customer value proposition, impact measures, and surplus (where profits are reinvested). Exact block list is **unverified**.

Coaching questions:
- What is your intervention, separate from your revenue model?
- What social value do you create, and how will you measure it?
- Where does surplus go?

### 5.4 The "5 Vs of value proposition": search result
**No authoritative framework by this name was found.** Searches returned no original author, textbook, or academic source defining "5 Vs of value proposition" in business or social-enterprise teaching. What exists instead, with no shared naming:
- Generic web lists of "five elements" of a value proposition (target customer, problem, differentiator, measurable benefit, proof).
- "Five categories" lists in sales content (productivity, profitability, image, experience, convenience).
- Osterwalder and Pigneur's five stages of the value life cycle (creation, appropriation, consumption, renewal, transfer).
- The design-thinking lenses desirability, feasibility, viability (three, not five).
- Unrelated lists such as the "Vs of big data".
Advisor guidance: if a user or course cites "5 Vs", ask them for the source and its definitions rather than supplying a version. It may be a course-specific or instructor-specific framework.

Coaching questions (if a user brings it up):
- Where did you meet the 5 Vs, and what are the five in your version?
- How does each V show up in your venture today?
- Which V is weakest, and what evidence do you have?

---

## 6. Concept notes

### 6.1 What a concept note is
A short summary of a proposed project, sent to a donor or foundation before (or instead of) a full proposal, so the funder can judge fit and invite a full application. It is a screening document: reviewers use it to eliminate projects that do not match priorities.

Typical structure (varies by funder; always follow the funder's template first):
1. Title, organization, contact, funder program targeted.
2. Problem statement / background: evidence of need, context, target group.
3. Proposed solution and approach, with why it is the right one.
4. Theory of change (short narrative or diagram).
5. Goal and objectives (specific and measurable).
6. Main activities.
7. Expected outputs and outcomes.
8. Monitoring, evaluation and learning approach.
9. Budget summary (indicative total and main lines; some funders want no budget at this stage).
10. Organizational capacity and track record; partners.
11. Sustainability and exit / scale plan.

Length norms: usually 2 to 5 pages; some funders allow up to 8 to 10 (for example a UN trust fund template caps at 10 pages). No single standard exists.

What reviewers look for:
- Clear alignment with the funder's mission, geography and priorities.
- A specific, evidenced problem and a credible logic from activities to outcomes.
- Realistic scope and budget relative to the ask and the organization's size.
- Evidence the team can deliver; partners and community involvement.
- Measurable results and a plan for what happens after funding ends.

Common weaknesses:
- Generic problem statements without local data.
- Activities listed without a causal link to outcomes; outputs presented as outcomes.
- Vague, unmeasurable objectives; budget inconsistent with activities; no sustainability plan.
- Ignoring the funder's priorities, format or length limit; too much history, too little about results.

### 6.2 Concept note versus proposal
A concept note is a short pitch that tests interest and fit. A full proposal is a detailed, often invited document with a full logframe or results framework, detailed budget and budget narrative, workplan, risk management, M&E plan, and annexes. Content must remain consistent between the two.

Coaching questions:
- What does this specific funder say it wants to fund, in its own words?
- Can you state the problem in two sentences with one local statistic?
- What will be different for whom at the end of the grant?

---

## 7. Mapping methods

### 7.1 Outcome mapping (IDRC)
A planning, monitoring and evaluation method (Earl, Carden and Smutylo, IDRC 2001) that defines results as changes in the behavior, relationships, activities and actions of the people and organizations a program works with directly. It accepts that programs contribute to, rather than cause, development impact. Three stages: intentional design, outcome and performance monitoring, evaluation planning (12 steps in total).
Key elements:
- **Vision and mission** of the program.
- **Boundary partners:** individuals, groups or organizations the program interacts with directly and can influence.
- **Outcome challenge:** for each boundary partner, a description of the ideal changed behavior, relationships and actions.
- **Progress markers:** a graduated set of signs of change for each partner: **expect to see** (early, easy responses), **like to see** (active learning and engagement), **love to see** (deep transformation).
- **Strategy maps:** a grid of strategy types (causal, persuasive, supportive) aimed at the individual partner or at its environment.
- **Organizational practices:** how the program itself stays effective and learns.
- **Monitoring journals** (outcome, strategy, performance).

Coaching questions (step by step):
1. Who are the few actors you work with directly and can influence?
2. For one of them: if you succeed completely, what will they be doing differently?
3. What would you expect to see early? Like to see next? Love to see?
4. Which of your strategies act on them directly, and which change their environment?

### 7.2 Actor and stakeholder mapping
Identifying who affects or is affected by an issue, and how they relate, so strategy targets the right people.
Key elements:
- **Stakeholder list:** beneficiaries, government, funders, peers, private sector, opponents, informal leaders.
- **Power-interest grid** (Mendelow 1991, widely adapted): high power/high interest = manage closely (key players); high power/low interest = keep satisfied; low power/high interest = keep informed; low power/low interest = monitor.
- **Influence mapping:** who influences whom on a specific decision, and how strongly. Net-Map (Schiffer, IFPRI) maps actors, links (money, advice, command), influence towers and goals.
- **Relationship mapping:** strength and quality of ties (allied, neutral, conflictual), gaps and brokers.

Coaching questions (step by step):
1. What decision or change is this map for?
2. Who decides, who influences the decider, who is affected, who could block it?
3. Where does each sit on power and interest? What evidence do you have?
4. Draw the links: who funds, advises or listens to whom? Where are the conflicts?
5. Who is missing, especially affected people with low formal power?

### 7.3 Systems mapping
Visual representation of how a system's parts connect, used to understand dynamics and find leverage. Common types: **actor maps** (who is in the system and their relationships), **causal loop diagrams** (variables and feedback, see 2.2), **rich pictures** (Checkland's Soft Systems Methodology), and stock-and-flow models. Participatory systems mapping builds the map with stakeholders, including people with lived experience, which adds knowledge and builds shared ownership of action.

Coaching questions (step by step):
1. What question should the map help you answer, and where is the boundary?
2. Who should be in the room to build it, including people with lived experience?
3. What are the main factors (or actors), and how does each one affect the others?
4. Where do you see loops that keep the problem going?
5. Where on the map do you sit, and where might a small change ripple furthest?

### 7.4 Problem tree and objective tree
A participatory analysis tool used in the logical framework approach (EU Project Cycle Management; derived from GTZ's ZOPP). The **problem tree** places a focal problem as the trunk, causes as roots and effects as branches. The **objective tree** rewrites each negative statement as a positive desired state, turning cause-effect into means-ends relationships; clusters of objectives become candidate strategies, and the chosen branch feeds the logframe (effects to goal, focal problem to purpose, causes to outputs).
Key elements: one focal problem; causes stated as existing negative conditions (not "lack of solution X"); several levels of causes; effects; conversion to objectives; analysis of alternatives and selection of scope.

Coaching questions (step by step):
1. In one sentence, what is the core problem, stated as a negative condition?
2. Why does it happen? And why does that happen? (Keep asking.)
3. What are its consequences for people?
4. Did you write any cause as "lack of [your solution]"? Can you restate it?
5. Turn each statement into a positive. Which branch can you realistically address, and who covers the others?

### 7.5 Beneficiary (user) journey mapping
A human-centered design tool that charts a person's experience over time as they try to get a need met, including steps outside the organization's program (IDEO.org Field Guide to Human-Centered Design and service design practice).
Key elements: a specific persona; stages (becoming aware, deciding, accessing, using, following up, leaving); actions and touchpoints at each stage; thoughts and emotions; pain points and drop-off points; opportunities; ideally built from interviews and observation, not assumption.

Coaching questions (step by step):
1. Pick one real person you serve. What first triggers their need?
2. How do they find out about you, and what do they have to do to reach you?
3. At each step, what does it cost them in time, money, travel or dignity?
4. Where do most people drop out? How do you know?
5. Which single pain point, if removed, would change outcomes most?

---

## 8. Glossary

Definitions are written in our own words. Where a term has a standard definition, the source that sets it is named in brackets (DAC = the OECD-DAC Glossary of Key Terms in Evaluation and Results Based Management).

- **Input**: the money, people, equipment and other resources put into an intervention (DAC). Often confused with: activity (inputs are what you have; activities are what you do with them).
- **Activity**: the work done to turn inputs into outputs, such as running a training or a clinic (DAC). Often confused with: output (the activity is the doing; the output is what it produces).
- **Output**: the direct products and services an intervention delivers, usually counted, such as people trained or kits distributed (DAC). Often confused with: outcome (outputs are what you deliver; outcomes are changes in other people).
- **Outcome**: a change, in the short or medium term, that results from the outputs, such as new skills, changed behaviour or better access (DAC). Often confused with: output and impact.
- **Short-term outcome**: an early change in the people served, typically in what they know, believe or can do.
- **Intermediate outcome**: a change in what people actually do (behaviour, practice, decisions) that builds on short-term outcomes.
- **Long-term outcome**: a change in people's condition or situation, such as health or income, that the program aims to contribute to. Often confused with: impact (impact is broader, usually at population or system level).
- **Impact**: the long-term effects of an intervention, positive or negative, intended or not, direct or indirect (DAC). Often confused with: "impact evaluation", a method for estimating causal effect that can also be applied to outcomes.
- **Goal**: the higher-level change an intervention aims to contribute to, alongside others (DAC). Often confused with: purpose (the goal is beyond the project's control alone).
- **Objective**: a result the intervention intends to reach at a given level; in a logframe, the overall objective is the goal and the specific objective is the purpose.
- **Purpose**: in a logframe, the direct change for the target group that the project commits to achieving (DAC; the EU calls it the specific objective). Often confused with: goal.
- **Results chain**: the sequence from inputs to activities, outputs, outcomes and impact (DAC). Often confused with: theory of change, which also explains why each step should lead to the next.
- **Logic model**: a usually linear diagram of a program's inputs, activities, outputs, outcomes and impact, read as "if this, then that". Often confused with: logframe.
- **Logframe (logical framework)**: a table that sets out an intervention's levels of results with indicators, sources of evidence and assumptions for each level (DAC). Often confused with: logic model (the logframe adds measurement and risk columns).
- **Theory of change**: an account of how and why a long-term change is expected to come about in a particular context, built backwards from that change and stating its preconditions and assumptions (Center for Theory of Change). Often confused with: logic model.
- **Assumption**: something taken to be true, about causes, conditions or risks, for one step to lead to the next (DAC). Often confused with: risk (a risk is the chance that an assumption turns out false).
- **Precondition**: an outcome that has to be in place before the next outcome in a theory of change can happen (Center for Theory of Change).
- **Indicator**: a measure, in numbers or in words, used to track whether a result is being achieved (DAC). Often confused with: target (the indicator is what you measure; the target is the level you aim for).
- **SMART**: a checklist for objectives and indicators: specific, measurable, achievable, relevant, time-bound.
- **Baseline**: where an indicator stood, or what the situation was, before the intervention started, used to judge progress (DAC). Often confused with: benchmark (a reference standard, often taken from elsewhere).
- **Target**: the value an indicator should reach by a given date. Often confused with: milestone.
- **Milestone**: an interim target or event that marks progress partway to the final target.
- **Means of verification**: where the data for an indicator will come from and how it will be collected (a logframe column).
- **Monitoring**: ongoing, routine collection of indicator data to show managers and stakeholders how an intervention is progressing (DAC). Often confused with: evaluation.
- **Evaluation**: a systematic, periodic assessment of a project, program or policy: its design, delivery and results, and why they turned out as they did (DAC). Often confused with: monitoring (evaluation judges merit and causes; monitoring tracks progress).
- **Formative evaluation**: evaluation during implementation, meant to improve the work (DAC). Often confused with: summative evaluation.
- **Summative evaluation**: evaluation at the end of an intervention or phase, judging how far the intended results were achieved (DAC).
- **Attribution**: claiming that an observed change was caused by a particular intervention, often with an estimate of how much (DAC). Often confused with: contribution.
- **Contribution**: a credible case that an intervention was one of several factors that helped bring about a result (Mayne). Often confused with: attribution, which tries to measure the share caused.
- **Counterfactual**: what would have happened to the same people or organizations without the intervention (DAC).
- **Relevance**: how well an intervention's aims and design fit the needs and priorities of the people and partners concerned (DAC criteria).
- **Effectiveness**: how far an intervention achieved, or is likely to achieve, its objectives (DAC). Often confused with: efficiency.
- **Efficiency**: how well resources (money, expertise, time) are turned into results (DAC). Often confused with: effectiveness (efficiency is about cost per result, not whether results were achieved).
- **Sustainability**: whether the benefits of an intervention continue after the main support ends (DAC).
- **Scaling up**: changing policies, rules or institutions so an innovation affects a whole system (Moore, Riddell and Vocisano). Often confused with: scaling out (in everyday use "scale up" often just means growing).
- **Scaling out**: replicating or spreading a program to reach more people and places (Moore, Riddell and Vocisano).
- **Scaling deep**: changing relationships, values and beliefs so that a change takes root (Moore, Riddell and Vocisano).
- **Value proposition**: what an organization offers a particular group of people and why it is worth having to them: the pains it eases and the gains it creates (Osterwalder). Often confused with: mission statement.
- **Beneficiary**: a person, group or organization that benefits from an intervention, directly or indirectly, whether or not they were targeted (DAC). Often confused with: target group (who the intervention is meant for) and customer (who pays).
- **Stakeholder**: anyone with an interest in an intervention or its evaluation, directly or indirectly (DAC).
- **Upward accountability**: answering to donors, governments and regulators for how funds are used and what results follow (Ebrahim).
- **Downward accountability**: answering to the people and communities served, including giving them a voice in decisions and a way to complain (Ebrahim).
- **Internal accountability**: answering to the organization's own mission, values and staff (Ebrahim).
- **Mission drift**: a gradual move of an organization's activities or the people it serves away from its stated mission, often under funding or revenue pressure. Often confused with: a deliberate strategic pivot.
- **System**: a set of connected parts that together produce some function or behaviour (after Meadows).
- **Systems thinking**: understanding a problem through the relationships, structures and feedback that produce its behaviour over time, rather than through isolated events. Often confused with: being comprehensive (it is about structure, not about including everything).
- **Stock**: an amount that builds up or runs down and can be counted at a moment in time, such as trained staff or cash reserves (Meadows). Often confused with: flow.
- **Flow**: the rate at which a stock grows or shrinks, such as hiring or drop-out per month (Meadows).
- **Feedback loop**: a chain of cause and effect that comes back to where it started, so a change ends up affecting itself (Meadows).
- **Reinforcing loop**: a feedback loop that pushes change further in the same direction, producing growth or collapse (Meadows; Senge).
- **Balancing loop**: a feedback loop that pushes back against change and holds a system near a goal or limit (Meadows; Senge).
- **Delay**: the time between a cause and its effect in a system (Meadows).
- **Leverage point**: a place in a system where a small change can shift its behaviour a lot (Meadows).
- **Causal loop diagram**: a diagram of variables joined by arrows marked + or - that shows reinforcing and balancing loops. Often confused with: a flowchart or process map, which shows sequence, not cause and effect.
- **Mental model**: the deeply held beliefs and assumptions that shape how people see a situation and act in it (Senge; FSG).
- **System archetype**: a structure that recurs across many systems and behaves in a predictable way, such as fixes that fail or shifting the burden (Senge).
- **Systems change**: shifting the conditions that keep a problem in place: policies, practices, resource flows, relationships, power and mental models (FSG). Often confused with: scaling a program.
- **Collective impact**: cross-sector collaboration built on a common agenda, shared measurement, mutually reinforcing activities, continuous communication and a backbone organization (Kania and Kramer). Often confused with: any partnership or coalition.
- **Backbone organization**: a separately staffed organization whose job is to coordinate a collective impact effort (FSG).
- **Concept note**: a short outline of a proposed project sent to a funder to test fit and interest before a full proposal. Often confused with: proposal.
- **Proposal**: a full funding application with detailed design, results framework, workplan, budget and monitoring and evaluation plan.
- **Unit cost**: the total cost of delivering one unit of output, such as one child enrolled. Often confused with: cost per outcome.
- **Cost per outcome**: total cost divided by the number of outcomes achieved, such as children reading at grade level. Often confused with: unit cost, which counts outputs, not results.
- **Social return on investment (SROI)**: a method that puts a money value on the social, environmental and economic value created, compared with what was invested, following the principles set by Social Value International. Often confused with: financial return on investment and cost-benefit analysis (SROI centres value as defined by stakeholders).

---

## Sources

- Center for Theory of Change. "What is Theory of Change?" and ToC basics. https://www.theoryofchange.org/what-is-theory-of-change/
- Anderson, A. A. (2005). The Community Builder's Approach to Theory of Change. Aspen Institute Roundtable on Community Change. https://www.aspeninstitute.org/publications/community-builders-approach-theory-change-practical-guide-theory-development/
- Mayne, J. (2008). Contribution Analysis: An approach to exploring cause and effect. ILAC Brief 16. https://www.betterevaluation.org/methods-approaches/approaches/contribution-analysis
- Wilson-Grau, R. and Britt, H. (2012). Outcome Harvesting. Ford Foundation. https://www.betterevaluation.org/methods-approaches/approaches/outcome-harvesting
- OECD-DAC. Glossary of Key Terms in Evaluation and Results Based Management. https://www.oecd.org/dac/evaluation/
- Meadows, D. (2008). Thinking in Systems: A Primer. Chelsea Green.
- Meadows, D. (1999). Leverage Points: Places to Intervene in a System. Donella Meadows Institute. https://donellameadows.org/archives/leverage-points-places-to-intervene-in-a-system/
- Senge, P. (1990/2006). The Fifth Discipline. Doubleday.
- Kania, J., Kramer, M. and Senge, P. (2018). The Water of Systems Change. FSG. https://www.fsg.org/resource/water_of_systems_change/ ; summary: https://sfu.ca/complex-systems-frameworks/frameworks/unpacking-complexity/six-conditions-of-systems-change.html
- Kania, J. and Kramer, M. (2011). Collective Impact. SSIR. https://ssir.org/articles/entry/collective_impact
- Kania, J., Williams, J., Schmitz, P., Brady, S., Kramer, M. and Splansky Juster, J. (2022). Centering Equity in Collective Impact. SSIR. https://ssir.org/articles/entry/centering_equity_in_collective_impact ; Collective Impact Forum: https://collectiveimpactforum.org/resource/strategies-to-support-centering-equity-in-collective-impact/
- USAID (2014). Local Systems: A Framework for Supporting Sustained Development. https://www.globalwaters.org/resources/assets/local-systems-framework-supporting-sustained-development
- USAID (2016). The 5Rs Framework in the Program Cycle (technical note); referenced via https://usaidlearninglab.org/node/14257 and https://collaboratiohelvetica.ch/en/blog/2021/7/28/the-5r-framework-gn2bw
- Moore, M.-L., Riddell, D. and Vocisano, D. (2015). Scaling Out, Scaling Up, Scaling Deep. Journal of Corporate Citizenship 58: 67-84. DOI 10.9774/gleaf.4700.2015.ju.00009. https://www.scilit.net/publications/f58802912905e59c9518276eef28d7b9
- Ebrahim, A. and Rangan, V. K. (2014). What Impact? A Framework for Measuring the Scale and Scope of Social Performance. California Management Review 56(3): 118-141. https://cmr.berkeley.edu/2014/05/56-3-what-impact-a-framework-for-measuring-the-scale-and-scope-of-social-performance/
- Ebrahim, A. and Rangan, V. K. (2010). The Limits of Nonprofit Impact: A Contingency Framework for Measuring Social Performance. HBS Working Paper 10-099 (framework text and Figure 1 checked here). https://www.hbs.edu/ris/Publication%20Files/10-099_0b80d379-8e88-4992-9e8f-4b79596b1ff9.pdf
- Ebrahim, A. (2019). Measuring Social Change: Performance and Accountability in a Complex World. Stanford University Press. https://now.tufts.edu/2019/12/10/making-social-change-efforts-more-effective
- Ebrahim, A. (2003). Accountability in Practice: Mechanisms for NGOs. World Development 31(5): 813-829.
- Brumme and Trelstad (2023). Should Your Start-up Be For-Profit or Nonprofit? Harvard Business Review (abstract only). https://www.ebsco.com/articles/business-and-management/63ae50c3-9b69-51db-8d76-684d14f37aca/should-your-start-up-be-for-profit-or-nonprofit
- Coffman, J. and Beer, T. (2015). The Advocacy Strategy Framework. Center for Evaluation Innovation. https://evaluationinnovation.org/?p=369
- Moore, M. H. (1995). Creating Public Value: Strategic Management in Government. Harvard University Press.
- Bridgespan Group. Intended impact and theory of change resources. https://www.bridgespan.org/insights/nonprofit-organizational-effectiveness/intended-impact-theory-of-change (URL unverified)
- Meehan, W. F. and Jonker, K. S. (2017). Engine of Impact: Essentials of Strategic Leadership in the Nonprofit Sector. Stanford University Press.
- Osterwalder, A., Pigneur, Y., Bernarda, G. and Smith, A. (2014). Value Proposition Design. Wiley/Strategyzer. https://www.strategyzer.com/library/the-value-proposition-canvas
- Burkett, I. Using the Business Model Canvas for Social Enterprise Design. https://cscuk.fcdo.gov.uk/wp-content/uploads/2016/07/BMC-for-Social-Enterprise.pdf
- "5 Vs" search (negative result) context: https://en.wikipedia.org/wiki/Value_proposition ; https://www.engagent.io/insights/5-main-categories-of-your-value-proposition
- FundsforNGOs. What is a concept note and how long should it be? https://www.fundsforngos.org/proposals/answering-the-commonly-asked-questions-about-concept-notes
- UN Trust Fund for Human Security. Concept Note Template. https://www.un.org/humansecurity/wp-content/uploads/2026/07/UNTFHS-Concept-Note-Template.docx
- Global Affairs Canada (2022). Guide to preparing concept notes. https://www.international.gc.ca/world-monde/funding-financement/indigenous-climate-concept-peuple-autochtones.aspx?lang=eng
- WHO (2007). Everybody's Business: Strengthening Health Systems (six building blocks). https://www.who.int/publications/i/item/everybody-s-business----strengthening-health-systems-to-improve-health-outcomes
- W.K. Kellogg Foundation (2004). Logic Model Development Guide. https://www.wkkf.org/resource-directory/resources/2004/01/logic-model-development-guide (overview: https://www.betterevaluation.org/tools-resources/wk-kellogg-foundation-logic-model-guide)
- OECD-DAC (2002; 2nd ed. 2023). Glossary of Key Terms in Evaluation and Results Based Management. https://alnap.org/help-library/resources/glossary-of-key-terms-in-evaluation-and-results-based-management/
- OECD-DAC (2019). Better Criteria for Better Evaluation (relevance, coherence, effectiveness, efficiency, impact, sustainability). https://www.oecd.org/dac/evaluation/daccriteriaforevaluatingdevelopmentassistance.htm
- European Commission (2004). Project Cycle Management Guidelines (logframe, problem and objective trees). https://capacity4dev.europa.eu/
- Doran, G. T. (1981). There's a S.M.A.R.T. way to write management's goals and objectives. Management Review 70(11).
- Roche, C. (1999). Impact Assessment for Development Agencies. Oxfam (SPICED indicators).
- Earl, S., Carden, F. and Smutylo, T. (2001). Outcome Mapping: Building Learning and Reflection into Development Programs. IDRC. https://www.betterevaluation.org/methods-approaches/approaches/outcome-mapping ; https://www.outcomemapping.ca/
- Mendelow, A. (1991). Stakeholder mapping (power-interest grid). Proceedings of the 2nd International Conference on Information Systems. (unverified bibliographic detail)
- Schiffer, E. Net-Map toolbox. IFPRI. https://netmap.wordpress.com/
- Checkland, P. Soft Systems Methodology (rich pictures). Wiley.
- IDEO.org (2015). The Field Guide to Human-Centered Design. https://www.designkit.org/resources/1.html
- Social Value International. The Principles of Social Value / SROI guide. https://www.socialvalueint.org/principles`;
