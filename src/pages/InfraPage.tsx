import { useState } from 'react';

const GRAFANA_BASE = 'https://d1z20dvak4bl13.cloudfront.net/grafana';

const dashboards = [
  { id: 'e2e-business', label: 'E2E & Business', uid: 'baselink-e2e-business' },
  { id: 'app-api', label: 'Application & API', uid: 'baselink-app-api' },
  { id: 'db-mq', label: 'DB & Message Queue', uid: 'baselink-db-mq' },
  { id: 'autoscaling', label: 'Autoscaling & K8s', uid: 'baselink-autoscaling-k8s' },
  { id: 'waf-security', label: 'WAF Security', uid: 'baselink-waf-security' },
  { id: 'jaeger-traces', label: 'Jaeger Traces', uid: '__explore' },
];

export function InfraPage() {
  const [active, setActive] = useState(dashboards[0]);

  const iframeSrc = active.uid === '__explore'
    ? `${GRAFANA_BASE}/explore?${new URLSearchParams({
        orgId: '1',
        left: JSON.stringify({
          datasource: 'Jaeger',
          queries: [
            {
              refId: 'A',
              datasource: {
                type: 'jaeger',
                uid: 'Jaeger',
              },
              queryType: 'search',
              limit: 20,
            },
          ],
          range: {
            from: 'now-1h',
            to: 'now',
          },
        }),
        kiosk: '',
        theme: 'light',
      }).toString()}`
    : `${GRAFANA_BASE}/d/${active.uid}?orgId=1&kiosk&theme=light`;

  return (
    <div className="fixed inset-x-0 top-16 bottom-0 flex bg-slate-900">
      {/* Sidebar */}
      <aside className="flex w-60 flex-col border-r border-slate-700 bg-slate-900">
        <div className="px-5 py-6">
          <h1 className="text-lg font-bold text-white">Infra Monitor</h1>
          <p className="mt-1 text-xs text-slate-400">BaseLink 인프라 대시보드</p>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {dashboards.map((d) => (
            <button
              key={d.id}
              onClick={() => setActive(d)}
              className={`w-full rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                active.id === d.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {d.label}
            </button>
          ))}
        </nav>

        <div className="border-t border-slate-700 px-5 py-4">
          <a
            href={`${GRAFANA_BASE}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-400 hover:text-white"
          >
            Grafana 직접 접속 →
          </a>
        </div>
      </aside>

      {/* Dashboard iframe */}
      <main className="flex-1">
        <iframe
          src={iframeSrc}
          title={active.label}
          className="h-full w-full border-0"
          allow="fullscreen"
        />
      </main>
    </div>
  );
}
