"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useReportWebVitals } from "next/web-vitals";
import { useObservabilityStore } from "@/stores/observability";

export function RuntimeMonitoringProvider() {
  const pathname = usePathname();
  const recordFrontendError = useObservabilityStore((state) => state.recordFrontendError);
  const recordWebVital = useObservabilityStore((state) => state.recordWebVital);

  useReportWebVitals((metric) => {
    recordWebVital(
      {
        id: metric.id,
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        navigationType: metric.navigationType,
      },
      pathname
    );
  });

  useEffect(() => {
    function onError(event: ErrorEvent) {
      recordFrontendError({
        name: event.error?.name || "WindowError",
        message: event.message || "Erro não identificado",
        stack: event.error?.stack,
        route: pathname,
      });
    }

    function onUnhandledRejection(event: PromiseRejectionEvent) {
      const reason = event.reason;
      const message =
        reason instanceof Error
          ? reason.message
          : typeof reason === "string"
            ? reason
            : "Promise rejeitada sem mensagem";

      recordFrontendError({
        name: reason instanceof Error ? reason.name : "UnhandledRejection",
        message,
        stack: reason instanceof Error ? reason.stack : undefined,
        route: pathname,
      });
    }

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, [pathname, recordFrontendError]);

  return null;
}
