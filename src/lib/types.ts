export interface Material {
  id: string;
  name: string;
  nameEn: string;
  category: string;
  unit: string;
  basePrice: number;
}

export interface ProjectMaterial {
  id: string;
  materialName: string;
  unit: string;
  unitPrice: number;
  qtyPerUnit: number;
  wastePercent: number;
  requiredQty: number;
  wasteQty: number;
  finalQty: number;
  totalPrice: number;
}

export interface ProjectItem {
  id: string;
  itemName: string;
  unit: string;
  calculationType: CalculationType;
  quantity: number;
  length: number;
  width: number;
  height: number;
  readyMixCost: number;
  readyMixBasedTotalCost: number;
  materialBasedTotalCost: number;
  materials: ProjectMaterial[];
}

export interface Stage {
  id: string;
  name: string;
  order: number;
  items: ProjectItem[];
  readyMixCost: number;
  readyMixBasedTotalCost: number;
  materialBasedTotalCost: number;
}

export interface Project {
  id: string;
  name: string;
  location: string;
  clientName: string;
  clientPhone: string;
  currency: string;
  exchangeRate: number;
  profitMargin: number;
  overheads: number;
  stages: Stage[];
  readyMixCost: number;
  readyMixBasedTotalCost: number;
  materialBasedTotalCost: number;
  createdAt: string;
}

export type CalculationType =
  | "excavation"
  | "backfilling"
  | "concrete_footing"
  | "concrete_columns"
  | "concrete_slabs"
  | "hordi_slab"
  | "plastering"
  | "painting"
  | "tiling"
  | "blockwork"
  | "insulation";

export interface CalculationTypeInfo {
  id: CalculationType;
  name: string;
  nameEn: string;
  unit: string;
  description: string;
  icon: string;
  category: string;
}
