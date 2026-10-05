"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import type { Gateway } from "@/types";
import {
  CertificationsCell,
  DeploymentCell,
  EmployeesCell,
  JurisdictionCell,
  ModalityCell,
  ObservabilityCell,
  OpenAiCompatibilityCell,
  ProvidersCell,
  ResidencyCell,
} from "@/components/comparison/cells";
import { GatewayLogo } from "@/components/gateways/gateway-logo";
import { MetricCell } from "@/components/ui/metric-value";
import { ExpandedRow } from "@/components/comparison/expanded-row";
import { cn } from "@/lib/utils";

/**
 * Mobile presentation of a table row.
 *
 * Rather than shrinking thirteen columns, each gateway becomes a card with the
 * primary comparison facts and the same expandable detail panel used on
 * desktop.
 */
export function MobileGatewayCard({ gateway }: { gateway: Gateway }) {
  const [open, setOpen] = React.useState(false);
  const panelId = `mobile-details-${gateway.slug}`;

  return (
    <article className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
      <div className="flex items-start gap-3 p-4">
        <GatewayLogo gateway={gateway} size="md" />
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">{gateway.name}</h3>
          <p className="mt-0.5 text-[12.5px] leading-snug text-ink-subtle">
            {gateway.differentiator}
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-px border-y border-line bg-line">
        <div className="bg-surface px-4 py-3">
          <dt className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-subtle">
            Models
          </dt>
          <dd className="mt-1">
            <MetricCell metric={gateway.models} align="left" />
          </dd>
        </div>

        <div className="bg-surface px-4 py-3">
          <dt className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-subtle">
            Providers
          </dt>
          <dd className="mt-1">
            <ProvidersCell gateway={gateway} />
          </dd>
        </div>

        <div className="bg-surface px-4 py-3">
          <dt className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-subtle">
            Employees
          </dt>
          <dd className="mt-1">
            <EmployeesCell gateway={gateway} />
          </dd>
        </div>

        <div className="bg-surface px-4 py-3">
          <dt className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-subtle">
            Certifications
          </dt>
          <dd className="mt-1.5">
            <CertificationsCell field={gateway.certifications} />
          </dd>
        </div>

        <div className="bg-surface px-4 py-3">
          <dt className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-subtle">
            Jurisdiction
          </dt>
          <dd className="mt-1.5">
            <JurisdictionCell gateway={gateway} />
          </dd>
        </div>

        <div className="bg-surface px-4 py-3">
          <dt className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-subtle">
            EU residency
          </dt>
          <dd className="mt-1.5">
            <ResidencyCell gateway={gateway} />
          </dd>
        </div>
      </dl>

      <div className="flex flex-col gap-3 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-subtle">
            OpenAI compatible
          </p>
          <OpenAiCompatibilityCell field={gateway.openaiCompatible} size="sm" />
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-subtle">
            Observability
          </p>
          <ObservabilityCell field={gateway.observability} size="sm" />
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-subtle">
            Modalities
          </p>
          <div className="mt-1.5">
            <ModalityCell field={gateway.modalities} limit={5} />
          </div>
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-subtle">
            Deployment
          </p>
          <div className="mt-1.5">
            <DeploymentCell field={gateway.deployment} zdr={gateway.zeroDataRetention} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-line bg-subtle px-4 py-2.5">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={panelId}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-muted"
        >
          {open ? "Hide details" : "Details"}
          <ChevronDown
            aria-hidden="true"
            className={cn("size-3.5 transition-transform duration-200", open && "rotate-180")}
          />
        </button>
      </div>

      {open ? (
        <div id={panelId} className="border-t border-line">
          <ExpandedRow gateway={gateway} />
        </div>
      ) : null}
    </article>
  );
}
