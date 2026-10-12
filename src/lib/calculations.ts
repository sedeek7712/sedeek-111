import { CalculationType, Material, ProjectItem, ProjectMaterial, Stage, Project } from "./types";
import { DEFAULT_MATERIALS, MATERIAL_RATIOS } from "./constants";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function getMaterialById(id: string, materials: Material[]): Material | undefined {
  return materials.find((m) => m.id === id);
}

export function calculateVolume(
  calcType: CalculationType,
  length: number,
  width: number,
  height: number
): number {
  switch (calcType) {
    case "excavation":
    case "backfilling":
    case "concrete_footing":
    case "concrete_columns":
    case "concrete_slabs":
    case "hordi_slab":
      return length * width * height;
    case "plastering":
    case "painting":
    case "tiling":
    case "blockwork":
    case "insulation":
      return length * width;
    default:
      return length * width * height;
  }
}

export function calculateProjectItem(
  calcType: CalculationType,
  quantity: number,
  length: number,
  width: number,
  height: number,
  exchangeRate: number,
  profitMargin: number,
  overheads: number,
  materials: Material[] = DEFAULT_MATERIALS
): ProjectItem {
  const volume = calculateVolume(calcType, length, width, height);
  const ratios = MATERIAL_RATIOS[calcType] || [];

  const projectMaterials: ProjectMaterial[] = ratios.map((ratio) => {
    const mat = getMaterialById(ratio.materialId, materials);
    if (!mat) {
      return {
        id: generateId(),
        materialName: "غير معروف",
        unit: "",
        unitPrice: 0,
        qtyPerUnit: ratio.qtyPerUnit,
        wastePercent: ratio.wastePercent,
        requiredQty: 0,
        wasteQty: 0,
        finalQty: 0,
        totalPrice: 0,
      };
    }

    let requiredQty: number;

    switch (calcType) {
      case "excavation":
        requiredQty = volume * 1.25;
        break;
      case "backfilling":
        requiredQty = volume * 1.2;
        break;
      case "concrete_footing":
        if (mat.name.includes("حديد")) {
          requiredQty = volume * 0.09;
        } else {
          requiredQty = volume * ratio.qtyPerUnit;
        }
        break;
      case "concrete_columns":
        if (mat.name.includes("حديد")) {
          requiredQty = volume * 0.13;
        } else {
          requiredQty = volume * ratio.qtyPerUnit;
        }
        break;
      case "concrete_slabs":
        if (mat.name.includes("حديد")) {
          requiredQty = volume * 0.11;
        } else {
          requiredQty = volume * ratio.qtyPerUnit;
        }
        break;
      case "hordi_slab":
        if (mat.name.includes("بلوك")) {
          requiredQty = volume * 12.5;
        } else if (mat.name.includes("حديد")) {
          requiredQty = volume * 0.08;
        } else {
          requiredQty = volume * ratio.qtyPerUnit;
        }
        break;
      default:
        requiredQty = volume * ratio.qtyPerUnit;
        break;
    }

    if (mat.name.includes("أسلاك")) {
      const steelRatio = ratios.find((r) => {
        const steelMat = getMaterialById(r.materialId, materials);
        return steelMat?.name.includes("حديد");
      });
      if (steelRatio) {
        const steelQty = volume * steelRatio.qtyPerUnit;
        requiredQty = steelQty * 0.008 * 1000;
      }
    }

    const wasteQty = requiredQty * (ratio.wastePercent / 100);
    const finalQty = requiredQty + wasteQty;
    const priceInBaseCurrency = mat.basePrice * exchangeRate;
    const totalPrice = finalQty * priceInBaseCurrency;

    return {
      id: generateId(),
      materialName: mat.name,
      unit: mat.unit,
      unitPrice: mat.basePrice,
      qtyPerUnit: ratio.qtyPerUnit,
      wastePercent: ratio.wastePercent,
      requiredQty: Math.round(requiredQty * 100) / 100,
      wasteQty: Math.round(wasteQty * 100) / 100,
      finalQty: Math.round(finalQty * 100) / 100,
      totalPrice: Math.round(totalPrice * 100) / 100,
    };
  });

  const subTotal = projectMaterials.reduce((sum, m) => sum + m.totalPrice, 0);
  const overheadsCost = subTotal * (overheads / 100);
  const profitCost = (subTotal + overheadsCost) * (profitMargin / 100);
  const materialBasedTotalCost = subTotal + overheadsCost + profitCost;

  const readyMixMaterial = projectMaterials.find((m) => m.materialName.includes("جاهزة"));
  const readyMixCost = readyMixMaterial?.totalPrice ?? 0;

  const otherMaterialsCost = projectMaterials
    .filter((m) => !isConcreteMaterial(m.materialName) && !m.materialName.includes("جاهزة"))
    .reduce((sum, m) => sum + m.totalPrice, 0);

  const readyMixBasedTotalCost = readyMixCost + otherMaterialsCost + overheadsCost + profitCost;

  const calcTypeNames: Record<CalculationType, string> = {
    excavation: "أعمال الحفر",
    backfilling: "أعمال الردم",
    concrete_footing: "خرسانة القواعد",
    concrete_columns: "خرسانة الأعمدة",
    concrete_slabs: "خرسانة السقوف",
    hordi_slab: "أسقف هوردي",
    plastering: "أعمال البياض",
    painting: "أعمال الدهانات",
    tiling: "أعمال البلاط",
    blockwork: "أعمال البلوك",
    insulation: "أعمال العزل",
  };

  const isAreaBased = ["plastering", "painting", "tiling", "blockwork", "insulation"].includes(calcType);

  return {
    id: generateId(),
    itemName: calcTypeNames[calcType],
    unit: isAreaBased ? "م2" : "م3",
    calculationType: calcType,
    quantity: Math.round(volume * 100) / 100,
    length,
    width,
    height,
    readyMixCost: Math.round(readyMixCost * 100) / 100,
    readyMixBasedTotalCost: Math.round(readyMixBasedTotalCost * 100) / 100,
    materialBasedTotalCost: Math.round(materialBasedTotalCost * 100) / 100,
    materials: projectMaterials,
  };
}

export function updateStageTotals(stage: Stage): Stage {
  return {
    ...stage,
    readyMixCost: stage.items.reduce((sum, i) => sum + i.readyMixCost, 0),
    readyMixBasedTotalCost: stage.items.reduce((sum, i) => sum + i.readyMixBasedTotalCost, 0),
    materialBasedTotalCost: stage.items.reduce((sum, i) => sum + i.materialBasedTotalCost, 0),
  };
}

export function updateProjectTotals(project: Project): Project {
  return {
    ...project,
    readyMixCost: project.stages.reduce((sum, s) => sum + s.readyMixCost, 0),
    readyMixBasedTotalCost: project.stages.reduce((sum, s) => sum + s.readyMixBasedTotalCost, 0),
    materialBasedTotalCost: project.stages.reduce((sum, s) => sum + s.materialBasedTotalCost, 0),
  };
}

function isConcreteMaterial(materialName: string): boolean {
  const name = materialName.toLowerCase();
  return (
    name.includes("إسمنت") ||
    name.includes("cement") ||
    name.includes("رمل") ||
    name.includes("sand") ||
    name.includes("حصى") ||
    name.includes("gravel") ||
    name.includes("ماء") ||
    name.includes("water")
  );
}

export function formatCurrency(amount: number, currency: string = "YER"): string {
  const symbols: Record<string, string> = {
    YER: "ر.ي",
    SAR: "ر.س",
    USD: "$",
    AED: "د.إ",
  };
  const formatted = new Intl.NumberFormat("ar-SA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${formatted} ${symbols[currency] || currency}`;
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("ar-SA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}
