import client from 'prom-client';

const globalForPrometheus = globalThis as typeof globalThis & {
  prometheusRegistry?: client.Registry;
  prometheusMetricsInitialized?: boolean;
};

const register = globalForPrometheus.prometheusRegistry ?? new client.Registry();

if (!globalForPrometheus.prometheusMetricsInitialized) {
  client.collectDefaultMetrics({ register });
  globalForPrometheus.prometheusMetricsInitialized = true;
}

if (!globalForPrometheus.prometheusRegistry) {
  globalForPrometheus.prometheusRegistry = register;
}

export { register };
