import React, { useEffect, useState, useMemo } from "react";
import DefaultLayout from "@/layouts/DefaultLayout";
import API from "@/services/index";
import Icon from "@/components/ui/Icon";
import Modal from "@/components/ui/Modal";

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

  return (
    <DefaultLayout>
      <div className="space-y-6">
        {/* ERROR / LOADING STATES */}
        {loading && <p className="text-sm text-slate-500">Loading dashboard summary…</p>}

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
                <p className="text-2xl font-bold">{totals.total_items}</p>
                <p className="text-xs opacity-80 mt-1">Unique items tracked in the system.</p>
              </div>

              <div className={`rounded-lg p-4 shadow-sm ${pastelCardColors[1]}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs uppercase tracking-wide font-semibold">Total Received</span>
                  <Icon icon="mdi:download-box" width={22} />
                </div>
                <p className="text-2xl font-bold">{totals.total_quantity_received}</p>
                <p className="text-xs opacity-80 mt-1">Overall quantity donated to SLMCS.</p>
              </div>

              <div className={`rounded-lg p-4 shadow-sm ${pastelCardColors[2]}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs uppercase tracking-wide font-semibold">Total Distributed</span>
                  <Icon icon="mdi:upload-box" width={22} />
                </div>
                <p className="text-2xl font-bold">{totals.total_quantity_sent}</p>
                <p className="text-xs opacity-80 mt-1">Items sent out to beneficiaries.</p>
              </div>

              <div className={`rounded-lg p-4 shadow-sm ${pastelCardColors[3]}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs uppercase tracking-wide font-semibold">Current In Stock</span>
                  <Icon icon="mdi:warehouse" width={22} />
                </div>
                <p className="text-2xl font-bold">{totals.total_quantity_current}</p>
                <p className="text-xs opacity-80 mt-1">Quantity currently available across all categories.</p>
              </div>
            </div>

            {/* CATEGORY BREAKDOWN */}
            <div className="mt-4">
              <h2 className="text-lg font-semibold text-slate-800 mb-2">Stock by Category</h2>
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
