import { useEffect, useMemo, useState, type ReactNode } from "react";
import ExcelJS from "exceljs";
import pkg from "file-saver";

const { saveAs } = pkg;
import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Users,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  UserPlus,
  Repeat,
  UserX,
  Receipt,
  Calendar,
  Sparkles,
  Download,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MultiSelect } from "@/components/dashboard/MultiSelect";
import { KpiCard } from "@/components/dashboard/KpiCard";
import {
  getDashboardBranches,
  getDashboardProductVariants,
  getDashboardDailyTrend,
  getDashboardDiscountUsage,
  getDashboardExtraSplits,
  getDashboardKpis,
  getDashboardSplitSummary,
  getDashboardTopBranches,
  getDashboardTopItems,
  type DailyTrendPoint,
  type DashboardKpis,
  type DiscountUsage,
  type ExtraSplitPoint,
  type SplitSummaryPoint,
  type TopBranchPoint,
  type TopItemPoint,
} from "@/lib/dashboard-api";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

const SOURCES = ["Online", "Offline"];
const BRANCH_TYPES = ["Franchise", "Owned", "Packages"];
const EXPRESS_TYPES = ["Express", "Regular"];
const SERVICES = ["Wash", "Iron", "Dry Clean", "Not Captured"];
const RESIDENCY_TYPES = ["Apartment", "Villa", "Not Captured"];
const BAG_STATUSES = ["Has Bag", "No Bag"];

const DEFAULT_START_DATE = "2026-01-01";
const DEFAULT_END_DATE = "2026-05-31";

// n8n webhook that starts the monthly AI customer recommendations workflow.
// Use Production URL later when the workflow is activated.
const AI_MARKETING_REPORT_WEBHOOK_URL =
  import.meta.env.VITE_AI_MARKETING_REPORT_WEBHOOK_URL || "";

const ADVISORY_APP_URL =
  import.meta.env.VITE_ADVISORY_APP_URL || "http://localhost:3000";


type DatePreset =
  | "all"
  | "lastMonth"
  | "last3Months"
  | "q1"
  | "q2ToDate"
  | "custom";

const emptyKpis = {
  customers: 0,
  orders: 0,
  revenue: 0,
  bill: 0,
  newC: 0,
  retC: 0,
  otherC: 0,
  aov: 0,
};

const fmtNum = (n: number) =>
  new Intl.NumberFormat("en-US").format(Math.round(n));

const fmtMoney = (n: number) =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(Math.round(n)) + " ⃁";

function readStringArray(key: string): string[] {
  try {
    const saved = window.localStorage.getItem(key);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function readDate(key: string, fallback: string) {
  const saved = window.localStorage.getItem(key);
  return saved ? parseISO(saved) : parseISO(fallback);
}

function exportFilterValue(selected: string[], allOptions: string[]) {
  if (!selected || selected.length === 0) return "All";
  if (allOptions.length > 0 && selected.length === allOptions.length) return "All";
  return selected.join(" | ");
}

function Dashboard() {
  const [hasMounted, setHasMounted] = useState(false);

  const [branches, setBranches] = useState<string[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [topBranchesSort, setTopBranchesSort] = useState<"desc" | "asc">("desc");
  const [topItemsSortBy, setTopItemsSortBy] = useState<"quantity" | "revenue" | "orders">("quantity");
  const [types, setTypes] = useState<string[]>([]);
  const [expressTypes, setExpressTypes] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [residencyTypes, setResidencyTypes] = useState<string[]>([]);
  const [bagStatuses, setBagStatuses] = useState<string[]>([]);
  const [productVariants, setProductVariants] = useState<string[]>([]);

  const [start, setStart] = useState<Date>(parseISO(DEFAULT_START_DATE));
  const [end, setEnd] = useState<Date>(parseISO(DEFAULT_END_DATE));

  const [datePreset, setDatePreset] = useState<DatePreset>("all");

  const [realKpis, setRealKpis] = useState<DashboardKpis | null>(null);
  const [realDiscountUsage, setRealDiscountUsage] = useState<DiscountUsage | null>(null);
  const [realDailyTrend, setRealDailyTrend] = useState<DailyTrendPoint[]>([]);
  const [realTopBranches, setRealTopBranches] = useState<TopBranchPoint[]>([]);
  const [realSplitSummary, setRealSplitSummary] = useState<SplitSummaryPoint[]>([]);
  const [realExtraSplits, setRealExtraSplits] = useState<ExtraSplitPoint[]>([]);
  const [realTopItems, setRealTopItems] = useState<TopItemPoint[]>([]);
  const [realBranches, setRealBranches] = useState<string[]>([]);
  const [realProductVariants, setRealProductVariants] = useState<string[]>([]);

  const [isLoadingKpis, setIsLoadingKpis] = useState(false);
  const [isLoadingDiscountUsage, setIsLoadingDiscountUsage] = useState(false);
  const [isLoadingCharts, setIsLoadingCharts] = useState(false);
  const [isGeneratingMarketingReport, setIsGeneratingMarketingReport] = useState(false);
  const [isMarketingReportConfirmOpen, setIsMarketingReportConfirmOpen] = useState(false);
  const [marketingReportNotice, setMarketingReportNotice] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [kpiError, setKpiError] = useState<string | null>(null);
  const [topBranchesError, setTopBranchesError] = useState<string | null>(null);
  const [splitSummaryError, setSplitSummaryError] = useState<string | null>(null);
  const [extraSplitsError, setExtraSplitsError] = useState<string | null>(null);
  const [topItemsError, setTopItemsError] = useState<string | null>(null);
  const [discountUsageError, setDiscountUsageError] = useState<string | null>(null);

  const displayedBranches = realBranches;

  const applyDatePreset = (preset: DatePreset) => {
    setDatePreset(preset);

    switch (preset) {
      case "all":
        setStart(parseISO("2026-01-01"));
        setEnd(parseISO("2026-05-31"));
        break;

      case "lastMonth":
        setStart(parseISO("2026-05-01"));
        setEnd(parseISO("2026-05-31"));
        break;

      case "last3Months":
        setStart(parseISO("2026-03-01"));
        setEnd(parseISO("2026-05-31"));
        break;

      case "q1":
        setStart(parseISO("2026-01-01"));
        setEnd(parseISO("2026-03-31"));
        break;

      case "q2ToDate":
        setStart(parseISO("2026-04-01"));
        setEnd(parseISO("2026-05-31"));
        break;

      case "custom":
        break;
    }
  };

  useEffect(() => {
    setBranches(readStringArray("dashboard_branches"));
    setSources(readStringArray("dashboard_sources"));
    setTypes(readStringArray("dashboard_branch_types"));
    setExpressTypes(readStringArray("dashboard_express_types"));
    setServices(readStringArray("dashboard_services"));
    setResidencyTypes(readStringArray("dashboard_residency_types"));
    setBagStatuses(readStringArray("dashboard_bag_statuses"));
    setProductVariants(readStringArray("dashboard_product_variants"));
    setStart(readDate("dashboard_start_date", DEFAULT_START_DATE));
    setEnd(readDate("dashboard_end_date", DEFAULT_END_DATE));
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) return;

    localStorage.setItem("dashboard_start_date", format(start, "yyyy-MM-dd"));
    localStorage.setItem("dashboard_end_date", format(end, "yyyy-MM-dd"));
  }, [hasMounted, start, end]);

  useEffect(() => {
    if (!hasMounted) return;

    localStorage.setItem("dashboard_branches", JSON.stringify(branches));
    localStorage.setItem("dashboard_sources", JSON.stringify(sources));
    localStorage.setItem("dashboard_branch_types", JSON.stringify(types));
    localStorage.setItem("dashboard_express_types", JSON.stringify(expressTypes));
    localStorage.setItem("dashboard_services", JSON.stringify(services));
    localStorage.setItem("dashboard_residency_types", JSON.stringify(residencyTypes));
    localStorage.setItem("dashboard_bag_statuses", JSON.stringify(bagStatuses));
    localStorage.setItem("dashboard_product_variants", JSON.stringify(productVariants));
  }, [hasMounted, branches, sources, types, expressTypes, services, residencyTypes, bagStatuses, productVariants]);

  useEffect(() => {
    let cancelled = false;

    async function loadBranches() {
      try {
        const branchesData = await getDashboardBranches();

        if (!cancelled) {
          setRealBranches(branchesData);
        }
      } catch (error) {
        console.error("Branches load error:", error);

        if (!cancelled) {
          setRealBranches([]);
        }
      }
    }

    async function loadProductVariants() {
      try {
        const productVariantsData = await getDashboardProductVariants();

        if (!cancelled) {
          setRealProductVariants(productVariantsData);
        }
      } catch (error) {
        console.error("Product variants load error:", error);

        if (!cancelled) {
          setRealProductVariants([]);
        }
      }
    }

    loadBranches();
    loadProductVariants();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hasMounted) return;
    if (realBranches.length === 0 || branches.length === 0) return;

    const validBranches = branches.filter((branch) => realBranches.includes(branch));

    if (validBranches.length !== branches.length) {
      setBranches(validBranches);
    }
  }, [hasMounted, realBranches, branches]);

  useEffect(() => {
    if (!hasMounted) return;
    if (realProductVariants.length === 0 || productVariants.length === 0) return;

    const validProductVariants = productVariants.filter((productVariant) =>
      realProductVariants.includes(productVariant)
    );

    if (validProductVariants.length !== productVariants.length) {
      setProductVariants(validProductVariants);
    }
  }, [hasMounted, realProductVariants, productVariants]);

  const activeFilters = useMemo(
    () => ({
      startDate: format(start, "yyyy-MM-dd"),
      endDate: format(end, "yyyy-MM-dd"),
      branches:
        displayedBranches.length > 0 && branches.length === displayedBranches.length
          ? []
          : branches,
      sources: sources.length === SOURCES.length ? [] : sources,
      branchTypes: types.length === BRANCH_TYPES.length ? [] : types,
      expressTypes: expressTypes.length === EXPRESS_TYPES.length ? [] : expressTypes,
      services: services.length === SERVICES.length ? [] : services,
      residencyTypes: residencyTypes.length === RESIDENCY_TYPES.length ? [] : residencyTypes,
      bagStatuses: bagStatuses.length === BAG_STATUSES.length ? [] : bagStatuses,
      productVariants:
        realProductVariants.length > 0 && productVariants.length === realProductVariants.length
          ? []
          : productVariants,
    }),
    [
      start,
      end,
      branches,
      sources,
      types,
      expressTypes,
      services,
      residencyTypes,
      bagStatuses,
      productVariants,
      displayedBranches.length,
      realProductVariants.length,
    ]
  );

  useEffect(() => {
    if (!hasMounted) return;

    let cancelled = false;

    async function loadDashboardData() {
      setIsLoadingKpis(true);
      setIsLoadingDiscountUsage(true);
      setIsLoadingCharts(true);

      // Clear discount cards immediately when filters change so old values are not shown while loading.
      setRealDiscountUsage(null);

      setKpiError(null);
      setTopBranchesError(null);
      setSplitSummaryError(null);
      setExtraSplitsError(null);
      setTopItemsError(null);
      setDiscountUsageError(null);

      try {
        try {
          const kpiData = await getDashboardKpis(activeFilters);

          if (!cancelled) {
            setRealKpis(kpiData);
            setKpiError(null);
          }
        } catch (error) {
          console.error("KPI load error:", error);

          if (!cancelled) {
            setRealKpis(null);
            setKpiError("KPI section failed");
          }
        } finally {
          if (!cancelled) {
            setIsLoadingKpis(false);
          }
        }

        try {
          const discountUsageData = await getDashboardDiscountUsage(activeFilters);

          if (!cancelled) {
            setRealDiscountUsage(discountUsageData);
            setDiscountUsageError(null);
          }
        } catch (error) {
          console.error("Discount usage load error:", error);

          if (!cancelled) {
            setRealDiscountUsage(null);
            setDiscountUsageError("Discount usage failed");
          }
        } finally {
          if (!cancelled) {
            setIsLoadingDiscountUsage(false);
          }
        }

        try {
          const trendData = await getDashboardDailyTrend(activeFilters);

          if (!cancelled) {
            setRealDailyTrend(trendData);
          }
        } catch (error) {
          console.error("Daily trend load error:", error);

          if (!cancelled) {
            setRealDailyTrend([]);
          }
        }

        try {
          const topBranchesData = await getDashboardTopBranches(activeFilters);

          if (!cancelled) {
            setRealTopBranches(topBranchesData);
            setTopBranchesError(null);
          }
        } catch (error) {
          console.error("Top branches load error:", error);

          if (!cancelled) {
            setRealTopBranches([]);
            setTopBranchesError("Top branches failed to load");
          }
        }

        try {
          const splitSummaryData = await getDashboardSplitSummary(activeFilters);

          if (!cancelled) {
            setRealSplitSummary(splitSummaryData);
            setSplitSummaryError(null);
          }
        } catch (error) {
          console.error("Split summary load error:", error);

          if (!cancelled) {
            setRealSplitSummary([]);
            setSplitSummaryError("Split summary failed to load");
          }
        }

        try {
          const extraSplitsData = await getDashboardExtraSplits(activeFilters);

          if (!cancelled) {
            setRealExtraSplits(extraSplitsData);
            setExtraSplitsError(null);
          }
        } catch (error) {
          console.error("Extra splits load error:", error);

          if (!cancelled) {
            setRealExtraSplits([]);
            setExtraSplitsError("Extra splits failed to load");
          }
        }

        try {
          const topItemsData = await getDashboardTopItems(activeFilters, 15);

          if (!cancelled) {
            setRealTopItems(topItemsData);
            setTopItemsError(null);
          }
        } catch (error) {
          console.error("Top items load error:", error);

          if (!cancelled) {
            setRealTopItems([]);
            setTopItemsError("Top items failed to load");
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoadingCharts(false);
        }
      }
    }

    loadDashboardData();

    return () => {
      cancelled = true;
    };
  }, [hasMounted, activeFilters]);

  const displayedKpis = realKpis
    ? {
      customers: realKpis.customers,
      orders: realKpis.orders,
      revenue: realKpis.revenueWithVat,
      bill: realKpis.revenueWithoutVat,
      newC: realKpis.newCustomers,
      retC: realKpis.returnCustomers,
      otherC: realKpis.otherCustomers,
      aov: realKpis.aov,
    }
    : emptyKpis;

  const kpiHint = kpiError
    ? kpiError
    : isLoadingKpis
      ? "Loading..."
      : undefined;

  const discountUsageHint = discountUsageError
    ? discountUsageError
    : isLoadingDiscountUsage
      ? "Loading..."
      : undefined;

  const displayedDailyTrend = realDailyTrend;

  const displayedSourceSplit = realSplitSummary
    .filter((item) => item.splitType === "source")
    .map((item) => ({
      name: item.name,
      value: item.revenue,
    }));

  const displayedTypeSplit = realSplitSummary
    .filter((item) => item.splitType === "branch_type")
    .map((item) => ({
      name: item.name,
      value: item.orders,
    }));

  const displayedDiscountUsage = realDiscountUsage ?? {
    promoCustomers: 0,
    nonPromoCustomers: 0,
    promoOrders: 0,
    nonPromoOrders: 0,
    promoDiscountWithVat: 0,
    promoDiscountWithoutVat: 0,
  };

  const displayedTopItems = useMemo(() => {
    const sortedItems = [...realTopItems];

    sortedItems.sort((a, b) => {
      if (topItemsSortBy === "revenue") {
        return b.revenue - a.revenue;
      }

      if (topItemsSortBy === "orders") {
        return b.orders - a.orders;
      }

      return b.quantity - a.quantity;
    });

    return sortedItems;
  }, [realTopItems, topItemsSortBy]);

  const topItemsTitle =
    topItemsSortBy === "revenue"
      ? "Top Revenue Items"
      : topItemsSortBy === "orders"
        ? "Top Ordered Items"
        : "Top Selling Items";

  const topItemsSubtitle =
    topItemsSortBy === "revenue"
      ? "Ranked by revenue"
      : topItemsSortBy === "orders"
        ? "Ranked by number of orders"
        : "Ranked by quantity sold";

  const displayedExpressSplit = realExtraSplits
    .filter((item) => item.splitType === "express")
    .map((item) => ({ name: item.name, orders: item.orders, revenue: item.revenue }));

  const displayedServiceSplit = realExtraSplits
    .filter((item) => item.splitType === "service")
    .map((item) => ({ name: item.name, orders: item.orders, revenue: item.revenue }));

  const displayedResidencySplit = realExtraSplits
    .filter((item) => item.splitType === "residency")
    .map((item) => ({ name: item.name, orders: item.orders, revenue: item.revenue }));

  const displayedBagSplit = realExtraSplits
    .filter((item) => item.splitType === "bag")
    .map((item) => ({ name: item.name, orders: item.orders, revenue: item.revenue }));

  const displayedTopBranches = useMemo(() => {
    return [...realTopBranches].sort((a, b) =>
      topBranchesSort === "desc"
        ? b.revenue - a.revenue
        : a.revenue - b.revenue
    );
  }, [realTopBranches, topBranchesSort]);

  const topBranchMaxRevenue = useMemo(() => {
    return Math.max(...realTopBranches.map((branch) => branch.revenue), 1);
  }, [realTopBranches]);

  const dashboardContext = useMemo(
    () => ({
      enabled: true,
      dateFrom: format(start, "yyyy-MM-dd"),
      dateTo: format(end, "yyyy-MM-dd"),
      branch: exportFilterValue(branches, displayedBranches),
      source: exportFilterValue(sources, SOURCES),
      branchType: exportFilterValue(types, BRANCH_TYPES),
      express: exportFilterValue(expressTypes, EXPRESS_TYPES),
      service: exportFilterValue(services, SERVICES),
      residency: exportFilterValue(residencyTypes, RESIDENCY_TYPES),
      bag: exportFilterValue(bagStatuses, BAG_STATUSES),
      productVariant: exportFilterValue(productVariants, realProductVariants),
      kpis: {
        customers: displayedKpis.customers,
        orders: displayedKpis.orders,
        grossRevenue: displayedKpis.revenue,
        revenueWithoutVat: displayedKpis.bill,
        oneTimeCustomers: displayedKpis.newC,
        repeatCustomers: displayedKpis.retC,
        otherCustomers: displayedKpis.otherC,
        aov: displayedKpis.aov,
      },
    }),
    [
      start,
      end,
      branches,
      displayedBranches,
      sources,
      types,
      expressTypes,
      services,
      residencyTypes,
      bagStatuses,
      productVariants,
      realProductVariants,
      displayedKpis.customers,
      displayedKpis.orders,
      displayedKpis.revenue,
      displayedKpis.bill,
      displayedKpis.newC,
      displayedKpis.retC,
      displayedKpis.otherC,
      displayedKpis.aov,
      displayedDiscountUsage.promoCustomers,
      displayedDiscountUsage.nonPromoCustomers,
      displayedDiscountUsage.promoOrders,
      displayedDiscountUsage.nonPromoOrders,
      displayedDiscountUsage.promoDiscountWithVat,
      displayedDiscountUsage.promoDiscountWithoutVat,
    ]
  );

  const openAdvisorWithContext = () => {
    try {
      const context = {
        enabled: true,
        dateFrom: format(start, "yyyy-MM-dd"),
        dateTo: format(end, "yyyy-MM-dd"),
        branch: exportFilterValue(branches, displayedBranches),
        source: exportFilterValue(sources, SOURCES),
        branchType: exportFilterValue(types, BRANCH_TYPES),
        express: exportFilterValue(expressTypes, EXPRESS_TYPES),
        service: exportFilterValue(services, SERVICES),
        residency: exportFilterValue(residencyTypes, RESIDENCY_TYPES),
        bag: exportFilterValue(bagStatuses, BAG_STATUSES),
        productVariant: exportFilterValue(productVariants, realProductVariants),

        topItems: displayedTopItems.slice(0, 10),
        discountUsage: displayedDiscountUsage,

        kpis: {
          customers: displayedKpis.customers,
          orders: displayedKpis.orders,
          grossRevenue: displayedKpis.revenue,
          revenueWithoutVat: displayedKpis.bill,
          oneTimeCustomers: displayedKpis.newC,
          repeatCustomers: displayedKpis.retC,
          otherCustomers: displayedKpis.otherC,
          aov: displayedKpis.aov,
        },

        createdAt: new Date().toISOString(),
      };

      console.log("DASHBOARD CONTEXT:", context);

      localStorage.setItem("dashboard_ai_context", JSON.stringify(context));

      const encodedContext = encodeURIComponent(JSON.stringify(context));

      window.location.href = `${ADVISORY_APP_URL}?fromDashboard=1&ctx=${encodedContext}`;
    } catch (error) {
      console.error("Failed to open advisor with context:", error);

      window.location.href = `${ADVISORY_APP_URL}?fromDashboard=1`;
    }
  };

  const openCampaignAdvisorWithContext = () => {
    try {
      const context = {
        enabled: true,
        analysisMode: "campaign_analysis",
        requestedAction: "analyze_campaigns",

        dateFrom: format(start, "yyyy-MM-dd"),
        dateTo: format(end, "yyyy-MM-dd"),

        branch: exportFilterValue(branches, displayedBranches),
        source: exportFilterValue(sources, SOURCES),
        branchType: exportFilterValue(types, BRANCH_TYPES),
        express: exportFilterValue(expressTypes, EXPRESS_TYPES),
        service: exportFilterValue(services, SERVICES),
        residency: exportFilterValue(residencyTypes, RESIDENCY_TYPES),
        bag: exportFilterValue(bagStatuses, BAG_STATUSES),
        productVariant: exportFilterValue(productVariants, realProductVariants),

        campaignInstruction:
          "حلل الحملات الإعلانية المتاحة ضمن فترة الداشبورد الحالية. استخدم marketing_campaigns مع sales_data. اربط أداء الإعلان بالمبيعات والخصومات وAOV، ثم أعطني قرارًا عمليًا للفترة القادمة. لا تعط تقرير أرقام فقط.",

        kpis: {
          customers: displayedKpis.customers,
          orders: displayedKpis.orders,
          grossRevenue: displayedKpis.revenue,
          revenueWithoutVat: displayedKpis.bill,
          oneTimeCustomers: displayedKpis.newC,
          repeatCustomers: displayedKpis.retC,
          otherCustomers: displayedKpis.otherC,
          aov: displayedKpis.aov,
        },

        createdAt: new Date().toISOString(),
      };

      console.log("CAMPAIGN ANALYSIS CONTEXT:", context);

      localStorage.setItem("dashboard_ai_context", JSON.stringify(context));

      const encodedContext = encodeURIComponent(JSON.stringify(context));

      window.location.href = `${ADVISORY_APP_URL}?fromDashboard=1&mode=campaign_analysis&ctx=${encodedContext}`;
    } catch (error) {
      console.error("Failed to open campaign advisor with context:", error);

      window.location.href = `${ADVISORY_APP_URL}?fromDashboard=1&mode=campaign_analysis`;
    }
  };

  const triggerAiMarketingReportWorkflow = async () => {
    if (isGeneratingMarketingReport) return;

    setIsMarketingReportConfirmOpen(false);
    setMarketingReportNotice(null);
    setIsGeneratingMarketingReport(true);

    try {
      const payload = {
        source: "laundry_dashboard",
        action: "generate_ai_customer_marketing_report",
        dateFrom: format(start, "yyyy-MM-dd"),
        dateTo: format(end, "yyyy-MM-dd"),
        filters: {
          branch: exportFilterValue(branches, displayedBranches),
          source: exportFilterValue(sources, SOURCES),
          branchType: exportFilterValue(types, BRANCH_TYPES),
          express: exportFilterValue(expressTypes, EXPRESS_TYPES),
          service: exportFilterValue(services, SERVICES),
          residency: exportFilterValue(residencyTypes, RESIDENCY_TYPES),
          bag: exportFilterValue(bagStatuses, BAG_STATUSES),
          productVariant: exportFilterValue(productVariants, realProductVariants),
        },
        kpis: {
          customers: displayedKpis.customers,
          orders: displayedKpis.orders,
          grossRevenue: displayedKpis.revenue,
          revenueWithoutVat: displayedKpis.bill,
          oneTimeCustomers: displayedKpis.newC,
          repeatCustomers: displayedKpis.retC,
          aov: displayedKpis.aov,
        },
        createdAt: new Date().toISOString(),
      };

      const response = await fetch(AI_MARKETING_REPORT_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(errorText || `Webhook failed with status ${response.status}`);
      }

      setMarketingReportNotice({
        type: "success",
        message: "تم تشغيل تقرير توصيات العملاء بنجاح. سيتم إرسال التقرير عبر البريد عند الانتهاء.",
      });
    } catch (error) {
      console.error("Failed to trigger AI marketing report workflow:", error);
      setMarketingReportNotice({
        type: "error",
        message: "لم يتم تشغيل تقرير توصيات العملاء. يرجى المحاولة مرة أخرى أو التواصل مع مسؤول النظام.",
      });
    } finally {
      setIsGeneratingMarketingReport(false);
    }
  };

  const customerMix = useMemo(
    () => [
      { name: "One-time Customers", value: displayedKpis.newC },
      { name: "Repeat Customers", value: displayedKpis.retC },
    ],
    [displayedKpis.newC, displayedKpis.retC]
  );

  const PIE_COLORS = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
  ];

  const exportExcel = async () => {
    const workbook = new ExcelJS.Workbook();

    workbook.creator = "Laundry Dashboard";
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet("Dashboard", {
      views: [{ state: "frozen", ySplit: 1 }],
    });

    // ===== Column Width =====
    worksheet.columns = [
      { width: 30 },
      { width: 20 },
      { width: 20 },
      { width: 25 },
      { width: 25 },
    ];

    // ===== Title =====
    worksheet.mergeCells("A1:E1");

    const titleCell = worksheet.getCell("A1");

    titleCell.value = "Laundry Performance Dashboard";

    titleCell.font = {
      size: 22,
      bold: true,
      color: { argb: "FFFFFF" },
    };

    titleCell.alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    titleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "111827" },
    };

    worksheet.getRow(1).height = 35;

    // ===== Filters =====
    worksheet.addRow([]);
    worksheet.addRow(["Start Date", format(start, "yyyy-MM-dd")]);
    worksheet.addRow(["End Date", format(end, "yyyy-MM-dd")]);
    worksheet.addRow(["Branches", exportFilterValue(branches, displayedBranches)]);
    worksheet.addRow(["Sources", exportFilterValue(sources, SOURCES)]);
    worksheet.addRow(["Branch Types", exportFilterValue(types, BRANCH_TYPES)]);
    worksheet.addRow(["Express", exportFilterValue(expressTypes, EXPRESS_TYPES)]);
    worksheet.addRow(["Services", exportFilterValue(services, SERVICES)]);
    worksheet.addRow(["Residency", exportFilterValue(residencyTypes, RESIDENCY_TYPES)]);
    worksheet.addRow(["Bag", exportFilterValue(bagStatuses, BAG_STATUSES)]);
    worksheet.addRow(["Product Variant", exportFilterValue(productVariants, realProductVariants)]);
    worksheet.addRow([]);

    // ===== Section Helper =====
    const addSectionTitle = (title: string) => {
      const row = worksheet.addRow([title]);

      row.font = {
        bold: true,
        size: 15,
        color: { argb: "FFFFFF" },
      };

      row.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "0F766E" },
      };

      row.height = 24;

      return row;
    };

    const styleHeader = (row: any) => {
      row.font = {
        bold: true,
        color: { argb: "FFFFFF" },
      };

      row.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "1E293B" },
      };

      row.alignment = {
        horizontal: "center",
        vertical: "middle",
      };
    };

    // ===== KPI =====
    addSectionTitle("KPI Summary");

    const kpiHeader = worksheet.addRow(["Metric", "Value"]);

    styleHeader(kpiHeader);

    [
      ["Customers", displayedKpis.customers],
      ["Orders", displayedKpis.orders],
      ["Gross Revenue With VAT", displayedKpis.revenue],
      ["Revenue Without VAT", displayedKpis.bill],
      ["One-time Customers", displayedKpis.newC],
      ["Repeat Customers", displayedKpis.retC],
      ["Other Customers", displayedKpis.otherC],
      ["AOV", displayedKpis.aov],
      ["Promo Customers", displayedDiscountUsage.promoCustomers],
      ["Non Promo Customers", displayedDiscountUsage.nonPromoCustomers],
      ["Promo Orders", displayedDiscountUsage.promoOrders],
      ["Non Promo Orders", displayedDiscountUsage.nonPromoOrders],
      ["Promocode Discount Value With VAT", displayedDiscountUsage.promoDiscountWithVat],
      ["Promocode Discount Value Without VAT", displayedDiscountUsage.promoDiscountWithoutVat],
    ].forEach((item) => {
      worksheet.addRow(item);
    });

    worksheet.addRow([]);

    // ===== Daily Trend =====
    addSectionTitle("Daily Trend");

    const dailyHeader = worksheet.addRow([
      "Date",
      "Orders",
      "Customers",
      "Revenue With VAT",
      "Revenue Without VAT",
    ]);

    styleHeader(dailyHeader);

    displayedDailyTrend.forEach((item) => {
      worksheet.addRow([
        item.date,
        item.orders,
        item.customers,
        item.revenue,
        item.revenueWithoutVat,
      ]);
    });

    worksheet.addRow([]);

    // ===== Top Branches =====
    addSectionTitle("Top Branches");

    const topHeader = worksheet.addRow([
      "Branch",
      "Orders",
      "Customers",
      "Revenue With VAT",
      "Revenue Without VAT",
    ]);

    styleHeader(topHeader);

    displayedTopBranches.forEach((item) => {
      worksheet.addRow([
        item.branch,
        item.orders,
        item.customers,
        item.revenue,
        item.revenueWithoutVat,
      ]);
    });

    worksheet.addRow([]);

    // ===== Source Split =====
    addSectionTitle("Source Split");

    const sourceHeader = worksheet.addRow(["Source", "Revenue With VAT"]);

    styleHeader(sourceHeader);

    displayedSourceSplit.forEach((item) => {
      worksheet.addRow([item.name, item.value]);
    });

    worksheet.addRow([]);

    // ===== Branch Type =====
    addSectionTitle("Branch Type Split");

    const typeHeader = worksheet.addRow(["Branch Type", "Orders"]);

    styleHeader(typeHeader);

    displayedTypeSplit.forEach((item) => {
      worksheet.addRow([item.name, item.value]);
    });

    worksheet.addRow([]);

    // ===== Top Items =====
    addSectionTitle("Top Items");

    const itemHeader = worksheet.addRow([
      "Product Variant",
      "Quantity",
      "Orders",
      "Customers",
      "Revenue With VAT",
    ]);

    styleHeader(itemHeader);

    displayedTopItems.forEach((item) => {
      worksheet.addRow([
        item.productVariant,
        item.quantity,
        item.orders,
        item.customers,
        item.revenue,
      ]);
    });

    worksheet.addRow([]);

    // ===== Extra Splits =====
    addSectionTitle("Extra Splits");

    const extraHeader = worksheet.addRow([
      "Split Type",
      "Name",
      "Orders",
      "Customers",
      "Revenue With VAT",
    ]);

    styleHeader(extraHeader);

    realExtraSplits.forEach((item) => {
      worksheet.addRow([
        item.splitType,
        item.name,
        item.orders,
        item.customers,
        item.revenue,
      ]);
    });

    // ===== Borders =====
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin", color: { argb: "374151" } },
          left: { style: "thin", color: { argb: "374151" } },
          bottom: { style: "thin", color: { argb: "374151" } },
          right: { style: "thin", color: { argb: "374151" } },
        };

        cell.alignment = {
          vertical: "middle",
        };
      });
    });

    // ===== Currency Formatting =====
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        if (typeof cell.value === "number") {
          cell.numFmt = "#,##0";
        }
      });
    });

    // ===== Export =====
    const buffer = await workbook.xlsx.writeBuffer();

    saveAs(
      new Blob([buffer]),
      `Laundry Dashboard ${format(start, "yyyy-MM-dd")} to ${format(end, "yyyy-MM-dd")}.xlsx`
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />

        <div className="relative max-w-[1600px] mx-auto px-6 py-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-primary font-semibold">
              <Sparkles className="h-3 w-3" />
              Live Analytics
            </div>

            <h1 className="mt-2 text-4xl md:text-5xl font-bold tracking-tight">
              Laundry Performance <span className="text-primary">Dashboard</span>
            </h1>

            <p className="mt-2 text-muted-foreground max-w-2xl">
              Interactive insights across {displayedBranches.length} branches — filter, drill down, and export.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={openAdvisorWithContext}
              variant="default"
              className="gap-2 cursor-pointer hover:scale-105 transition-all duration-200"
            >
              <Sparkles className="h-4 w-4" />
              حلل بالذكاء الاصطناعي
            </Button>
            <Button
              onClick={openCampaignAdvisorWithContext}
              variant="outline"
              className="gap-2 cursor-pointer hover:scale-105 transition-all duration-200 border-emerald-400/70 text-emerald-300 bg-transparent hover:bg-emerald-500/15 hover:text-emerald-200"
            >
              <Sparkles className="h-4 w-4" />
              تحليل الحملات
            </Button>
            <Button
              onClick={() => setIsMarketingReportConfirmOpen(true)}
              disabled={isGeneratingMarketingReport}
              variant="outline"
              className="gap-2 cursor-pointer hover:scale-105 transition-all duration-200 border-sky-400/70 text-sky-300 bg-transparent hover:bg-sky-500/15 hover:text-sky-200 disabled:opacity-60 disabled:hover:scale-100"
            >
              <Sparkles className="h-4 w-4" />
              {isGeneratingMarketingReport ? "جاري تشغيل التقرير..." : "توصيات العملاء AI"}
            </Button>
            <Button
              onClick={exportExcel}
              variant="secondary"
              className="gap-2 cursor-pointer hover:scale-105 transition-all duration-200"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-8 space-y-8">
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 rounded-2xl border border-border/60 bg-card/40 backdrop-blur p-4">
          <MultiSelect
            label="Branch"
            options={displayedBranches}
            selected={branches}
            onChange={setBranches}
            accentClass="bg-destructive text-destructive-foreground"
          />

          <MultiSelect
            label="Source"
            options={SOURCES}
            selected={sources}
            onChange={setSources}
            accentClass="bg-primary text-primary-foreground"
          />

          <MultiSelect
            label="Branch Type"
            options={BRANCH_TYPES}
            selected={types}
            onChange={setTypes}
            accentClass="bg-[var(--chart-4)] text-background"
          />

          <MultiSelect
            label="Express"
            options={EXPRESS_TYPES}
            selected={expressTypes}
            onChange={setExpressTypes}
            accentClass="bg-[var(--chart-2)] text-background"
          />

          <MultiSelect
            label="Service"
            options={SERVICES}
            selected={services}
            onChange={setServices}
            accentClass="bg-[var(--chart-3)] text-background"
          />

          <MultiSelect
            label="Residency"
            options={RESIDENCY_TYPES}
            selected={residencyTypes}
            onChange={setResidencyTypes}
            accentClass="bg-[var(--chart-5)] text-background"
          />

          <MultiSelect
            label="Bag"
            options={BAG_STATUSES}
            selected={bagStatuses}
            onChange={setBagStatuses}
            accentClass="bg-accent text-accent-foreground"
          />

          <MultiSelect
            label="Product Variant"
            options={realProductVariants}
            selected={productVariants}
            onChange={setProductVariants}
            accentClass="bg-[var(--chart-1)] text-background"
          />

          <div className="flex flex-col rounded-xl overflow-hidden border border-border/60 shadow-sm bg-card lg:col-span-4">
            <div className="bg-card text-foreground text-center text-[11px] font-bold uppercase tracking-[0.2em] py-2 border-b border-border/60">
              Duration
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[minmax(260px,360px)_1fr] gap-3 p-3">
              <select
                value={datePreset}
                onChange={(e) => applyDatePreset(e.target.value as DatePreset)}
                className="w-full rounded-lg border border-border/70 bg-secondary/40 px-3 py-2 text-sm font-semibold text-foreground outline-none transition-all cursor-pointer hover:border-primary/50 focus:border-primary"
              >
                <option value="all">كامل البيانات</option>
                <option value="lastMonth">آخر شهر متوفر - مايو</option>
                <option value="last3Months">آخر 3 أشهر - مارس إلى مايو</option>
                <option value="q1">Q1 - يناير إلى مارس</option>
                <option value="q2ToDate">Q2 حتى الآن - أبريل إلى مايو</option>
                <option value="custom">فترة مخصصة</option>
              </select>

              {datePreset === "custom" ? (
                <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border/60 bg-border/60">
                  <DateBox
                    label="Start"
                    date={start}
                    onChange={(date) => {
                      setDatePreset("custom");
                      setStart(date);
                    }}
                  />
                  <DateBox
                    label="End"
                    date={end}
                    onChange={(date) => {
                      setDatePreset("custom");
                      setEnd(date);
                    }}
                  />
                </div>
              ) : (
                <div className="rounded-lg border border-border/60 bg-secondary/20 px-3 py-2 text-center text-xs font-semibold tabular-nums text-muted-foreground md:flex md:items-center md:justify-center">
                  {format(start, "yyyy-MM-dd")} → {format(end, "yyyy-MM-dd")}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard
            label="Customers"
            value={fmtNum(displayedKpis.customers)}
            hint={kpiHint}
            icon={<Users className="h-5 w-5" />}
            accent="primary"
          />

          <KpiCard
            label="Orders"
            value={fmtNum(displayedKpis.orders)}
            hint={kpiHint}
            icon={<ShoppingBag className="h-5 w-5" />}
            accent="chart3"
          />

          <KpiCard
            label="Gross Revenue"
            value={fmtMoney(displayedKpis.revenue)}
            hint={kpiHint}
            icon={<TrendingUp className="h-5 w-5" />}
            accent="chart4"
          />

          <KpiCard
            label="Revenue Without VAT"
            value={fmtMoney(displayedKpis.bill)}
            hint={kpiHint}
            icon={<DollarSign className="h-5 w-5" />}
            accent="accent"
          />

          <KpiCard
            label="One-time Customers"
            value={fmtNum(displayedKpis.newC)}
            hint={kpiHint}
            icon={<UserPlus className="h-5 w-5" />}
            accent="primary"
          />

          <KpiCard
            label="Repeat Customers"
            value={fmtNum(displayedKpis.retC)}
            hint={kpiHint}
            icon={<Repeat className="h-5 w-5" />}
            accent="chart3"
          />

          <KpiCard
            label="Other"
            value={fmtNum(displayedKpis.otherC)}
            hint={kpiHint}
            icon={<UserX className="h-5 w-5" />}
            accent="chart5"
          />

          <KpiCard
            label="AOV"
            value={fmtMoney(displayedKpis.aov)}
            hint={kpiHint}
            icon={<Receipt className="h-5 w-5" />}
            accent="accent"
          />

          <KpiCard
            label="Promo Customers"
            value={isLoadingDiscountUsage ? "…" : fmtNum(displayedDiscountUsage.promoCustomers)}
            hint={discountUsageHint}
            icon={<Sparkles className="h-5 w-5" />}
            accent="primary"
          />

          <KpiCard
            label="Non Promo Customers"
            value={isLoadingDiscountUsage ? "…" : fmtNum(displayedDiscountUsage.nonPromoCustomers)}
            hint={discountUsageHint}
            icon={<Users className="h-5 w-5" />}
            accent="chart3"
          />

          <KpiCard
            label="Promocode Discount Value"
            value={isLoadingDiscountUsage ? "…" : fmtMoney(displayedDiscountUsage.promoDiscountWithVat)}
            hint={
              discountUsageHint ??
              `Without VAT: ${fmtMoney(displayedDiscountUsage.promoDiscountWithoutVat)}`
            }
            icon={<DollarSign className="h-5 w-5" />}
            accent="chart4"
          />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ChartCard
            title="Revenue Trend"
            subtitle="Daily across selected period"
            className="lg:col-span-2"
          >
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={displayedDailyTrend}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickFormatter={(v) => `$${(Number(v) / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelStyle={tooltipLabelStyle}
                  itemStyle={tooltipItemStyle}
                  formatter={(v: number) => fmtMoney(v)}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  fill="url(#rev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Customer Mix" subtitle="One-time Customers vs Repeat Customers">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={customerMix}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={4}
                >
                  {customerMix.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>

                <Tooltip
                  contentStyle={tooltipStyle}
                  labelStyle={tooltipLabelStyle}
                  itemStyle={tooltipItemStyle}
                  formatter={(v: number) => fmtNum(v)}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </section>

        <section>
          <Tabs defaultValue="branches">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 w-full max-w-6xl h-auto">
              <TabsTrigger value="branches">Top Branches</TabsTrigger>
              <TabsTrigger value="items">Top Items</TabsTrigger>
              <TabsTrigger value="source">Source Split</TabsTrigger>
              <TabsTrigger value="type">Branch Type</TabsTrigger>
              <TabsTrigger value="express">Express</TabsTrigger>
              <TabsTrigger value="service">Service</TabsTrigger>
              <TabsTrigger value="residency">Residency</TabsTrigger>
              <TabsTrigger value="bag">Bag</TabsTrigger>
            </TabsList>

            <TabsContent value="branches">
              <ChartCard title="Top Branches by Revenue" subtitle="Click a branch to filter">
                {topBranchesError ? (
                  <EmptyState message={topBranchesError} />
                ) : (
                  <ScrollArea className="h-[420px] pr-3">
                    <div className="space-y-2">
                      <div className="mb-3 flex justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            setTopBranchesSort((current) =>
                              current === "desc" ? "asc" : "desc"
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition-all duration-200 hover:bg-primary/20 hover:border-primary hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
                        >
                          {topBranchesSort === "desc"
                            ? "عرض الأقل إيرادًا ↑"
                            : "عرض الأعلى إيرادًا ↓"}
                        </button>
                      </div>
                      {displayedTopBranches.map((b, i) => {
                        const pct = (b.revenue / topBranchMaxRevenue) * 100;
                        const active = branches.includes(b.branch);

                        return (
                          <button
                            key={b.branch}
                            onClick={() =>
                              setBranches(
                                active
                                  ? branches.filter((x) => x !== b.branch)
                                  : [...branches, b.branch]
                              )
                            }
                            className={`w-full text-left rounded-lg border p-3 transition-all hover:border-primary ${active ? "border-primary bg-primary/10" : "border-border/60 bg-card"
                              }`}
                          >
                            <div className="flex items-center justify-between gap-4 text-sm">
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="text-xs text-muted-foreground tabular-nums w-6">
                                  {i + 1}
                                </span>
                                <span className="font-medium truncate">{b.branch}</span>
                              </div>

                              <div className="flex items-center gap-4 shrink-0 tabular-nums text-xs">
                                <span className="text-muted-foreground">
                                  {fmtNum(b.orders)} orders
                                </span>
                                <span className="font-bold text-primary">
                                  {fmtMoney(b.revenue)}
                                </span>
                              </div>
                            </div>

                            <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-primary to-[var(--chart-3)]"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </button>
                        );
                      })}

                      {!isLoadingCharts && displayedTopBranches.length === 0 && (
                        <EmptyState message="No top branches data for this filter." />
                      )}
                    </div>
                  </ScrollArea>
                )}
              </ChartCard>
            </TabsContent>


            <TabsContent value="items">
              <ChartCard title={topItemsTitle} subtitle={topItemsSubtitle}>
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Sort by:
                  </span>

                  <Button
                    type="button"
                    size="sm"
                    variant={topItemsSortBy === "quantity" ? "default" : "outline"}
                    onClick={() => setTopItemsSortBy("quantity")}
                    className="h-8 rounded-full text-xs"
                  >
                    Qty
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant={topItemsSortBy === "revenue" ? "default" : "outline"}
                    onClick={() => setTopItemsSortBy("revenue")}
                    className="h-8 rounded-full text-xs"
                  >
                    Revenue
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant={topItemsSortBy === "orders" ? "default" : "outline"}
                    onClick={() => setTopItemsSortBy("orders")}
                    className="h-8 rounded-full text-xs"
                  >
                    Orders
                  </Button>
                </div>

                {topItemsError ? (
                  <EmptyState message={topItemsError} />
                ) : displayedTopItems.length === 0 ? (
                  <EmptyState message="No top items data for this filter." />
                ) : (
                  <ScrollArea className="h-[420px] pr-3">
                    <div className="space-y-2">
                      {displayedTopItems.map((item, i) => (
                        <div
                          key={item.productVariant}
                          className="rounded-lg border border-border/60 bg-card p-3"
                        >
                          <div className="flex items-center justify-between gap-4 text-sm">
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="text-xs text-muted-foreground tabular-nums w-6">
                                {i + 1}
                              </span>
                              <span className="font-medium truncate">{item.productVariant}</span>
                            </div>

                            <div className="flex flex-wrap items-center justify-end gap-4 shrink-0 tabular-nums text-xs">
                              <span className="text-muted-foreground">
                                Qty {fmtNum(item.quantity)}
                              </span>
                              <span className="text-muted-foreground">
                                {fmtNum(item.orders)} orders
                              </span>
                              <span className="font-bold text-primary">
                                {fmtMoney(item.revenue)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </ChartCard>
            </TabsContent>

            <TabsContent value="source">
              <ChartCard title="Revenue by Source" subtitle="Online vs Offline">
                {splitSummaryError ? (
                  <EmptyState message={splitSummaryError} />
                ) : displayedSourceSplit.length === 0 ? (
                  <EmptyState message="No source split data for this filter." />
                ) : (
                  <ResponsiveContainer width="100%" height={380}>
                    <PieChart>
                      <Pie
                        data={displayedSourceSplit}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={140}
                        label={(e) => `${e.name}: ${fmtMoney(e.value as number)}`}
                      >
                        {displayedSourceSplit.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i]} />
                        ))}
                      </Pie>

                      <Tooltip
                        contentStyle={tooltipStyle}
                        labelStyle={tooltipLabelStyle}
                        itemStyle={tooltipItemStyle}
                        formatter={(v: number) => fmtMoney(v)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </TabsContent>

            <TabsContent value="type">
              <ChartCard title="Orders by Branch Type" subtitle="Franchise vs Owned vs Packages">
                {splitSummaryError ? (
                  <EmptyState message={splitSummaryError} />
                ) : displayedTypeSplit.length === 0 ? (
                  <EmptyState message="No branch type data for this filter." />
                ) : (
                  <ResponsiveContainer width="100%" height={380}>
                    <BarChart data={displayedTypeSplit}>
                      <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                      <XAxis dataKey="name" stroke="var(--muted-foreground)" />
                      <YAxis stroke="var(--muted-foreground)" tickFormatter={fmtNum} />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        labelStyle={tooltipLabelStyle}
                        itemStyle={tooltipItemStyle}
                        formatter={(v: number) => fmtNum(v)}
                      />

                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {displayedTypeSplit.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i + 1]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </TabsContent>

            <TabsContent value="express">
              <SimpleBarChart
                title="Orders by Express Type"
                subtitle="Express vs Regular"
                data={displayedExpressSplit}
                error={extraSplitsError}
              />
            </TabsContent>

            <TabsContent value="service">
              <SimpleBarChart
                title="Orders by Service"
                subtitle="Wash vs Iron vs Dry Clean"
                data={displayedServiceSplit}
                error={extraSplitsError}
              />
            </TabsContent>

            <TabsContent value="residency">
              <SimpleBarChart
                title="Orders by Residency"
                subtitle="Apartment vs Villa vs Not Captured"
                data={displayedResidencySplit}
                error={extraSplitsError}
              />
            </TabsContent>

            <TabsContent value="bag">
              <SimpleBarChart
                title="Orders by Bag Status"
                subtitle="Has Bag vs No Bag"
                data={displayedBagSplit}
                error={extraSplitsError}
              />
            </TabsContent>
          </Tabs>
        </section>

        <ChartCard title="Orders & Customers" subtitle="Daily volume">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={displayedDailyTrend}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} />
              <Tooltip
                contentStyle={tooltipStyle}
                labelStyle={tooltipLabelStyle}
                itemStyle={tooltipItemStyle}
                formatter={(v: number) => fmtNum(v)}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="var(--chart-2)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="customers"
                stroke="var(--chart-3)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <footer className="text-center text-xs text-muted-foreground pt-4 pb-8">
          {displayedDailyTrend.length.toLocaleString()} days • {format(start, "MMM d, yyyy")} – {format(end, "MMM d, yyyy")}
        </footer>


        {marketingReportNotice && (
          <div className="fixed bottom-6 left-1/2 z-50 w-[min(92vw,520px)] -translate-x-1/2 rounded-2xl border border-border/70 bg-card/95 p-4 shadow-2xl backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <div className="text-right">
                <p
                  className={`text-sm font-bold ${marketingReportNotice.type === "success" ? "text-emerald-300" : "text-red-300"
                    }`}
                >
                  {marketingReportNotice.type === "success" ? "تم تشغيل التقرير" : "تعذر تشغيل التقرير"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{marketingReportNotice.message}</p>
              </div>
              <button
                type="button"
                onClick={() => setMarketingReportNotice(null)}
                className="rounded-lg px-2 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {isMarketingReportConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-3xl border border-sky-400/25 bg-slate-950 p-6 text-right shadow-2xl shadow-sky-950/40">
              <div className="mb-5 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setIsMarketingReportConfirmOpen(false)}
                  className="rounded-xl border border-white/10 px-3 py-1 text-sm text-muted-foreground transition hover:bg-white/10 hover:text-white"
                >
                  إغلاق
                </button>
                <div>
                  <p className="text-lg font-bold text-white">تشغيل تقرير توصيات العملاء</p>
                  <p className="mt-1 text-sm text-sky-200/80">AI Customer Marketing Recommendations</p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-slate-200">
                سيتم إنشاء تقرير توصيات العملاء بناءً على آخر بيانات محدثة في النظام، ثم إرسال التقرير إلى البريد الإلكتروني عند الانتهاء.
                <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-slate-300">
                  <div className="rounded-xl bg-black/25 p-3">
                    <div className="text-slate-500">حالة البيانات</div>
                    <div className="font-semibold text-white">
                      جاهزة للتحليل
                    </div>
                  </div>
                  <div className="rounded-xl bg-black/25 p-3">
                    <div className="text-slate-500">العملاء</div>
                    <div className="font-semibold text-white">{fmtNum(displayedKpis.customers)}</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-row-reverse gap-3">
                <Button
                  type="button"
                  onClick={triggerAiMarketingReportWorkflow}
                  disabled={isGeneratingMarketingReport}
                  className={`
    flex-1 gap-2 bg-sky-500 text-white transition-all
    ${isGeneratingMarketingReport
                      ? "cursor-not-allowed opacity-60"
                      : "cursor-pointer hover:scale-[1.02] hover:bg-sky-400 active:scale-[0.98]"
                    }
  `}
                >
                  <Sparkles className="h-4 w-4" />
                  {isGeneratingMarketingReport ? "جاري التشغيل..." : "تشغيل التقرير"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsMarketingReportConfirmOpen(false)}
                  disabled={isGeneratingMarketingReport}
                  className="flex-1 border-white/15 bg-transparent text-slate-200 hover:bg-white/10"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

const tooltipStyle = {
  backgroundColor: "#0f172a",
  border: "1px solid rgba(255,255,255,0.18)",
  borderRadius: 10,
  color: "#ffffff",
  fontSize: 12,
  boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
};

const tooltipLabelStyle = {
  color: "#ffffff",
  fontWeight: 700,
};

const tooltipItemStyle = {
  color: "#ffffff",
};

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-[320px] items-center justify-center rounded-xl border border-dashed border-border/70 text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function DateBox({
  label,
  date,
  onChange,
}: {
  label: string;
  date: Date;
  onChange: (d: Date) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="bg-card text-foreground text-sm py-3 px-2 flex flex-col items-center justify-center gap-1 hover:bg-secondary transition h-full">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {label}
          </span>
          <span className="font-semibold tabular-nums">{format(date, "M/d/yyyy")}</span>
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0">
        <CalendarPicker
          mode="single"
          selected={date}
          defaultMonth={date}
          onSelect={(d) => d && onChange(d)}
        />
      </PopoverContent>
    </Popover>
  );
}


function SimpleBarChart({
  title,
  subtitle,
  data,
  error,
}: {
  title: string;
  subtitle: string;
  data: { name: string; orders: number; revenue: number }[];
  error?: string | null;
}) {
  return (
    <ChartCard title={title} subtitle={subtitle}>
      {error ? (
        <EmptyState message={error} />
      ) : data.length === 0 ? (
        <EmptyState message="No data for this filter." />
      ) : (
        <ResponsiveContainer width="100%" height={380}>
          <BarChart data={data}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" tickFormatter={fmtNum} />
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={tooltipLabelStyle}
              itemStyle={tooltipItemStyle}
              formatter={(v: number, name: string) =>
                name === "revenue" ? fmtMoney(v) : fmtNum(v)
              }
            />
            <Legend />
            <Bar dataKey="orders" radius={[8, 8, 0, 0]} fill="var(--chart-2)" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-border/60 bg-card p-5 ${className ?? ""}`}>
      <div className="mb-4">
        <h3 className="text-base font-semibold">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>

      {children}
    </div>
  );
}
