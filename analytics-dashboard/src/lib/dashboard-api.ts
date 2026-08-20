import { supabase } from "@/lib/supabase";

export type DashboardFilters = {
  startDate: string;
  endDate: string;
  branches: string[];
  sources: string[];
  branchTypes: string[];

  // New optional filters
  expressTypes?: string[];
  services?: string[];
  residencyTypes?: string[];
  bagStatuses?: string[];
  productVariants?: string[];
};

export type DashboardKpis = {
  customers: number;
  orders: number;
  revenueWithVat: number;
  revenueWithoutVat: number;
  newCustomers: number;
  returnCustomers: number;
  otherCustomers: number;
  aov: number;

  // From get_dashboard_kpis_v3, but discount usage should be read from getDashboardDiscountUsage
  promoCustomers?: number;
  nonPromoCustomers?: number;
};

export type DiscountUsage = {
  promoCustomers: number;
  nonPromoCustomers: number;
  promoOrders: number;
  nonPromoOrders: number;
  promoDiscountWithVat: number;
  promoDiscountWithoutVat: number;
};

export type DailyTrendPoint = {
  date: string;
  label: string;
  orders: number;
  customers: number;
  revenue: number;
  revenueWithoutVat: number;
};

export type TopBranchPoint = {
  branch: string;
  orders: number;
  customers: number;
  revenue: number;
  revenueWithoutVat: number;
};

export type SplitSummaryPoint = {
  splitType: "source" | "branch_type";
  name: string;
  orders: number;
  customers: number;
  revenue: number;
  revenueWithoutVat: number;
};

export type ExtraSplitPoint = {
  splitType: "express" | "service" | "residency" | "bag";
  name: string;
  orders: number;
  customers: number;
  revenue: number;
  revenueWithoutVat: number;
};

export type TopItemPoint = {
  productVariant: string;
  quantity: number;
  orders: number;
  customers: number;
  revenue: number;
  revenueWithoutVat: number;
};

function mapSource(source: string) {
  if (source.toLowerCase() === "online") return "Online";
  if (source.toLowerCase() === "offline") return "Offline";
  return source;
}

function mapBranchType(type: string) {
  if (type === "Owned") return "Owned";
  if (type === "Franchise") return "Franchise";
  if (type === "Packages") return "Packages";
  return type;
}

function emptyArrayToNull(values?: string[]) {
  return values && values.length > 0 ? values : null;
}

function prepareFilters(filters: DashboardFilters) {
  const sources =
    filters.sources.length > 0
      ? filters.sources.map(mapSource)
      : null;

  const branchTypes =
    filters.branchTypes.length > 0
      ? filters.branchTypes.map(mapBranchType)
      : null;

  const branches =
    filters.branches.length > 0
      ? filters.branches
      : null;

  return {
    sources,
    branchTypes,
    branches,
    expressTypes: emptyArrayToNull(filters.expressTypes),
    services: emptyArrayToNull(filters.services),
    residencyTypes: emptyArrayToNull(filters.residencyTypes),
    bagStatuses: emptyArrayToNull(filters.bagStatuses),
    productVariants: emptyArrayToNull(filters.productVariants),
  };
}

function buildRpcParams(filters: DashboardFilters) {
  const {
    sources,
    branchTypes,
    branches,
    expressTypes,
    services,
    residencyTypes,
    bagStatuses,
    productVariants,
  } = prepareFilters(filters);

  return {
    p_start_date: filters.startDate,
    p_end_date: filters.endDate,
    p_branches: branches,
    p_sources: sources,
    p_branch_types: branchTypes,
    p_express_types: expressTypes,
    p_services: services,
    p_residency_types: residencyTypes,
    p_bag_statuses: bagStatuses,
    p_product_variants: productVariants,
  };
}

export async function getDashboardKpis(
  filters: DashboardFilters
): Promise<DashboardKpis> {
  const { data, error } = await supabase.rpc(
    "get_dashboard_kpis_v5",
    buildRpcParams(filters)
  );

  if (error) {
    throw error;
  }

  const row = data?.[0];

  return {
    customers: Number(row?.customers ?? 0),
    orders: Number(row?.orders ?? 0),
    revenueWithVat: Number(row?.revenue_with_vat ?? 0),
    revenueWithoutVat: Number(row?.revenue_without_vat ?? 0),
    newCustomers: Number(row?.new_customers ?? 0),
    returnCustomers: Number(row?.return_customers ?? 0),
    otherCustomers: Number(row?.other_customers ?? 0),
    aov: Number(row?.aov ?? 0),
    promoCustomers: Number(row?.promo_customers ?? 0),
    nonPromoCustomers: Number(row?.non_promo_customers ?? 0),
  };
}

export async function getDashboardDiscountUsage(
  filters: DashboardFilters
): Promise<DiscountUsage> {
  const { data, error } = await supabase.rpc(
    "get_dashboard_discount_usage_v4",
    buildRpcParams(filters)
  );

  if (error) {
    throw error;
  }

  const row = data?.[0];

  return {
    promoCustomers: Number(row?.promo_customers ?? 0),
    nonPromoCustomers: Number(row?.non_promo_customers ?? 0),
    promoOrders: Number(row?.promo_orders ?? 0),
    nonPromoOrders: Number(row?.non_promo_orders ?? 0),
    promoDiscountWithVat: Number(row?.promo_discount_with_vat ?? 0),
    promoDiscountWithoutVat: Number(row?.promo_discount_without_vat ?? 0),
  };
}

export async function getDashboardDailyTrend(
  filters: DashboardFilters
): Promise<DailyTrendPoint[]> {
  const { data, error } = await supabase.rpc(
    "get_dashboard_daily_trend_v3",
    buildRpcParams(filters)
  );

  if (error) {
    throw error;
  }

  return (data ?? []).map((row: any) => {
    const date = String(row.date);

    return {
      date,
      label: new Date(date + "T00:00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      orders: Number(row.orders ?? 0),
      customers: Number(row.customers ?? 0),
      revenue: Number(row.revenue_with_vat ?? 0),
      revenueWithoutVat: Number(row.revenue_without_vat ?? 0),
    };
  });
}

export async function getDashboardTopBranches(
  filters: DashboardFilters
): Promise<TopBranchPoint[]> {
  const { data, error } = await supabase.rpc(
    "get_dashboard_top_branches_v2",
    buildRpcParams(filters)
  );

  if (error) {
    throw error;
  }

  return (data ?? []).map((row: any) => ({
    branch: String(row.branch ?? "Unknown"),
    orders: Number(row.orders ?? 0),
    customers: Number(row.customers ?? 0),
    revenue: Number(row.revenue_with_vat ?? 0),
    revenueWithoutVat: Number(row.revenue_without_vat ?? 0),
  }));
}

export async function getDashboardSplitSummary(
  filters: DashboardFilters
): Promise<SplitSummaryPoint[]> {
  const { data, error } = await supabase.rpc(
    "get_dashboard_split_summary_v2",
    buildRpcParams(filters)
  );

  if (error) {
    throw error;
  }

  return (data ?? []).map((row: any) => ({
    splitType: row.split_type,
    name: String(row.segment_name ?? "Unknown"),
    orders: Number(row.orders ?? 0),
    customers: Number(row.customers ?? 0),
    revenue: Number(row.revenue_with_vat ?? 0),
    revenueWithoutVat: Number(row.revenue_without_vat ?? 0),
  }));
}

export async function getDashboardExtraSplits(
  filters: DashboardFilters
): Promise<ExtraSplitPoint[]> {
  const { data, error } = await supabase.rpc(
    "get_dashboard_extra_splits_v3",
    buildRpcParams(filters)
  );

  if (error) {
    throw error;
  }

  return (data ?? []).map((row: any) => ({
    splitType: row.split_type,
    name: String(row.segment_name ?? "Unknown"),
    orders: Number(row.orders ?? 0),
    customers: Number(row.customers ?? 0),
    revenue: Number(row.revenue_with_vat ?? 0),
    revenueWithoutVat: Number(row.revenue_without_vat ?? 0),
  }));
}

export async function getDashboardTopItems(
  filters: DashboardFilters,
  limit = 15
): Promise<TopItemPoint[]> {
  const { data, error } = await supabase.rpc(
    "get_dashboard_top_items_v1",
    {
      ...buildRpcParams(filters),
      p_limit: limit,
    }
  );

  if (error) {
    throw error;
  }

  return (data ?? []).map((row: any) => ({
    productVariant: String(row.product_variant ?? "Unknown"),
    quantity: Number(row.quantity ?? 0),
    orders: Number(row.orders ?? 0),
    customers: Number(row.customers ?? 0),
    revenue: Number(row.revenue_with_vat ?? 0),
    revenueWithoutVat: Number(row.revenue_without_vat ?? 0),
  }));
}

export async function getDashboardProductVariants(): Promise<string[]> {
  const { data, error } = await supabase.rpc("get_dashboard_product_variants");

  if (error) {
    throw error;
  }

  return (data ?? [])
    .map((row: any) => String(row.product_variant ?? ""))
    .filter((productVariant: string) => productVariant.trim() !== "");
}

export async function getDashboardBranches(): Promise<string[]> {
  const { data, error } = await supabase.rpc("get_dashboard_branches");

  if (error) {
    throw error;
  }

  return (data ?? [])
    .map((row: any) => String(row.branch ?? ""))
    .filter((branch: string) => branch.trim() !== "");
}