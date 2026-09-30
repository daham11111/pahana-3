import { createFileRoute, Link } from "@tanstack/react-router";

import { PublicPage } from "@/components/site";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How it works — Pahana" },
      {
        name: "description",
        content:
          "From brief to delivery in four steps: share your handout, get a fixed LKR quote, pay and track progress, then download and review.",
      },
      { property: "og:title", content: "How it works — Pahana" },
      {
        property: "og:description",
        content: "Brief, quote, payment, tracking and delivery — how a Pahana order runs.",
      },
    ],
  }),
  component: HowPage,
});

const STEPS = [
  [
    "Share your brief",
    "Create an account, pick a service and upload the handout or rubric. Add the module, word count, referencing style and deadline so nothing gets lost in translation.",
  ],
  [
    "Get a fixed quote",
    "Our team reviews the scope and sends a price in LKR with a confirmed delivery date. You can ask questions in the message thread before accepting.",
  ],
  [
    "Pay and track",
    "Transfer the amount to the bank details shown in your dashboard and upload the slip. Once verified, the order moves to In Progress and you can follow each stage live.",
  ],
  [
    "Receive and review",
    "Download the finished files from your order page, request reasonable revisions, then leave a rating that helps other students.",
  ],
];

function HowPage() {
  return (
    <PublicPage>
      <div className="w">
        <section>
          <h2>How it works</h2>
          <p className="mut">A clear, tracked process — no guesswork and no hidden fees.</p>

          <ol className="tl" style={{ marginTop: 26, listStyle: "none" }}>
            {STEPS.map(([t, d], i) => (
              <li key={t} className={i === 0 ? "a" : ""}>
                <b style={{ color: "var(--fg)" }}>{t}</b>
                <small style={{ marginTop: 4 }}>{d}</small>
              </li>
            ))}
          </ol>

          <div className="card" style={{ marginTop: 24 }}>
            <h3>Academic integrity</h3>
            <p className="mut" style={{ marginTop: 6 }}>
              Pahana provides guidance, research support, formatting and model material. You remain
              responsible for following your institution&apos;s academic-integrity rules.
            </p>
          </div>

          <div className="bt" style={{ marginTop: 24 }}>
            <Link className="btn" to="/register">
              Start an order
            </Link>
            <Link className="btn b2" to="/pricing">
              See pricing
            </Link>
          </div>
        </section>
      </div>
    </PublicPage>
  );
}
