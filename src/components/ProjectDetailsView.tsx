"use client";

import { useState } from "react";
import { Project, Stage, CalculationType } from "@/lib/types";
import { calculateProjectItem, updateStageTotals, updateProjectTotals, formatCurrency, formatNumber } from "@/lib/calculations";
import { getMaterials } from "@/lib/storage";
import { CALCULATION_TYPES } from "@/lib/constants";

interface Props {
  project: Project;
  onBack: () => void;
  onUpdate: (project: Project) => void;
}

export default function ProjectDetailsView({ project, onBack, onUpdate }: Props) {
  const [showAddStage, setShowAddStage] = useState(false);
  const [stageName, setStageName] = useState("");
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [itemForm, setItemForm] = useState({
    calcType: "concrete_footing" as CalculationType,
    length: 0,
    width: 0,
    height: 0,
  });

  function handleAddStage() {
    if (!stageName.trim()) return;
    const newStage: Stage = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
      name: stageName,
      order: project.stages.length + 1,
      items: [],
      readyMixCost: 0,
      readyMixBasedTotalCost: 0,
      materialBasedTotalCost: 0,
    };
    const updated = updateProjectTotals({
      ...project,
      stages: [...project.stages, newStage],
    });
    onUpdate(updated);
    setStageName("");
    setShowAddStage(false);
  }

  function handleDeleteStage(stageId: string) {
    if (!confirm("هل أنت متأكد من حذف هذه المرحلة؟")) return;
    const updated = updateProjectTotals({
      ...project,
      stages: project.stages.filter((s) => s.id !== stageId),
    });
    onUpdate(updated);
    if (selectedStageId === stageId) setSelectedStageId(null);
  }

  function handleAddItem() {
    if (!selectedStageId) return;
    const isAreaBased = ["plastering", "painting", "tiling", "blockwork", "insulation"].includes(itemForm.calcType);
    if (itemForm.length <= 0 || itemForm.width <= 0 || (!isAreaBased && itemForm.height <= 0)) return;

    const materials = getMaterials();
    const item = calculateProjectItem(
      itemForm.calcType,
      0,
      itemForm.length,
      itemForm.width,
      isAreaBased ? 1 : itemForm.height,
      project.exchangeRate,
      project.profitMargin,
      project.overheads,
      materials
    );

    const updatedStages = project.stages.map((stage) => {
      if (stage.id !== selectedStageId) return stage;
      const updated = { ...stage, items: [...stage.items, item] };
      return updateStageTotals(updated);
    });

    const updated = updateProjectTotals({ ...project, stages: updatedStages });
    onUpdate(updated);
    setShowAddItem(false);
    setItemForm({ calcType: "concrete_footing", length: 0, width: 0, height: 0 });
  }

  function handleDeleteItem(stageId: string, itemId: string) {
    const updatedStages = project.stages.map((stage) => {
      if (stage.id !== stageId) return stage;
      const updated = { ...stage, items: stage.items.filter((i) => i.id !== itemId) };
      return updateStageTotals(updated);
    });
    const updated = updateProjectTotals({ ...project, stages: updatedStages });
    onUpdate(updated);
  }

  const selectedCalcType = CALCULATION_TYPES.find((t) => t.id === itemForm.calcType);
  const isAreaBased = ["plastering", "painting", "tiling", "blockwork", "insulation"].includes(itemForm.calcType);

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] mb-4 transition-colors"
      >
        <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
        العودة للمشاريع
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-sm text-[var(--muted)]">
            {project.clientName} - {project.location}
          </p>
        </div>
        <div className="text-left">
          <p className="text-sm text-[var(--muted)]">الإجمالي</p>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(project.materialBasedTotalCost, project.currency)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-4">
          <p className="text-sm text-[var(--muted)]">المراحل</p>
          <p className="text-xl font-bold">{project.stages.length}</p>
        </div>
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-4">
          <p className="text-sm text-[var(--muted)]">هامش الربح</p>
          <p className="text-xl font-bold">{project.profitMargin}%</p>
        </div>
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-4">
          <p className="text-sm text-[var(--muted)]">المصاريف</p>
          <p className="text-xl font-bold">{project.overheads}%</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">المراحل</h2>
        <button
          onClick={() => setShowAddStage(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + إضافة مرحلة
        </button>
      </div>

      {showAddStage && (
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-4 mb-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={stageName}
              onChange={(e) => setStageName(e.target.value)}
              placeholder="اسم المرحلة (مثال: أعمال الأساسات)"
              className="flex-1 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAddStage}
              disabled={!stageName.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm"
            >
              إضافة
            </button>
            <button
              onClick={() => setShowAddStage(false)}
              className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {project.stages.length === 0 ? (
        <div className="text-center py-12 text-[var(--muted)] bg-[var(--card-bg)] border border-[var(--border)] rounded-xl">
          <p>لا توجد مراحل بعد. أضف مرحلة لبدء حساب التكاليف.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {project.stages.map((stage) => (
            <div
              key={stage.id}
              className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 bg-[var(--background)] border-b border-[var(--border)]">
                <div>
                  <h3 className="font-bold">{stage.name}</h3>
                  <p className="text-sm text-[var(--muted)]">
                    {stage.items.length} بنود - {formatCurrency(stage.materialBasedTotalCost, project.currency)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedStageId(stage.id);
                      setShowAddItem(true);
                    }}
                    className="text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1 rounded"
                  >
                    + بند
                  </button>
                  <button
                    onClick={() => handleDeleteStage(stage.id)}
                    className="text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1 rounded"
                  >
                    حذف
                  </button>
                </div>
              </div>

              {stage.items.length > 0 && (
                <div className="p-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border)]">
                        <th className="text-right py-2 px-2 font-medium text-[var(--muted)]">البند</th>
                        <th className="text-right py-2 px-2 font-medium text-[var(--muted)]">الكمية</th>
                        <th className="text-right py-2 px-2 font-medium text-[var(--muted)]">التكلفة</th>
                        <th className="text-right py-2 px-2 font-medium text-[var(--muted)]">إجراء</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stage.items.map((item) => (
                        <tr key={item.id} className="border-b border-[var(--border)] last:border-0">
                          <td className="py-2 px-2 font-medium">{item.itemName}</td>
                          <td className="py-2 px-2">{formatNumber(item.quantity)} {item.unit}</td>
                          <td className="py-2 px-2 font-medium text-blue-600">
                            {formatCurrency(item.materialBasedTotalCost, project.currency)}
                          </td>
                          <td className="py-2 px-2">
                            <button
                              onClick={() => handleDeleteItem(stage.id, item.id)}
                              className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showAddItem && selectedStageId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--card-bg)] rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-bold mb-4">إضافة بند جديد</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">نوع العمل</label>
                <select
                  value={itemForm.calcType}
                  onChange={(e) => setItemForm({ ...itemForm, calcType: e.target.value as CalculationType })}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {CALCULATION_TYPES.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-[var(--muted)] mt-1">{selectedCalcType?.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">الطول (م)</label>
                  <input
                    type="number"
                    value={itemForm.length || ""}
                    onChange={(e) => setItemForm({ ...itemForm, length: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">العرض (م)</label>
                  <input
                    type="number"
                    value={itemForm.width || ""}
                    onChange={(e) => setItemForm({ ...itemForm, width: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                  />
                </div>
                {!isAreaBased && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">الارتفاع / السماكة (م)</label>
                    <input
                      type="number"
                      value={itemForm.height || ""}
                      onChange={(e) => setItemForm({ ...itemForm, height: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="0.01"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddItem}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium"
              >
                حساب وإضافة البند
              </button>
              <button
                onClick={() => setShowAddItem(false)}
                className="px-5 py-2.5 rounded-lg border border-[var(--border)] text-sm"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
