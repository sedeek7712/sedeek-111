"use client";

import { useState, useMemo } from "react";
import { getProjects } from "@/lib/storage";
import { formatCurrency, formatNumber } from "@/lib/calculations";
import { useHydrated } from "@/lib/useHydrated";

export default function ReportsPage() {
  const hydrated = useHydrated();
  const projects = useMemo(() => (hydrated ? getProjects() : []), [hydrated]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  const resolvedSelectedId = selectedProjectId || (projects.length > 0 ? projects[0].id : "");

  if (!hydrated) return null;

  const project = projects.find((p) => p.id === resolvedSelectedId);

  function generateTextReport(): string {
    if (!project) return "";
    const lines: string[] = [];
    lines.push("=".repeat(60));
    lines.push("         تقرير تكاليف المشروع");
    lines.push("=".repeat(60));
    lines.push("");
    lines.push(`المشروع: ${project.name}`);
    lines.push(`الموقع: ${project.location}`);
    lines.push(`العميل: ${project.clientName}`);
    lines.push(`العملة: ${project.currency}`);
    lines.push(`هامش الربح: ${project.profitMargin}%`);
    lines.push(`المصاريف الإدارية: ${project.overheads}%`);
    lines.push("");
    lines.push("-".repeat(60));

    project.stages.forEach((stage, si) => {
      lines.push("");
      lines.push(`المرحلة ${si + 1}: ${stage.name}`);
      lines.push(`عدد البنود: ${stage.items.length}`);
      lines.push(`إجمالي المرحلة: ${formatCurrency(stage.materialBasedTotalCost, project.currency)}`);
      lines.push("");

      stage.items.forEach((item, ii) => {
        lines.push(`  البند ${ii + 1}: ${item.itemName}`);
        lines.push(`    الكمية: ${formatNumber(item.quantity)} ${item.unit}`);
        lines.push(`    التكلفة: ${formatCurrency(item.materialBasedTotalCost, project.currency)}`);

        item.materials.forEach((mat) => {
          lines.push(`      - ${mat.materialName}: ${formatNumber(mat.finalQty)} ${mat.unit} = ${formatCurrency(mat.totalPrice, project.currency)}`);
        });
        lines.push("");
      });

      lines.push("-".repeat(60));
    });

    lines.push("");
    lines.push("=".repeat(60));
    lines.push(`الإجمالي الكلي: ${formatCurrency(project.materialBasedTotalCost, project.currency)}`);
    lines.push("=".repeat(60));

    return lines.join("\n");
  }

  function handleDownloadReport() {
    const text = generateTextReport();
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `تقرير-${project?.name || "مشروع"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleDownloadCSV() {
    if (!project) return;
    const rows: string[][] = [];
    rows.push(["المرحلة", "البند", "الكمية", "الوحدة", "المادة", "كمية المادة", "وحدة المادة", "السعر", "الإجمالي"]);

    project.stages.forEach((stage) => {
      stage.items.forEach((item) => {
        item.materials.forEach((mat) => {
          rows.push([
            stage.name,
            item.itemName,
            item.quantity.toString(),
            item.unit,
            mat.materialName,
            mat.finalQty.toString(),
            mat.unit,
            mat.unitPrice.toString(),
            mat.totalPrice.toString(),
          ]);
        });
      });
    });

    const bom = "\uFEFF";
    const csv = bom + rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `تقرير-${project.name}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">التقارير</h1>
        <p className="text-[var(--muted)] mt-1">
          عرض وتصدير تقارير تكاليف المشاريع
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-16 text-[var(--muted)] bg-[var(--card-bg)] border border-[var(--border)] rounded-xl">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
          </svg>
          <p className="text-lg font-medium">لا توجد مشاريع</p>
          <p className="text-sm mt-1">أنشئ مشروعاً أولاً لعرض التقارير</p>
        </div>
      ) : (
        <>
          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">اختر المشروع</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - {p.clientName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 pt-5">
                <button
                  onClick={handleDownloadReport}
                  disabled={!project}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  تصدير TXT
                </button>
                <button
                  onClick={handleDownloadCSV}
                  disabled={!project}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  تصدير CSV
                </button>
              </div>
            </div>
          </div>

          {project && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-4">
                  <p className="text-sm text-[var(--muted)]">المراحل</p>
                  <p className="text-2xl font-bold">{project.stages.length}</p>
                </div>
                <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-4">
                  <p className="text-sm text-[var(--muted)]">البنود</p>
                  <p className="text-2xl font-bold">
                    {project.stages.reduce((sum, s) => sum + s.items.length, 0)}
                  </p>
                </div>
                <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-4">
                  <p className="text-sm text-[var(--muted)]">تكلفة المواد</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(project.materialBasedTotalCost, project.currency)}
                  </p>
                </div>
                <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-4">
                  <p className="text-sm text-[var(--muted)]">تكلفة الجاهزة</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(project.readyMixBasedTotalCost, project.currency)}
                  </p>
                </div>
              </div>

              {project.stages.map((stage) => (
                <div key={stage.id} className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl overflow-hidden">
                  <div className="p-4 bg-[var(--background)] border-b border-[var(--border)] flex items-center justify-between">
                    <h3 className="font-bold">{stage.name}</h3>
                    <span className="text-sm font-medium text-blue-600">
                      {formatCurrency(stage.materialBasedTotalCost, project.currency)}
                    </span>
                  </div>
                  {stage.items.length > 0 ? (
                    <div className="p-4">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-[var(--border)]">
                            <th className="text-right py-2 px-2 font-medium text-[var(--muted)]">البند</th>
                            <th className="text-right py-2 px-2 font-medium text-[var(--muted)]">الكمية</th>
                            <th className="text-right py-2 px-2 font-medium text-[var(--muted)]">تكلفة المواد</th>
                            <th className="text-right py-2 px-2 font-medium text-[var(--muted)]">تكلفة الجاهزة</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stage.items.map((item) => (
                            <tr key={item.id} className="border-b border-[var(--border)] last:border-0">
                              <td className="py-2 px-2 font-medium">{item.itemName}</td>
                              <td className="py-2 px-2">{formatNumber(item.quantity)} {item.unit}</td>
                              <td className="py-2 px-2">{formatCurrency(item.materialBasedTotalCost, project.currency)}</td>
                              <td className="py-2 px-2">{formatCurrency(item.readyMixBasedTotalCost, project.currency)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-sm text-[var(--muted)]">
                      لا توجد بنود في هذه المرحلة
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
