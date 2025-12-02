import React, { useEffect, useState, useMemo } from "react";
import DefaultLayout from "@/layouts/DefaultLayout";
import API from "@/services/index";
import Icon from "@/components/ui/Icon";

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [expandedCategoryIds, setExpandedCategoryIds] = useState([]);

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

  const maxCategoryTotal = useMemo(() => {
    if (!summary?.perCategory || summary.perCategory.length === 0) return 0;
    return Math.max(...summary.perCategory.map((c) => Number(c.totalQuantity) || 0));
  }, [summary]);

  const toggleCategory = (categoryId) => {
    setExpandedCategoryIds((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    );
  };

  return (
    <DefaultLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800 flex items-center gap-2">
            <Icon icon="mdi:charity" width={30} className="text-emerald-500" />
            SLMCS Donation Dashboard
          </h1>
          <p className="text-sm text-slate-500">Live overview of items collected from generous donors.</p>
        </div>

        {/* LOADING / ERROR */}
        {loading && (
          <div className="w-full py-16 flex justify-center">
            <p className="text-slate-500 text-lg">Loading dashboard...</p>
          </div>
        )}

        {!loading && errorMsg && (
          <div className="w-full py-8">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{errorMsg}</div>
          </div>
        )}

        {/* MAIN CONTENT */}
        {!loading && !errorMsg && summary && (
          <div className="space-y-6">
            {/* TOP STATS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Total donations */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-emerald-700 font-semibold">
                    Total Donation Records
                  </p>
                  <p className="mt-2 text-3xl font-bold text-emerald-900">{summary?.totals?.totalDonations ?? 0}</p>
                  <p className="mt-1 text-xs text-emerald-700">Number of separate donation entries recorded.</p>
                </div>
                <div className="p-3 rounded-full bg-white shadow-inner">
                  <Icon icon="mdi:clipboard-list-outline" width={32} className="text-emerald-500" />
                </div>
              </div>

              {/* Total items */}
              <div className="bg-sky-50 border border-sky-100 rounded-xl p-5 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-sky-700 font-semibold">Total Items Collected</p>
                  <p className="mt-2 text-3xl font-bold text-sky-900">{summary?.totals?.totalItemsQuantity ?? 0}</p>
                  <p className="mt-1 text-xs text-sky-700">Sum of all quantities across every category.</p>
                </div>
                <div className="p-3 rounded-full bg-white shadow-inner">
                  <Icon icon="mdi:cube-outline" width={32} className="text-sky-500" />
                </div>
              </div>
            </div>

            {/* DONATIONS BY CATEGORY — NOW TWO COLUMNS */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <Icon icon="mdi:chart-bar-stacked" width={24} className="text-indigo-500" />
                  Donations by Category
                </h2>
                <span className="text-xs text-slate-400">Quantities grouped by category</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {summary.perCategory.map((cat) => {
                  const qty = Number(cat.totalQuantity) || 0;
                  const percentage = maxCategoryTotal > 0 ? Math.round((qty / maxCategoryTotal) * 100) : 0;
                  const isExpanded = expandedCategoryIds.includes(cat.categoryId);

                  return (
                    <div key={cat.categoryId} className="bg-slate-50 rounded-lg border border-slate-100">
                      {/* Category row */}
                      <button
                        type="button"
                        onClick={() => toggleCategory(cat.categoryId)}
                        className="w-full flex items-center justify-between px-3 py-2 text-left"
                      >
                        <div className="flex items-center gap-2">
                          <Icon
                            icon={isExpanded ? "mdi:chevron-down" : "mdi:chevron-right"}
                            width={18}
                            className="text-slate-500"
                          />
                          <span className="w-2 h-2 rounded-full bg-linear-to-r from-pink-300 via-sky-300 to-emerald-300" />
                          <p className="text-sm font-medium text-slate-800">{cat.categoryName}</p>
                        </div>
                        <p className="text-sm font-semibold text-slate-700">{qty}</p>
                      </button>

                      {/* Progress bar */}
                      <div className="px-3 pb-2">
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-2 rounded-full bg-linear-to-r from-pink-200 via-sky-200 to-emerald-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Expanded item list */}
                      {isExpanded && (
                        <div className="border-t border-slate-100 bg-white px-3 py-2">
                          {cat.items?.length > 0 ? (
                            <ul className="space-y-1 max-h-52 overflow-y-auto pr-1">
                              {cat.items.map((item) => (
                                <li
                                  key={item.itemId}
                                  className="flex items-center justify-between text-xs sm:text-sm py-1"
                                >
                                  <span className="text-slate-700">{item.itemName}</span>
                                  <span className="font-semibold text-slate-900">{item.totalQuantity ?? 0}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-slate-500">No items recorded under this category yet.</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </DefaultLayout>
  );
};

export default DashboardPage;
