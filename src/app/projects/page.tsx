"use client";

import { useState, useMemo } from "react";
import { getProjects, saveProject, deleteProject } from "@/lib/storage";
import { formatCurrency } from "@/lib/calculations";
import { Project } from "@/lib/types";
import ProjectDetailsView from "@/components/ProjectDetailsView";
import { useHydrated } from "@/lib/useHydrated";

export default function ProjectsPage() {
  const hydrated = useHydrated();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [initialized, setInitialized] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    clientName: "",
    clientPhone: "",
    currency: "YER",
    exchangeRate: 1,
    profitMargin: 15,
    overheads: 5,
  });

  const initialProjects = useMemo(() => (hydrated ? getProjects() : []), [hydrated]);
  if (hydrated && !initialized) {
    setProjects(initialProjects);
    setInitialized(true);
  }

  if (!hydrated) return null;

  const filteredProjects = projects.filter(
    (p) =>
      p.name.includes(searchQuery) ||
      p.clientName.includes(searchQuery) ||
      p.location.includes(searchQuery)
  );

  function handleCreateProject() {
    const project: Project = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
      name: formData.name,
      location: formData.location,
      clientName: formData.clientName,
      clientPhone: formData.clientPhone,
      currency: formData.currency,
      exchangeRate: formData.exchangeRate,
      profitMargin: formData.profitMargin,
      overheads: formData.overheads,
      stages: [],
      readyMixCost: 0,
      readyMixBasedTotalCost: 0,
      materialBasedTotalCost: 0,
      createdAt: new Date().toISOString(),
    };
    saveProject(project);
    setProjects(getProjects());
    setShowForm(false);
    setFormData({
      name: "",
      location: "",
      clientName: "",
      clientPhone: "",
      currency: "YER",
      exchangeRate: 1,
      profitMargin: 15,
      overheads: 5,
    });
  }

  function handleDeleteProject(id: string) {
    if (!confirm("هل أنت متأكد من حذف هذا المشروع؟")) return;
    deleteProject(id);
    setProjects(getProjects());
    if (selectedProject?.id === id) setSelectedProject(null);
  }

  function handleProjectUpdate(updated: Project) {
    saveProject(updated);
    setProjects(getProjects());
    setSelectedProject(updated);
  }

  if (selectedProject) {
    return (
      <ProjectDetailsView
        project={selectedProject}
        onBack={() => setSelectedProject(null)}
        onUpdate={handleProjectUpdate}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">المشاريع</h1>
          <p className="text-[var(--muted)] mt-1">
            إدارة المشاريع الإنشائية وتتبع التكاليف
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors"
        >
          + مشروع جديد
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="بحث بالاسم أو العميل أو الموقع..."
          className="w-full max-w-md px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--card-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {showForm && (
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">مشروع جديد</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-medium mb-1">اسم المشروع</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="مثال: فيلا سكنية"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">الموقع</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="مثال: صنعاء"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">اسم العميل</label>
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">رقم الهاتف</label>
              <input
                type="text"
                value={formData.clientPhone}
                onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">العملة</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="YER">ريال يمني</option>
                <option value="SAR">ريال سعودي</option>
                <option value="USD">دولار أمريكي</option>
                <option value="AED">درهم إماراتي</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">سعر الصرف</label>
              <input
                type="number"
                value={formData.exchangeRate || ""}
                onChange={(e) => setFormData({ ...formData, exchangeRate: parseFloat(e.target.value) || 1 })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">هامش الربح (%)</label>
              <input
                type="number"
                value={formData.profitMargin || ""}
                onChange={(e) => setFormData({ ...formData, profitMargin: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">المصاريف الإدارية (%)</label>
              <input
                type="number"
                value={formData.overheads || ""}
                onChange={(e) => setFormData({ ...formData, overheads: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCreateProject}
              disabled={!formData.name}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              إنشاء المشروع
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-5 py-2 rounded-lg border border-[var(--border)] text-sm hover:bg-[var(--background)] transition-colors"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {filteredProjects.length === 0 ? (
        <div className="text-center py-16 text-[var(--muted)]">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0v7.5" />
          </svg>
          <p className="text-lg font-medium">لا توجد مشاريع</p>
          <p className="text-sm mt-1">اضغط &quot;مشروع جديد&quot; لإنشاء أول مشروع</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold">{project.name}</h3>
                  <p className="text-sm text-[var(--muted)]">{project.location}</p>
                </div>
                <button
                  onClick={() => handleDeleteProject(project.id)}
                  className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded"
                  title="حذف"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
              </div>
              <div className="text-sm text-[var(--muted)] mb-3">
                <p>العميل: {project.clientName || "غير محدد"}</p>
                <p>{project.stages.length} مراحل</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-blue-600">
                  {formatCurrency(project.materialBasedTotalCost, project.currency)}
                </span>
                <button
                  onClick={() => setSelectedProject(project)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  التفاصيل
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
