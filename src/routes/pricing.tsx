import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { PublicPage } from "@/components/site";
import { fetchActiveServices, fetchSettings } from "@/lib/queries";
import { lkr } from "@/lib/pahana";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Pahana" },
      {
        name: "description",
        content:
          "Transparent per-word tiers in LKR plus starting prices for each Pahana service. Every order is confirmed with a fixed quote.",
      },
      { property: "og:title", content: "Pricing — Pahana" },
      {
        property: "og:description",
        content: "Per-word tiers in LKR and starting prices for every Pahana service.",
      },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  const settings = useQuery({ queryKey: ["settings"], queryFn: fetchSettings });
  const services = useQuery({ queryKey: ["services", "active"], queryFn: fetchActiveServices });

  return (
    <PublicPage>
      <div className="w">
        <section>
          <h2>Pricing</h2>
          <p className="mut">
            Indicative rates only — you always receive a fixed quote for your specific brief before
            paying.
          </p>

          <div className="g g3" style={{ marginTop: 26 }}>
            {(settings.data?.tiers ?? []).map(([label, rate]) => (
              <div className="card" key={label}>
                <small>{label}</small>
                <b style={{ display: "block", font: "700 1.6rem var(--fd)", marginTop: 4 }}>
                  LKR {rate}
                </b>
                <small>per word</small>
              </div>
            ))}
          </div>

          <h3 style={{ marginTop: 34 }}>Starting prices by service</h3>
          <div style={{ marginTop: 12 }}>
            {(services.data ?? []).map((s) => (
              <div className="it" key={s.id}>
                <span style={{ fontSize: "1.3rem" }}>{s.icon}</span>
                <b>{s.name}</b>
                <small>{s.turnaround}</small>
                <span className="pill">{lkr(s.price)}</span>
              </div>
            ))}
          </div>

          <div className="bt" style={{ marginTop: 24 }}>
            <Link className="btn" to="/register">
              Get a quote
            </Link>
            <Link className="btn b2" to="/faq">
              Read the FAQ
            </Link>
          </div>
        </section>
      </div>
    </PublicPage>
  );
}
