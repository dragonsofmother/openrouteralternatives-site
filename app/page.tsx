import { allGateways, currentSnapshotDate, sortByName } from "@/lib/gateway";
import { JsonLd, canonical, itemListJsonLd } from "@/lib/seo";
import { Container } from "@/components/layout/container";
import { Hero } from "@/components/home/hero";
import { Methodology } from "@/components/home/methodology";
import { Contribute } from "@/components/home/contribute";
import { ComparisonTable } from "@/components/comparison/comparison-table";
import { DataLegend } from "@/components/comparison/data-legend";

/**
 * The homepage is the product: a short introduction, the comparison table,
 * the methodology that explains how to read it, and how to contribute.
 */
export default function HomePage() {
  const gateways = sortByName(allGateways());

  return (
    <>
      <Hero snapshotDate={currentSnapshotDate()} />

      <section aria-labelledby="compare-heading" className="scroll-mt-20 py-4" id="compare">
        <Container width="wide">
          <h2 id="compare-heading" className="sr-only">
            Compare AI gateways
          </h2>
          <DataLegend />
          <div className="mt-3">
            <ComparisonTable
              gateways={gateways}
              caption="Comparison of AI gateways by jurisdiction, EU residency, model count, providers, OpenAI compatibility, modalities, deployment, observability and company data."
            />
          </div>
          <p className="mt-3 text-[12.5px] leading-relaxed text-ink-subtle">
            Model counts are dated snapshots; where available, catalogues are measured directly
            from public model endpoints, and OpenAI compatibility is read from documentation and
            shown as a label, never a score. Rows are ordered by model count, largest first, with equal counts in alphabetical
            order. Each sortable column sorts in one direction only, model count breaks ties, and
            rows without a value stay at the bottom. Every figure carries how it was established, so an absent number reads as a
            fact about the product rather than a gap in the research.
          </p>
        </Container>
      </section>

      <Methodology />

      <Contribute />

      <JsonLd
        data={itemListJsonLd({
          name: "AI gateways and OpenRouter alternatives",
          description:
            "Gateways tracked in the openrouteralternatives.eu comparison dataset.",
          items: gateways.map((gateway) => ({
            name: gateway.name,
            url: gateway.website ?? canonical("/#compare"),
          })),
        })}
      />
    </>
  );
}
