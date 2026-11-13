// Glossary shown in the app's Glossary tab. Mirrors the Glossary section of
// lib/knowledge.ts (a unit test checks they stay in step).

export type GlossaryEntry = { term: string; definition: string; confusedWith: string };

export const GLOSSARY: GlossaryEntry[] = [
  {
    "term": "Input",
    "definition": "the money, people, equipment and other resources put into an intervention (DAC).",
    "confusedWith": "activity (inputs are what you have; activities are what you do with them)"
  },
  {
    "term": "Activity",
    "definition": "the work done to turn inputs into outputs, such as running a training or a clinic (DAC).",
    "confusedWith": "output (the activity is the doing; the output is what it produces)"
  },
  {
    "term": "Output",
    "definition": "the direct products and services an intervention delivers, usually counted, such as people trained or kits distributed (DAC).",
    "confusedWith": "outcome (outputs are what you deliver; outcomes are changes in other people)"
  },
  {
    "term": "Outcome",
    "definition": "a change, in the short or medium term, that results from the outputs, such as new skills, changed behaviour or better access (DAC).",
    "confusedWith": "output and impact"
  },
  {
    "term": "Short-term outcome",
    "definition": "an early change in the people served, typically in what they know, believe or can do.",
    "confusedWith": ""
  },
  {
    "term": "Intermediate outcome",
    "definition": "a change in what people actually do (behaviour, practice, decisions) that builds on short-term outcomes.",
    "confusedWith": ""
  },
  {
    "term": "Long-term outcome",
    "definition": "a change in people's condition or situation, such as health or income, that the program aims to contribute to.",
    "confusedWith": "impact (impact is broader, usually at population or system level)"
  },
  {
    "term": "Impact",
    "definition": "the long-term effects of an intervention, positive or negative, intended or not, direct or indirect (DAC).",
    "confusedWith": "\"impact evaluation\", a method for estimating causal effect that can also be applied to outcomes"
  },
  {
    "term": "Goal",
    "definition": "the higher-level change an intervention aims to contribute to, alongside others (DAC).",
    "confusedWith": "purpose (the goal is beyond the project's control alone)"
  },
  {
    "term": "Objective",
    "definition": "a result the intervention intends to reach at a given level; in a logframe, the overall objective is the goal and the specific objective is the purpose.",
    "confusedWith": ""
  },
  {
    "term": "Purpose",
    "definition": "in a logframe, the direct change for the target group that the project commits to achieving (DAC; the EU calls it the specific objective).",
    "confusedWith": "goal"
  },
  {
    "term": "Results chain",
    "definition": "the sequence from inputs to activities, outputs, outcomes and impact (DAC).",
    "confusedWith": "theory of change, which also explains why each step should lead to the next"
  },
  {
    "term": "Logic model",
    "definition": "a usually linear diagram of a program's inputs, activities, outputs, outcomes and impact, read as \"if this, then that\".",
    "confusedWith": "logframe"
  },
  {
    "term": "Logframe (logical framework)",
    "definition": "a table that sets out an intervention's levels of results with indicators, sources of evidence and assumptions for each level (DAC).",
    "confusedWith": "logic model (the logframe adds measurement and risk columns)"
  },
  {
    "term": "Theory of change",
    "definition": "an account of how and why a long-term change is expected to come about in a particular context, built backwards from that change and stating its preconditions and assumptions (Center for Theory of Change).",
    "confusedWith": "logic model"
  },
  {
    "term": "Assumption",
    "definition": "something taken to be true, about causes, conditions or risks, for one step to lead to the next (DAC).",
    "confusedWith": "risk (a risk is the chance that an assumption turns out false)"
  },
  {
    "term": "Precondition",
    "definition": "an outcome that has to be in place before the next outcome in a theory of change can happen (Center for Theory of Change).",
    "confusedWith": ""
  },
  {
    "term": "Indicator",
    "definition": "a measure, in numbers or in words, used to track whether a result is being achieved (DAC).",
    "confusedWith": "target (the indicator is what you measure; the target is the level you aim for)"
  },
  {
    "term": "SMART",
    "definition": "a checklist for objectives and indicators: specific, measurable, achievable, relevant, time-bound.",
    "confusedWith": ""
  },
  {
    "term": "Baseline",
    "definition": "where an indicator stood, or what the situation was, before the intervention started, used to judge progress (DAC).",
    "confusedWith": "benchmark (a reference standard, often taken from elsewhere)"
  },
  {
    "term": "Target",
    "definition": "the value an indicator should reach by a given date.",
    "confusedWith": "milestone"
  },
  {
    "term": "Milestone",
    "definition": "an interim target or event that marks progress partway to the final target.",
    "confusedWith": ""
  },
  {
    "term": "Means of verification",
    "definition": "where the data for an indicator will come from and how it will be collected (a logframe column).",
    "confusedWith": ""
  },
  {
    "term": "Monitoring",
    "definition": "ongoing, routine collection of indicator data to show managers and stakeholders how an intervention is progressing (DAC).",
    "confusedWith": "evaluation"
  },
  {
    "term": "Evaluation",
    "definition": "a systematic, periodic assessment of a project, program or policy: its design, delivery and results, and why they turned out as they did (DAC).",
    "confusedWith": "monitoring (evaluation judges merit and causes; monitoring tracks progress)"
  },
  {
    "term": "Formative evaluation",
    "definition": "evaluation during implementation, meant to improve the work (DAC).",
    "confusedWith": "summative evaluation"
  },
  {
    "term": "Summative evaluation",
    "definition": "evaluation at the end of an intervention or phase, judging how far the intended results were achieved (DAC).",
    "confusedWith": ""
  },
  {
    "term": "Attribution",
    "definition": "claiming that an observed change was caused by a particular intervention, often with an estimate of how much (DAC).",
    "confusedWith": "contribution"
  },
  {
    "term": "Contribution",
    "definition": "a credible case that an intervention was one of several factors that helped bring about a result (Mayne).",
    "confusedWith": "attribution, which tries to measure the share caused"
  },
  {
    "term": "Counterfactual",
    "definition": "what would have happened to the same people or organizations without the intervention (DAC).",
    "confusedWith": ""
  },
  {
    "term": "Relevance",
    "definition": "how well an intervention's aims and design fit the needs and priorities of the people and partners concerned (DAC criteria).",
    "confusedWith": ""
  },
  {
    "term": "Effectiveness",
    "definition": "how far an intervention achieved, or is likely to achieve, its objectives (DAC).",
    "confusedWith": "efficiency"
  },
  {
    "term": "Efficiency",
    "definition": "how well resources (money, expertise, time) are turned into results (DAC).",
    "confusedWith": "effectiveness (efficiency is about cost per result, not whether results were achieved)"
  },
  {
    "term": "Sustainability",
    "definition": "whether the benefits of an intervention continue after the main support ends (DAC).",
    "confusedWith": ""
  },
  {
    "term": "Scaling up",
    "definition": "changing policies, rules or institutions so an innovation affects a whole system (Moore, Riddell and Vocisano).",
    "confusedWith": "scaling out (in everyday use \"scale up\" often just means growing)"
  },
  {
    "term": "Scaling out",
    "definition": "replicating or spreading a program to reach more people and places (Moore, Riddell and Vocisano).",
    "confusedWith": ""
  },
  {
    "term": "Scaling deep",
    "definition": "changing relationships, values and beliefs so that a change takes root (Moore, Riddell and Vocisano).",
    "confusedWith": ""
  },
  {
    "term": "Value proposition",
    "definition": "what an organization offers a particular group of people and why it is worth having to them: the pains it eases and the gains it creates (Osterwalder).",
    "confusedWith": "mission statement"
  },
  {
    "term": "Beneficiary",
    "definition": "a person, group or organization that benefits from an intervention, directly or indirectly, whether or not they were targeted (DAC).",
    "confusedWith": "target group (who the intervention is meant for) and customer (who pays)"
  },
  {
    "term": "Stakeholder",
    "definition": "anyone with an interest in an intervention or its evaluation, directly or indirectly (DAC).",
    "confusedWith": ""
  },
  {
    "term": "Upward accountability",
    "definition": "answering to donors, governments and regulators for how funds are used and what results follow (Ebrahim).",
    "confusedWith": ""
  },
  {
    "term": "Downward accountability",
    "definition": "answering to the people and communities served, including giving them a voice in decisions and a way to complain (Ebrahim).",
    "confusedWith": ""
  },
  {
    "term": "Internal accountability",
    "definition": "answering to the organization's own mission, values and staff (Ebrahim).",
    "confusedWith": ""
  },
  {
    "term": "Mission drift",
    "definition": "a gradual move of an organization's activities or the people it serves away from its stated mission, often under funding or revenue pressure.",
    "confusedWith": "a deliberate strategic pivot"
  },
  {
    "term": "System",
    "definition": "a set of connected parts that together produce some function or behaviour (after Meadows).",
    "confusedWith": ""
  },
  {
    "term": "Systems thinking",
    "definition": "understanding a problem through the relationships, structures and feedback that produce its behaviour over time, rather than through isolated events.",
    "confusedWith": "being comprehensive (it is about structure, not about including everything)"
  },
  {
    "term": "Stock",
    "definition": "an amount that builds up or runs down and can be counted at a moment in time, such as trained staff or cash reserves (Meadows).",
    "confusedWith": "flow"
  },
  {
    "term": "Flow",
    "definition": "the rate at which a stock grows or shrinks, such as hiring or drop-out per month (Meadows).",
    "confusedWith": ""
  },
  {
    "term": "Feedback loop",
    "definition": "a chain of cause and effect that comes back to where it started, so a change ends up affecting itself (Meadows).",
    "confusedWith": ""
  },
  {
    "term": "Reinforcing loop",
    "definition": "a feedback loop that pushes change further in the same direction, producing growth or collapse (Meadows; Senge).",
    "confusedWith": ""
  },
  {
    "term": "Balancing loop",
    "definition": "a feedback loop that pushes back against change and holds a system near a goal or limit (Meadows; Senge).",
    "confusedWith": ""
  },
  {
    "term": "Delay",
    "definition": "the time between a cause and its effect in a system (Meadows).",
    "confusedWith": ""
  },
  {
    "term": "Leverage point",
    "definition": "a place in a system where a small change can shift its behaviour a lot (Meadows).",
    "confusedWith": ""
  },
  {
    "term": "Causal loop diagram",
    "definition": "a diagram of variables joined by arrows marked + or - that shows reinforcing and balancing loops.",
    "confusedWith": "a flowchart or process map, which shows sequence, not cause and effect"
  },
  {
    "term": "Mental model",
    "definition": "the deeply held beliefs and assumptions that shape how people see a situation and act in it (Senge; FSG).",
    "confusedWith": ""
  },
  {
    "term": "System archetype",
    "definition": "a structure that recurs across many systems and behaves in a predictable way, such as fixes that fail or shifting the burden (Senge).",
    "confusedWith": ""
  },
  {
    "term": "Systems change",
    "definition": "shifting the conditions that keep a problem in place: policies, practices, resource flows, relationships, power and mental models (FSG).",
    "confusedWith": "scaling a program"
  },
  {
    "term": "Collective impact",
    "definition": "cross-sector collaboration built on a common agenda, shared measurement, mutually reinforcing activities, continuous communication and a backbone organization (Kania and Kramer).",
    "confusedWith": "any partnership or coalition"
  },
  {
    "term": "Backbone organization",
    "definition": "a separately staffed organization whose job is to coordinate a collective impact effort (FSG).",
    "confusedWith": ""
  },
  {
    "term": "Concept note",
    "definition": "a short outline of a proposed project sent to a funder to test fit and interest before a full proposal.",
    "confusedWith": "proposal"
  },
  {
    "term": "Proposal",
    "definition": "a full funding application with detailed design, results framework, workplan, budget and monitoring and evaluation plan.",
    "confusedWith": ""
  },
  {
    "term": "Unit cost",
    "definition": "the total cost of delivering one unit of output, such as one child enrolled.",
    "confusedWith": "cost per outcome"
  },
  {
    "term": "Cost per outcome",
    "definition": "total cost divided by the number of outcomes achieved, such as children reading at grade level.",
    "confusedWith": "unit cost, which counts outputs, not results"
  },
  {
    "term": "Social return on investment (SROI)",
    "definition": "a method that puts a money value on the social, environmental and economic value created, compared with what was invested, following the principles set by Social Value International.",
    "confusedWith": "financial return on investment and cost-benefit analysis (SROI centres value as defined by stakeholders)"
  }
];
