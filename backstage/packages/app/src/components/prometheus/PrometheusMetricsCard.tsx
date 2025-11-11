import { useEffect, useState } from 'react';
import { Progress, InfoCard } from '@backstage/core-components';

export const PrometheusMetricsCard = () => {
  const [value, setValue] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetric = async () => {
      setLoading(true);
      const resp = await fetch(
        '/api/prometheus/query?query=rate(http_requests_total[5m])',
      );
      const data = await resp.json();
      const v = data?.data?.result?.[0]?.value?.[1];
      setValue(v ? Number(v) : null);
      setLoading(false);
    };

    fetchMetric();
    const id = setInterval(fetchMetric, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <InfoCard title="HTTP req/s (5m rate)">
      {loading ? (
        <Progress />
      ) : (
        <div style={{ padding: '16px' }}>
          <div style={{ fontSize: 28 }}>{value ?? 'N/A'}</div>
        </div>
      )}
    </InfoCard>
  );
};
