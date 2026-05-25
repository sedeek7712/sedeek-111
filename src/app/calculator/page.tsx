"use client";

import { useState, useMemo } from "react";
import { CALCULATION_TYPES } from "@/lib/constants";
import { calculateProjectItem, formatCurrency, formatNumber } from "@/lib/calculations";
import { getMaterials } from "@/lib/storage";
import { CalculationType, ProjectItem } from "@/lib/types";
import { useHydrated } from "@/lib/useHydrated";

export default function CalculatorPage() {
  const [calcType, setCalcType] = useState<CalculationType>("concrete_footing");
  const [length, setLength] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [exchangeRate, setExchangeRate] = useState<number>(1);
  const [profitMargin, setProfitMargin] = useState<number>(15);
  const [overheads, setOverheads] = useState<number>(5);
  const [currency, setCurrency] = useState("YER");
  const [result, setResult] = useState<ProjectItem | null>(null);
  const hydrated = useHydrated();
  const materials = useMemo(() => (hydrated ? getMaterials() : []), [hydrated]);

  if (!hydrated) return null;

  const selectedType = CALCULATION_TYPES.find((t) => t.id === calcType);
  const isAreaBased = ["plastering", "painting", "tiling", "blockwork", "insulation"].includes(calcType);

  const categories = Array.from(new Set(CALCULATION_TYPES.map((t) => t.category)));

  function handleCalculate() {
    if (length <= 0 || width <= 0 || (!isAreaBased && height <= 0)) return;
    const item = calculateProjectItem(
      calcType,
      0,
      length,
      width,
      isAreaBased ? 1 : height,
      exchangeRate,
      profitMargin,
      overheads,
      materials
    );
    setResult(item);
  }

  function handleReset() {
    setLength(0);
    setWidth(0);
    setHeight(0);
    setResult(null);
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">حاسبة التكاليف</h1>
        <p className="text-[var(--muted)] mt-1">
          حساب تكاليف البنود الإنشائية بناءً على الأبعاد ونوع العمل
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-5">
            <h2 className="text-lg font-bold mb-4">نوع العمل</h2>
            <div className="space-y-3">
              {categories.map((category) => (
                <div key={category}>
                  <p className="text-xs font-medium text-[var(--muted)] mb-2 uppercase">
                    {category}
                  </p>
                  <div className="space-y-1">
                    {CALCULATION_TYPES.filter((t) => t.category === category).map((type) => (
                      <button
                        key={type.id}
                        onClick={() => {
                          setCalcType(type.id);
                          setResult(null);
                        }}
                        className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-colors ${
                          calcType === type.id
                            ? "bg-blue-600 text-white"
                            : "hover:bg-[var(--background)]"
                        }`}
                      >
                        {type.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-5">
            <h2 className="text-lg font-bold mb-1">{selectedType?.name}</h2>
            <p className="text-sm text-[var(--muted)] mb-5">{selectedType?.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-sm font-medium mb-1">
                  الطول (م)
                </label>
                <input
                  type="number"
                  value={length || ""}
                  onChange={(e) => setLength(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  العرض (م)
                </label>
                <input
                  type="number"
                  value={width || ""}
                  onChange={(e) => setWidth(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              {!isAreaBased && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    الارتفاع / السماكة (م)
                  </label>
                  <input
                    type="number"
                    value={height || ""}
                    onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">
                  سعر الصرف
                </label>
                <input
                  type="number"
                  value={exchangeRate || ""}
                  onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  هامش الربح (%)
                </label>
                <input
                  type="number"
                  value={profitMargin || ""}
                  onChange={(e) => setProfitMargin(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="15"
                  min="0"
                  step="0.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  المصاريف الإدارية (%)
                </label>
                <input
                  type="number"
                  value={overheads || ""}
                  onChange={(e) => setOverheads(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="5"
                  min="0"
                  step="0.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">العملة</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="YER">ريال يمني</option>
                  <option value="SAR">ريال سعودي</option>
                  <option value="USD">دولار أمريكي</option>
                  <option value="AED">درهم إماراتي</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCalculate}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors"
              >
                حساب التكلفة
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-2.5 rounded-lg border border-[var(--border)] text-sm hover:bg-[var(--background)] transition-colors"
              >
                إعادة تعيين
              </button>
            </div>
          </div>

          {result && (
            <div className="space-y-4">
              <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-5">
                <h2 className="text-lg font-bold mb-4">نتائج الحساب</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                    <p className="text-xs text-[var(--muted)]">
                      {isAreaBased ? "المساحة" : "الحجم"}
                    </p>
                    <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                      {formatNumber(result.quantity)} {result.unit}
                    </p>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3">
                    <p className="text-xs text-[var(--muted)]">تكلفة المواد</p>
                    <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                      {formatCurrency(result.materialBasedTotalCost, currency)}
                    </p>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
                    <p className="text-xs text-[var(--muted)]">
                      سعر {result.unit} الواحد
                    </p>
                    <p className="text-lg font-bold text-amber-700 dark:text-amber-300">
                      {result.quantity > 0
                        ? formatCurrency(
                            result.materialBasedTotalCost / result.quantity,
                            currency
                          )
                        : "0"}
                    </p>
                  </div>
                </div>

                <h3 className="font-bold text-sm mb-3">تفاصيل المواد</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border)]">
                        <th className="text-right py-2 px-2 font-medium text-[var(--muted)]">
                          المادة
                        </th>
                        <th className="text-right py-2 px-2 font-medium text-[var(--muted)]">
                          الوحدة
                        </th>
                        <th className="text-right py-2 px-2 font-medium text-[var(--muted)]">
                          الكمية المطلوبة
                        </th>
                        <th className="text-right py-2 px-2 font-medium text-[var(--muted)]">
                          الهالك
                        </th>
                        <th className="text-right py-2 px-2 font-medium text-[var(--muted)]">
                          الكمية النهائية
                        </th>
                        <th className="text-right py-2 px-2 font-medium text-[var(--muted)]">
                          سعر الوحدة
                        </th>
                        <th className="text-right py-2 px-2 font-medium text-[var(--muted)]">
                          الإجمالي
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.materials.map((mat) => (
                        <tr
                          key={mat.id}
                          className="border-b border-[var(--border)] last:border-0"
                        >
                          <td className="py-2 px-2 font-medium">
                            {mat.materialName}
                          </td>
                          <td className="py-2 px-2">{mat.unit}</td>
                          <td className="py-2 px-2">
                            {formatNumber(mat.requiredQty)}
                          </td>
                          <td className="py-2 px-2">
                            {formatNumber(mat.wasteQty)}
                          </td>
                          <td className="py-2 px-2">
                            {formatNumber(mat.finalQty)}
                          </td>
                          <td className="py-2 px-2">
                            {formatCurrency(mat.unitPrice, currency)}
                          </td>
                          <td className="py-2 px-2 font-medium">
                            {formatCurrency(mat.totalPrice, currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="font-bold border-t-2 border-[var(--border)]">
                        <td colSpan={6} className="py-2 px-2">
                          الإجمالي (شامل الأرباح والمصاريف)
                        </td>
                        <td className="py-2 px-2 text-blue-600">
                          {formatCurrency(result.materialBasedTotalCost, currency)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {result.readyMixCost > 0 && (
                <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-5">
                  <h3 className="font-bold text-sm mb-3">مقارنة التكاليف</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                      <p className="text-xs text-[var(--muted)]">
                        تكلفة بالمواد (خلط موقعي)
                      </p>
                      <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                        {formatCurrency(result.materialBasedTotalCost, currency)}
                      </p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                      <p className="text-xs text-[var(--muted)]">
                        تكلفة بالخرسانة الجاهزة
                      </p>
                      <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                        {formatCurrency(result.readyMixBasedTotalCost, currency)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
