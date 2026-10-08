import type { CategoryName } from "./content";

interface ArticleBody {
  standfirst: string;
  paragraphs: string[];
  pullQuote: string;
}

const bodies: Record<CategoryName, ArticleBody> = {
  Business: {
    standfirst:
      "The decision that looked reckless in the spring is now the case study everyone in the industry is quietly copying.",
    paragraphs: [
      "The call that started it all lasted eleven minutes and produced no written record. There was no board meeting, no deck, and no vote — just four founders on a video call at six in the morning, staring at a spreadsheet that had stopped adding up three weeks earlier.",
      "What made the moment unusual was not the decision itself. Companies change course constantly. What made it unusual was the speed at which the change became visible: within a fortnight the company had renegotiated eleven supplier contracts, closed two distribution offices, and moved 40,000 delayed orders onto a system that did not exist in April.",
      "\"We had run out of ways to be wrong slowly,\" one of the founders said in an interview at the company's Rotterdam headquarters. \"Once you accept that, the arguments stop being about strategy and start being about arithmetic.\"",
      "The results are now measurable. On-time delivery, which had fallen below 70% during the disruption, has held above 96% for four consecutive quarters. Gross margin recovered nine points. Two of the company's largest customers have begun replicating the routing model inside their own supply chains.",
      "Not everyone is convinced the model scales. Competitors argue that the company's recovery depended on a level of vertical integration that most operators cannot afford, and that the same shock would simply bankrupt a thinner business. Regulators in two markets have also opened preliminary inquiries into the exclusivity arrangements the company signed with its new carriers.",
      "Still, the direction of travel is hard to miss. Three of the four founders have stopped describing the company as a logistics business at all, preferring the word \"infrastructure.\" The fourth, who was the loudest sceptic of the pivot, now spends most of her week selling it.",
      "For the industry the lesson is narrower and more uncomfortable than the headlines suggest. The advantage these founders built was not technology, and it was not capital. It was the willingness to absorb a loss early, in public, before the loss had time to become a story.",
    ],
    pullQuote:
      "Once you accept that, the arguments stop being about strategy and start being about arithmetic.",
  },
  Tech: {
    standfirst:
      "The budgets have not disappeared. They have simply stopped being labelled as experiments.",
    paragraphs: [
      "For two years the pattern was identical everywhere: a pilot, a committee, a proof of concept that never quite reached production. That pattern is breaking, and the evidence is in the line items rather than the press releases.",
      "Across twelve organisations with more than 10,000 employees, spending on applied machine learning has moved out of innovation budgets and into operating expense. In practice this means a model that once needed annual re-approval now competes for the same headcount as a customer-service team.",
      "\"The moment it becomes a cost centre, it becomes somebody's problem to justify every quarter,\" said one technology officer who asked not to be named because her firm has not announced the change. \"That is either discipline or death, and we have not decided which yet.\"",
      "The shift has a quiet casualty: the small vendor. Tools that sold on novelty — a demo, a hack week, a slide comparing outputs — are finding buyers far less willing to pay for a second product that overlaps with the first. Consolidation is proceeding faster than most of the incumbents expected.",
      "There is also a risk in counting the wrong thing. Several firms now measure AI spend per department, which makes it easy to see where investment is going and hard to see whether anything improved. Three of the organisations interviewed for this story could not say, without a pause, what their largest deployment had actually returned.",
      "The firms that have fared best share an unglamorous habit: they wrote the exit criteria before the pilot. Not the success metrics — the conditions under which they would switch it off and walk away.",
      "Whether that discipline becomes standard practice or remains the exception will shape the next phase of enterprise software far more than any single model release.",
    ],
    pullQuote:
      "The moment it becomes a cost centre, it becomes somebody's problem to justify every quarter.",
  },
  Startups: {
    standfirst:
      "They raised before they pitched, and the term sheet arrived before the deck was finished.",
    paragraphs: [
      "The round closed on a Friday afternoon with two signatures, no lawyers on the call, and a cap table that still lists four names. It is the kind of financing that founders describe as luck and investors describe as pattern recognition.",
      "What the investors saw was not a pitch. It was eleven months of unglamorous data: a working unit, a defect rate that fell every quarter, and a waitlist assembled one customer at a time from a market nobody had bothered to name.",
      "\"We didn't raise because the story was good,\" the company's chief executive said. \"We raised because by the time we started talking, saying no required an argument.\"",
      "That dynamic is becoming more common at the earliest stages. With later-stage rounds harder to close, capital has moved up the cap table in search of companies whose risk is operational rather than speculative — businesses where the question is whether they can scale, not whether anyone wants the product.",
      "The consequence for everyone else is a wider gap. Founders without that kind of evidence are waiting longer, raising smaller, and accepting structures their predecessors would have refused.",
      "There are also the ordinary hazards of speed. A round closed in a week has had a week of diligence. Two of the terms in this one — a board seat and a milestone-linked second tranche — only surfaced when the founders tried to hire their first finance lead.",
      "For now the company is not hiring aggressively and is not expanding its product line. The founders say the money is there to buy time, and that time, not the valuation, is the part they were short of.",
    ],
    pullQuote: "By the time we started talking, saying no required an argument.",
  },
};

export function getBody(category: CategoryName): ArticleBody {
  return bodies[category];
}
