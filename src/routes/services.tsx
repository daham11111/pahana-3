import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { PublicPage } from "@/components/site";
import { fetchActiveServices } from "@/lib/queries";
import { lkr } from "@/lib/pahana";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Pahana" },
      {
        name: "description",
        content:
          "Assignment writing, report writing, programming help, proofreading, presentations and research support with starting prices in LKR.",
      },
      { property: "og:title", content: "Services — Pahana" },
      {
        property: "og:description",
        content: "Every Pahana service with starting prices in LKR and typical turnaround times.",
      },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["services", "active"],
    queryFn: fetchActiveServices,
  });

  return (
    <PublicPage>
      <div className="w">
        <section>
          <h2>Services</h2>
          <p className="mut">
            Choose a service and submit your brief — you&apos;ll get a fixed quote before any
            payment.
          </p>
          {isLoading ? (
            <p className="mut" style={{ marginTop: 20 }}>
              Loading services…
            </p>
          ) : (
            <div className="g" style={{ marginTop: 26 }}>
              {(data ?? []).map((s) => (
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
          )}
        </section>
      </div>
    </PublicPage>
  );
}
