import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { Icon } from "@/components/Icon";
import { PublicPage } from "@/components/site";
import { fetchActiveServices, fetchApprovedReviews, fetchSettings } from "@/lib/queries";
import { lkr } from "@/lib/pahana";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pahana — Campus assignment assistance in Sri Lanka" },
      {
        name: "description",
        content:
          "Submit your brief, get a clear LKR quote and track every step. Assignment writing, reports, programming help, proofreading and presentations for Sri Lankan campus students.",
      },
      { property: "og:title", content: "Pahana — Campus assignment assistance in Sri Lanka" },
      {
        property: "og:description",
        content:
          "Submit your brief, get a clear LKR quote and track every step of your assignment with Pahana.",
      },
    ],
  }),
  component: Home,
});

const STEPS = [
  ["1", "Share your brief", "Upload the handout, tell us the module, word count and deadline."],
  ["2", "Get a fixed quote", "We review the scope and send a clear price in LKR — no surprises."],
  ["3", "Pay & track", "Transfer to our bank, upload the slip and follow live progress."],
  ["4", "Receive & review", "Download the finished work, ask for tweaks, then rate us."],
];

const WHY = [
  ["🎓", "Campus-aware", "Written for Sri Lankan university modules, rubrics and referencing."],
  ["⏱️", "On-time delivery", "Deadline-first workflow with quality check before hand-over."],
  ["🔒", "Private by default", "Your files stay locked to your account — only staff you work with see them."],
  ["💬", "Real humans", "Message the team in-app and get answers, not bots."],
  ["🧾", "Transparent pricing", "Fixed quotes in LKR before any payment is taken."],
  ["♻️", "Free revisions", "Reasonable tweaks after delivery are included."],
];

function Home() {
  const services = useQuery({ queryKey: ["services", "active"], queryFn: fetchActiveServices });
  const reviews = useQuery({ queryKey: ["reviews", "approved"], queryFn: fetchApprovedReviews });
  const settings = useQuery({ queryKey: ["settings"], queryFn: fetchSettings });

  return (
    <PublicPage>
      <div className="w">
        <section className="hero">
          <div className="hl">
            <span className="tag">For Sri Lankan campus students</span>
            <h1>Assignment help that respects your deadline.</h1>
            <p>
              Upload your brief, get a fixed price in LKR, then track your assignment from review to
              delivery — all in one dashboard.
            </p>
            <div className="bt">
              <Link className="btn lg2" to="/register">
                Get started free
              </Link>
              <Link className="btn b2 lg2" to="/services">
                Browse services
              </Link>
            </div>
            <ul className="tr">
              <li>
                <Icon name="check" /> Fixed LKR quotes
              </li>
              <li>
                <Icon name="check" /> Live order tracking
              </li>
              <li>
                <Icon name="check" /> Private file storage
              </li>
            </ul>
          </div>

          <div className="hv">
            <div className="hc">
              <div className="hh">
                <div>
                  <b>PA-10492</b>
                  <small>Research Methods — 2,500 words</small>
                </div>
                <span className="pill">In Progress</span>
              </div>
              <div className="bars">
                <div>
                  <span>Research</span>
                  <i style={{ width: "92%" }} />
                </div>
                <div>
                  <span>Drafting</span>
                  <i style={{ width: "68%" }} />
                </div>
                <div>
                  <span>Referencing</span>
                  <i style={{ width: "35%" }} />
                </div>
              </div>
              <div className="bar">
                <i style={{ width: "72%" }} />
              </div>
              <small style={{ display: "block", marginTop: 10 }}>
                Due in 3 days · Quality check next
              </small>
            </div>
            <div className="ch c1">
              <Icon name="check" /> Quote approved
            </div>
            <div className="ch c2">
              <Icon name="shield" /> Files encrypted
            </div>
          </div>
        </section>

        <section className="g g4">
          <div className="card stat">
            <small>Assignments delivered</small>
            <b>1,200+</b>
          </div>
          <div className="card stat">
            <small>On-time rate</small>
            <b>98%</b>
          </div>
          <div className="card stat">
            <small>Average rating</small>
            <b>4.8/5</b>
          </div>
          <div className="card stat">
            <small>Campuses served</small>
            <b>40+</b>
          </div>
        </section>

        <section id="how">
          <h2>How it works</h2>
          <p className="mut">Four simple steps from brief to delivery.</p>
          <div className="g" style={{ marginTop: 26 }}>
            {STEPS.map(([n, t, d]) => (
              <div className="card h" key={n}>
                <div className="ico">{n}</div>
                <h3>{t}</h3>
                <p className="mut" style={{ marginTop: 6 }}>
                  {d}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id="services">
          <h2>Services</h2>
          <p className="mut">Pick what you need — prices start from the figures below.</p>
          <div className="g" style={{ marginTop: 26 }}>
            {(services.data ?? []).slice(0, 6).map((s) => (
              <div className="card h svc" key={s.id}>
                <div className="ico">{s.icon}</div>
                <h3>{s.name}</h3>
                <p className="mut" style={{ margin: "6px 0 12px" }}>
                  {s.description}
                </p>
                <small style={{ display: "block", marginBottom: 14 }}>
                  From <b>{lkr(s.price)}</b> · {s.turnaround}
                </small>
                <Link className="btn sm" to="/register">
                  Request this
                </Link>
              </div>
            ))}
          </div>
          <div className="bt" style={{ marginTop: 22 }}>
            <Link className="btn b2" to="/services">
              See all services
            </Link>
          </div>
        </section>

        <section id="pricing">
          <h2>Pricing</h2>
          <p className="mut">Indicative per-word tiers. Every order gets a fixed quote first.</p>
          <div className="g g3" style={{ marginTop: 26 }}>
            {(settings.data?.tiers ?? []).map(([label, rate]) => (
              <div className="card" key={label}>
                <small>{label}</small>
                <b style={{ display: "block", font: "700 1.5rem var(--fd)", marginTop: 4 }}>
                  LKR {rate}
                </b>
                <small>per word</small>
              </div>
            ))}
          </div>
        </section>

        <section id="why">
          <h2>Why students choose Pahana</h2>
          <div className="g" style={{ marginTop: 26 }}>
            {WHY.map(([e, t, d]) => (
              <div className="card h" key={t}>
                <div className="ico">{e}</div>
                <h3>{t}</h3>
                <p className="mut" style={{ marginTop: 6 }}>
                  {d}
                </p>
              </div>
            ))}
          </div>
        </section>

        {(reviews.data ?? []).length > 0 && (
          <section id="reviews">
            <h2>What students say</h2>
            <div className="g" style={{ marginTop: 26 }}>
              {(reviews.data ?? []).map((r) => (
                <div className="card" key={r.id}>
                  <div style={{ color: "#f59e0b", fontSize: "1.1rem" }}>
                    {"★".repeat(r.rating)}
                    <span style={{ color: "var(--bd)" }}>{"★".repeat(5 - r.rating)}</span>
                  </div>
                  <p style={{ margin: "8px 0 10px" }}>{r.body}</p>
                  <small>
                    <b>{r.name}</b>
                  </small>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="card cta">
            <h2>Ready to hand in with confidence?</h2>
            <p className="mut" style={{ margin: "8px auto 20px", maxWidth: 520 }}>
              Create a free account, submit your brief and get a quote today.
            </p>
            <Link className="btn lg2" to="/register">
              Create my account
            </Link>
          </div>
        </section>
      </div>
    </PublicPage>
  );
}
