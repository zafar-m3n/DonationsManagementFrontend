import React, { useEffect, useState, useMemo } from "react";
import DefaultLayout from "@/layouts/DefaultLayout";
import API from "@/services/index";
import Icon from "@/components/ui/Icon";
import Modal from "@/components/ui/Modal";
import CountUp from "react-countup";
import Spinner from "@/components/ui/Spinner";

const FUNDS_ALLOCATED_LKR = 3500000; // 3.5M LKR (static for now)

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch dashboard data
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await API.private.getDashboardSummary();
        setSummary(res.data.data);
      } catch (err) {
        console.error("Error fetching dashboard summary:", err);
        setErrorMsg("Unable to load dashboard summary right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  // Max category current quantity for bar scaling
  const maxCategoryTotal = useMemo(() => {
    if (!summary?.categories || summary.categories.length === 0) return 0;
    return Math.max(...summary.categories.map((c) => Number(c.total_quantity_current) || 0));
  }, [summary]);

  const openCategoryModal = (category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const closeCategoryModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  const selectedCategoryQty = Number(selectedCategory?.total_quantity_current) || 0;

  // Pastel color classes (no gradients)
  const pastelCardColors = [
    "bg-rose-100 text-rose-800",
    "bg-sky-100 text-sky-800",
    "bg-emerald-100 text-emerald-800",
    "bg-amber-100 text-amber-800",
    "bg-violet-100 text-violet-800",
    "bg-teal-100 text-teal-800",
  ];

  const pastelBarBg = "bg-slate-100";
  const pastelBarFill = "bg-emerald-200";

  const totals = summary?.totals || {
    total_items: 0,
    total_quantity_current: 0,
    total_quantity_received: 0,
    total_quantity_sent: 0,
  };

  // Safe defaults for the sent breakdown (OUT summary)
  const sentBreakdown = summary?.sent_breakdown || {
    rice_kg_sent: 0,
    dhal_kg_sent: 0,
    salt_kg_sent: 0,
    sugar_kg_sent: 0,
    water_bottles_sent: 0,
    other_essentials_sent: 0,
  };

  return (
    <DefaultLayout>
      <div className="space-y-6">
        {/* ERROR / LOADING STATES */}
        {loading && (
          <div className="my-4">
            <Spinner />
          </div>
        )}

        {!loading && errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

        {!loading && !errorMsg && summary && (
          <>
            {/* TOP SUMMARY CARDS */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className={`rounded-lg p-4 shadow-sm ${pastelCardColors[0]}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs uppercase tracking-wide font-semibold">Total Item Types</span>
                  <Icon icon="mdi:package-variant" width={22} />
                </div>
                <p className="text-2xl font-bold">
                  <CountUp end={totals.total_items} duration={1} />
                </p>
                <p className="text-xs opacity-80 mt-1">Unique items tracked in the system.</p>
              </div>

              <div className={`rounded-lg p-4 shadow-sm ${pastelCardColors[1]}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs uppercase tracking-wide font-semibold">Total Received</span>
                  <Icon icon="mdi:download-box" width={22} />
                </div>
                <p className="text-2xl font-bold">
                  <CountUp end={totals.total_quantity_received} duration={1} separator="," />
                </p>
                <p className="text-xs opacity-80 mt-1">Overall quantity donated to SLMCS.</p>
              </div>

              <div className={`rounded-lg p-4 shadow-sm ${pastelCardColors[3]}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs uppercase tracking-wide font-semibold">Current In Stock</span>
                  <Icon icon="mdi:warehouse" width={22} />
                </div>
                <p className="text-2xl font-bold">
                  <CountUp end={totals.total_quantity_current} duration={1} separator="," />
                </p>
                <p className="text-xs opacity-80 mt-1">Quantity currently available across all categories.</p>
              </div>

              {/* FUNDS CARD (STATIC) */}
              <div className={`rounded-lg p-4 shadow-sm ${pastelCardColors[4]}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs uppercase tracking-wide font-semibold">Funds Allocated</span>
                  <Icon icon="mdi:cash-multiple" width={22} />
                </div>
                <p className="text-2xl font-bold">
                  LKR <CountUp end={FUNDS_ALLOCATED_LKR} duration={1.2} separator="," />
                </p>
                <p className="text-xs opacity-80 mt-1">Donated / allocated towards relief items.</p>
              </div>
            </div>

            {/* DISTRIBUTED (OUT) SUMMARY – REWORKED UI */}
            <section className="mt-6 rounded-2xl bg-linear-to-br from-emerald-900 via-emerald-800 to-emerald-700 text-emerald-50 shadow-lg">
              <div className="px-5 pt-5 pb-4 border-b border-emerald-700/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Icon icon="mdi:hand-heart" width={22} />
                    <h2 className="text-sm font-semibold tracking-wide uppercase">Relief Items Distributed</h2>
                  </div>
                  <p className="mt-1 text-xs text-emerald-100/80 max-w-md">
                    Overview of key items already delivered to beneficiaries: dry rations, water, and other essentials.
                  </p>
                </div>

                {/* Total Distributed Indicator */}
                <div className="sm:text-right">
                  <p className="text-[11px] uppercase tracking-wide text-emerald-200/80 font-semibold">
                    Total Items Distributed
                  </p>
                  <p className="text-2xl font-bold">
                    <CountUp end={totals.total_quantity_sent} duration={1.2} separator="," />{" "}
                    <span className="ml-1 text-xs font-normal text-emerald-100/80">units</span>
                  </p>
                </div>
              </div>

              {/* Pills */}
              <div className="px-5 pb-5 pt-4">
                <div className="grid gap-3 md:grid-cols-3">
                  {/* Column 1: Rice & Dhal */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-xl border border-emerald-600/40 bg-emerald-900/40 px-3 py-2.5 backdrop-blur-sm">
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-emerald-100/90 font-semibold">
                          Rice Distributed
                        </p>
                        <p className="text-[11px] text-emerald-100/70">Total kilograms sent out</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-semibold leading-tight">
                          <CountUp end={sentBreakdown.rice_kg_sent} duration={1.2} separator="," />
                        </p>
                        <p className="text-[10px] text-emerald-100/70">kg</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-emerald-600/30 bg-emerald-900/30 px-3 py-2.5 backdrop-blur-sm">
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-emerald-100/90 font-semibold">
                          Dhal Distributed
                        </p>
                        <p className="text-[11px] text-emerald-100/70">Total kilograms sent out</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-semibold leading-tight">
                          <CountUp end={sentBreakdown.dhal_kg_sent} duration={1.2} separator="," />
                        </p>
                        <p className="text-[10px] text-emerald-100/70">kg</p>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Salt & Sugar */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-xl border border-emerald-600/30 bg-emerald-900/30 px-3 py-2.5 backdrop-blur-sm">
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-emerald-100/90 font-semibold">
                          Salt Distributed
                        </p>
                        <p className="text-[11px] text-emerald-100/70">Total kilograms sent out</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-semibold leading-tight">
                          <CountUp end={sentBreakdown.salt_kg_sent} duration={1.2} separator="," />
                        </p>
                        <p className="text-[10px] text-emerald-100/70">kg</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-emerald-600/40 bg-emerald-900/40 px-3 py-2.5 backdrop-blur-sm">
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-emerald-100/90 font-semibold">
                          Sugar Distributed
                        </p>
                        <p className="text-[11px] text-emerald-100/70">Total kilograms sent out</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-semibold leading-tight">
                          <CountUp end={sentBreakdown.sugar_kg_sent} duration={1.2} separator="," />
                        </p>
                        <p className="text-[10px] text-emerald-100/70">kg</p>
                      </div>
                    </div>
                  </div>

                  {/* Column 3: Water & Other essentials */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-xl border border-emerald-500/40 bg-emerald-900/30 px-3 py-2.5 backdrop-blur-sm">
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-emerald-100/90 font-semibold">
                          Water Bottles
                        </p>
                        <p className="text-[11px] text-emerald-100/70">Distributed units</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-semibold leading-tight">
                          <CountUp end={sentBreakdown.water_bottles_sent} duration={1.2} separator="," />
                        </p>
                        <p className="text-[10px] text-emerald-100/70">bottles</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-emerald-500/40 bg-emerald-900/40 px-3 py-2.5 backdrop-blur-sm">
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-emerald-100/90 font-semibold">
                          Other Essentials
                        </p>
                        <p className="text-[11px] text-emerald-100/70">Mixed medical, hygiene & food</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-semibold leading-tight">
                          <CountUp end={sentBreakdown.other_essentials_sent} duration={1.2} separator="," />
                        </p>
                        <p className="text-[10px] text-emerald-100/70">pcs</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* CATEGORY BREAKDOWN */}
            <div className="mt-4">
              <h2 className="text-lg font-semibold text-slate-800 mb-2">Donations by Category</h2>
              {summary.categories && summary.categories.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {summary.categories.map((cat, index) => {
                    const current = Number(cat.total_quantity_current) || 0;
                    const received = Number(cat.total_quantity_received) || 0;
                    const sent = Number(cat.total_quantity_sent) || 0;
                    const ratio =
                      maxCategoryTotal > 0 ? Math.max(4, Math.round((current / maxCategoryTotal) * 100)) : 0;

                    // Pick pastel color for the badge
                    const colorClass = pastelCardColors[index % pastelCardColors.length];

                    return (
                      <button
                        key={cat.id ?? `cat-${index}`}
                        type="button"
                        onClick={() => openCategoryModal(cat)}
                        className="text-left rounded-lg border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow p-4 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
                            >
                              {cat.name || "Uncategorized"}
                            </span>
                          </div>
                          <Icon icon="mdi:chevron-right" width={20} className="text-slate-400" />
                        </div>

                        <p className="text-sm text-slate-600 mb-2">
                          <span className="font-semibold">{current}</span> in stock •{" "}
                          <span className="font-semibold">{received}</span> received •{" "}
                          <span className="font-semibold">{sent}</span> sent
                        </p>

                        {/* Bar */}
                        <div className={`w-full h-2 rounded-full ${pastelBarBg}`}>
                          <div className={`h-2 rounded-full ${pastelBarFill}`} style={{ width: `${ratio}%` }} />
                        </div>

                        <p className="mt-2 text-xs text-slate-500">Click to view item breakdown.</p>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No categories found yet. Add items to see the breakdown.</p>
              )}
            </div>
          </>
        )}

        {/* CATEGORY MODAL */}
        {selectedCategory && (
          <Modal
            isOpen={isModalOpen}
            onClose={closeCategoryModal}
            title={`Items in ${selectedCategory.name || "Category"}`}
          >
            <div className="space-y-2">
              <p className="text-sm text-slate-600">
                <span className="font-semibold">{selectedCategoryQty}</span> items currently in stock for this category.
              </p>

              {selectedCategory.items && selectedCategory.items.length > 0 ? (
                <div className="max-h-80 overflow-y-auto border border-slate-100 rounded-md">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold text-slate-700">Item</th>
                        <th className="px-3 py-2 text-left font-semibold text-slate-700">Variant</th>
                        <th className="px-3 py-2 text-right font-semibold text-slate-700">Current</th>
                        <th className="px-3 py-2 text-right font-semibold text-slate-700">Received</th>
                        <th className="px-3 py-2 text-right font-semibold text-slate-700">Sent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCategory.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-3 py-2 border-t border-slate-100 text-slate-800">{item.name}</td>
                          <td className="px-3 py-2 border-t border-slate-100 text-slate-500">
                            {item.variant_label || "-"}
                          </td>
                          <td className="px-3 py-2 border-t border-slate-100 text-right">{item.current_quantity}</td>
                          <td className="px-3 py-2 border-t border-slate-100 text-right">
                            {item.total_quantity_received}
                          </td>
                          <td className="px-3 py-2 border-t border-slate-100 text-right">{item.total_quantity_sent}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-slate-500">No items recorded for this category yet.</p>
              )}
            </div>
          </Modal>
        )}
      </div>
    </DefaultLayout>
  );
};

export default DashboardPage;
