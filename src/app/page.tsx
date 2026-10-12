"use client";

import { useMemo } from "react";
import Link from "next/link";
import { getProjects } from "@/lib/storage";
import { formatCurrency } from "@/lib/calculations";
import { useHydrated } from "@/lib/useHydrated";

export default function Home() {
  const hydrated = useHydrated();
  const projects = useMemo(() => (hydrated ? getProjects() : []), [hydrated]);

  if (!hydrated) return null;

  const totalCost = projects.reduce((sum, p) => sum + p.materialBasedTotalCost, 0);
  const totalStages = projects.reduce((sum, p) => sum + p.stages.length, 0);
  const totalItems = projects.reduce(
    (sum, p) => sum + p.stages.reduce((s, st) => s + st.items.length, 0),
    0
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)]">
          لوحة التحكم
        </h1>
        <p className="text-[var(--muted)] mt-1">
          نظام حساب التكاليف المعمارية - إدارة المشاريع وحساب جداول الكميات
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="المشاريع"
          value={projects.length.toString()}
          icon={
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0v7.5" />
            </svg>
          }
          color="bg-blue-500"
        />
        <StatCard
          title="المراحل"
          value={totalStages.toString()}
          icon={
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
            </svg>
          }
          color="bg-emerald-500"
        />
        <StatCard
          title="البنود"
          value={totalItems.toString()}
          icon={
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
          }
          color="bg-amber-500"
        />
        <StatCard
          title="إجمالي التكاليف"
          value={formatCurrency(totalCost)}
          icon={
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          }
          color="bg-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">إجراءات سريعة</h2>
          <div className="grid grid-cols-2 gap-3">
            <QuickAction href="/calculator" label="حاسبة التكاليف" color="blue" />
            <QuickAction href="/projects" label="مشروع جديد" color="emerald" />
            <QuickAction href="/materials" label="أسعار المواد" color="amber" />
            <QuickAction href="/reports" label="التقارير" color="purple" />
          </div>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">آخر المشاريع</h2>
          {projects.length === 0 ? (
            <div className="text-center py-8 text-[var(--muted)]">
              <p>لا توجد مشاريع بعد</p>
              <Link href="/projects" className="inline-block mt-3 text-sm text-blue-600 hover:underline">
                إنشاء مشروع جديد
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.slice(0, 5).map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-[var(--background)] border border-[var(--border)]"
                >
                  <div>
                    <h3 className="font-medium text-sm">{project.name}</h3>
                    <p className="text-xs text-[var(--muted)]">
                      {project.clientName} - {project.stages.length} مراحل
                    </p>
                  </div>
                  <span className="text-sm font-medium text-blue-600">
                    {formatCurrency(project.materialBasedTotalCost, project.currency)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-5 flex items-center gap-4">
      <div className={`${color} text-white p-3 rounded-lg`}>{icon}</div>
      <div>
        <p className="text-sm text-[var(--muted)]">{title}</p>
        <p className="text-xl font-bold mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function QuickAction({ href, label, color }: { href: string; label: string; color: string }) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-2 p-4 rounded-lg bg-${color}-50 text-${color}-700 hover:bg-${color}-100 transition-colors dark:bg-${color}-900/20 dark:text-${color}-300`}
    >
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}
