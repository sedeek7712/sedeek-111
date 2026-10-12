"use client";

import { useState, useMemo } from "react";
import { getMaterials, saveMaterials } from "@/lib/storage";
import { Material } from "@/lib/types";
import { formatNumber } from "@/lib/calculations";
import { useHydrated } from "@/lib/useHydrated";

export default function MaterialsPage() {
  const hydrated = useHydrated();
  const initialMaterials = useMemo(() => (hydrated ? getMaterials() : []), [hydrated]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    name: "",
    nameEn: "",
    category: "عام",
    unit: "",
    basePrice: 0,
  });

  const displayMaterials = materials.length > 0 ? materials : initialMaterials;

  if (!hydrated) return null;

  const categories = Array.from(new Set(displayMaterials.map((m) => m.category)));

  function handleUpdatePrice(id: string, newPrice: number) {
    const updated = displayMaterials.map((m) =>
      m.id === id ? { ...m, basePrice: newPrice } : m
    );
    setMaterials(updated);
    saveMaterials(updated);
    setEditingId(null);
  }

  function handleAddMaterial() {
    if (!newMaterial.name || !newMaterial.unit) return;
    const mat: Material = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
      name: newMaterial.name,
      nameEn: newMaterial.nameEn,
      category: newMaterial.category,
      unit: newMaterial.unit,
      basePrice: newMaterial.basePrice,
    };
    const updated = [...displayMaterials, mat];
    setMaterials(updated);
    saveMaterials(updated);
    setShowAdd(false);
    setNewMaterial({ name: "", nameEn: "", category: "عام", unit: "", basePrice: 0 });
  }

  function handleDeleteMaterial(id: string) {
    if (!confirm("هل أنت متأكد من حذف هذه المادة؟")) return;
    const updated = displayMaterials.filter((m) => m.id !== id);
    setMaterials(updated);
    saveMaterials(updated);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">أسعار المواد</h1>
          <p className="text-[var(--muted)] mt-1">
            إدارة أسعار المواد الإنشائية المستخدمة في الحسابات
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors"
        >
          + مادة جديدة
        </button>
      </div>

      {showAdd && (
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">إضافة مادة جديدة</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">اسم المادة</label>
              <input
                type="text"
                value={newMaterial.name}
                onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">الاسم بالإنجليزية</label>
              <input
                type="text"
                value={newMaterial.nameEn}
                onChange={(e) => setNewMaterial({ ...newMaterial, nameEn: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">التصنيف</label>
              <input
                type="text"
                value={newMaterial.category}
                onChange={(e) => setNewMaterial({ ...newMaterial, category: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">الوحدة</label>
              <input
                type="text"
                value={newMaterial.unit}
                onChange={(e) => setNewMaterial({ ...newMaterial, unit: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="م3، طن، كجم..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">السعر</label>
              <input
                type="number"
                value={newMaterial.basePrice || ""}
                onChange={(e) => setNewMaterial({ ...newMaterial, basePrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAddMaterial}
              disabled={!newMaterial.name || !newMaterial.unit}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium"
            >
              إضافة
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="px-5 py-2 rounded-lg border border-[var(--border)] text-sm"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {categories.map((category) => (
        <div key={category} className="mb-6">
          <h2 className="text-lg font-bold mb-3">{category}</h2>
          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--background)] border-b border-[var(--border)]">
                  <th className="text-right py-3 px-4 font-medium text-[var(--muted)]">المادة</th>
                  <th className="text-right py-3 px-4 font-medium text-[var(--muted)]">الاسم بالإنجليزية</th>
                  <th className="text-right py-3 px-4 font-medium text-[var(--muted)]">الوحدة</th>
                  <th className="text-right py-3 px-4 font-medium text-[var(--muted)]">السعر</th>
                  <th className="text-right py-3 px-4 font-medium text-[var(--muted)]">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {displayMaterials
                  .filter((m) => m.category === category)
                  .map((material) => (
                    <tr key={material.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-3 px-4 font-medium">{material.name}</td>
                      <td className="py-3 px-4 text-[var(--muted)]">{material.nameEn}</td>
                      <td className="py-3 px-4">{material.unit}</td>
                      <td className="py-3 px-4">
                        {editingId === material.id ? (
                          <input
                            type="number"
                            defaultValue={material.basePrice}
                            onBlur={(e) => handleUpdatePrice(material.id, parseFloat(e.target.value) || 0)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleUpdatePrice(material.id, parseFloat((e.target as HTMLInputElement).value) || 0);
                              }
                            }}
                            className="w-24 px-2 py-1 rounded border border-blue-400 bg-[var(--background)] text-sm focus:outline-none"
                            autoFocus
                          />
                        ) : (
                          <span
                            onClick={() => setEditingId(material.id)}
                            className="cursor-pointer hover:text-blue-600"
                          >
                            {formatNumber(material.basePrice)}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingId(material.id)}
                            className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-1 rounded"
                            title="تعديل السعر"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteMaterial(material.id)}
                            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded"
                            title="حذف"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
