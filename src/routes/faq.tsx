import { createFileRoute, Link } from "@tanstack/react-router";

import { PublicPage } from "@/components/site";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Pahana" },
      {
        name: "description",
        content:
          "Answers about pricing, deadlines, payments, revisions, privacy and academic integrity for Pahana assignment assistance.",
      },
      { property: "og:title", content: "FAQ — Pahana" },
      {
        property: "og:description",
        content: "Pricing, deadlines, payment, revisions and privacy questions answered.",
      },
    ],
  }),
  component: FaqPage,
});

const QA = [
  [
    "How is the price decided?",
    "We look at the word count, subject, referencing style and deadline, then send one fixed price in LKR. Nothing is charged before you accept the quote.",
  ],
  [
    "How do I pay?",
    "Bank transfer. The account details appear on your Payments page once a quote is issued; upload the slip and we verify it, usually within a few hours.",
  ],
  [
    "How fast can you deliver?",
    "Standard turnaround is 3–5 days. Urgent work can often be done in 24–48 hours for a higher tier rate, subject to availability.",
  ],
  [
    "Are revisions included?",
    "Yes. Reasonable revisions that stay within the original brief are free after delivery. Big scope changes are quoted separately.",
  ],
  [
    "Who can see my files?",
    "Only you and the Pahana staff working on your order. Files are stored privately and are never shared with other students.",
  ],
  [
    "Is this allowed by my university?",
    "Pahana supplies guidance, research support, formatting help and model material. You are responsible for using it in line with your institution's academic-integrity policy.",
  ],
  [
    "Can I cancel and get a refund?",
    "If work has not started, you get a full refund. Once writing has begun, refunds are partial and based on the stage reached.",
  ],
];

function FaqPage() {
  return (
    <PublicPage>
      <div className="w">
        <section id="faq">
          <h2>Frequently asked questions</h2>
          <p className="mut">Still unsure? Message us from your dashboard any time.</p>
          <div className="card" style={{ marginTop: 26 }}>
            {QA.map(([q, a]) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
          <div className="bt" style={{ marginTop: 24 }}>
            <Link className="btn" to="/register">
              Create an account
            </Link>
          </div>
        </section>
      </div>
    </PublicPage>
  );
}
