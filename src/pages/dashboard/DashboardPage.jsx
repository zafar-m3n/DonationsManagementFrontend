import React, { useMemo, useState } from "react";
import DefaultLayout from "@/layouts/DefaultLayout";
import Icon from "@/components/ui/Icon";
import CountUp from "react-countup";
import projects from "@/data/projects";

const FUNDS_ALLOCATED_LKR = 4_500_000; // 3.5M LKR
const TOTAL_ITEMS_DONATED = 7500; // 7500+
const DRY_RATIONS_KG = 500; // 500+ kg
const LAST_UPDATED = "2025-12-09";

const DashboardPage = () => {
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id ?? null);

  // Full-screen lightbox (Gmail style)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxMedia, setLightboxMedia] = useState([]); // [{ kind, src, alt?, description?, platform?, embedId? }]
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxProject, setLightboxProject] = useState(null); // minimal context: title, counts

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId) ?? projects[0],
    [selectedProjectId]
  );

  // Helper: interleave images + videos instead of concatenation
  const buildMixedMedia = (project) => {
    const images = project.images || [];
    const videos = project.videos || [];

    const imgMedia = images.map((img) => ({
      kind: "image",
      src: img.url,
      alt: img.alt ?? project.title,
    }));

    const vidMedia = videos.map((vid) => ({
      kind: "video",
      src: vid.url,
      description: vid.description ?? project.title,
      platform: vid.platform,
      embedId: vid.embedId,
    }));

    const mixed = [];
    const maxLen = Math.max(imgMedia.length, vidMedia.length);

    for (let i = 0; i < maxLen; i += 1) {
      if (imgMedia[i]) mixed.push(imgMedia[i]);
      if (vidMedia[i]) mixed.push(vidMedia[i]);
    }

    return { mixed, imagesCount: images.length, videosCount: videos.length };
  };

  const openGallery = (project) => {
    const { mixed, imagesCount, videosCount } = buildMixedMedia(project);

    if (mixed.length === 0) return; // nothing to show

    setSelectedProjectId(project.id);
    setLightboxMedia(mixed);
    setLightboxIndex(0);
    setLightboxProject({
      title: project.title,
      shortDescription: project.shortDescription,
      imagesCount,
      videosCount,
    });
    setIsLightboxOpen(true);
  };

  const closeGallery = () => {
    setIsLightboxOpen(false);
    setLightboxMedia([]);
    setLightboxIndex(0);
    setLightboxProject(null);
  };

  const stepGallery = (direction) => {
    if (!lightboxMedia.length) return;
    setLightboxIndex((prev) => {
      const total = lightboxMedia.length;
      return (prev + direction + total) % total;
    });
  };

  const jumpToMedia = (index) => {
    setLightboxIndex(index);
  };

  return (
    <DefaultLayout>
      <div className="space-y-8">
        {/* IMPACT STRIP */}
        <section className="space-y-3">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ImpactCard
              label="Total Items Donated"
              icon="mdi:package-variant"
              countTo={TOTAL_ITEMS_DONATED}
              suffix="+"
              description="Food, water, hygiene and medical items."
              colorClass="bg-rose-100 border-rose-200"
            />
            <ImpactCard
              label="Total Funds Allocated / Donated"
              icon="mdi:cash-multiple"
              prefix="LKR"
              countTo={FUNDS_ALLOCATED_LKR}
              description="Channelled into all flood relief projects."
              colorClass="bg-amber-100 border-amber-200"
            />
            <ImpactCard
              label="Total Projects"
              icon="mdi:clipboard-list"
              countTo={projects.length}
              description="Flood relief initiatives completed."
              colorClass="bg-sky-100 border-sky-200"
            />
            <ImpactCard
              label="Dry Rations Distributed"
              icon="mdi:food"
              countTo={DRY_RATIONS_KG}
              suffix="+ kg"
              description="Combined rice, dhal, salt and sugar."
              colorClass="bg-emerald-100 border-emerald-200"
            />
          </div>

          <p className="text-[11px] text-slate-400">Last updated: {LAST_UPDATED}</p>
        </section>

        {/* EMPTY STATE */}
        {(!projects || projects.length === 0) && (
          <p className="text-sm text-slate-500">Projects will appear here once they are added to the system.</p>
        )}

        {/* GRID OF PROJECT CARDS ONLY */}
        {projects && projects.length > 0 && (
          <section className="mt-2 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon icon="mdi:view-grid-outline" width={18} className="text-slate-700" />
                <h2 className="text-sm font-semibold text-slate-900 font-playfair">Flood Relief Projects</h2>
              </div>
              <span className="text-[11px] text-slate-500">Click a card to open gallery</span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {projects.map((project, index) => (
                <ProjectGridCard
                  key={project.id}
                  project={project}
                  index={index}
                  isActive={project.id === selectedProjectId && isLightboxOpen}
                  onOpen={() => openGallery(project)}
                />
              ))}
            </div>
          </section>
        )}

        {/* FULL-SCREEN LIGHTBOX (GMAIL STYLE) */}
        {isLightboxOpen && (
          <LightboxViewer
            project={lightboxProject}
            media={lightboxMedia}
            index={lightboxIndex}
            onClose={closeGallery}
            onNext={() => stepGallery(1)}
            onPrev={() => stepGallery(-1)}
            onJump={jumpToMedia}
          />
        )}
      </div>
    </DefaultLayout>
  );
};

export default DashboardPage;

/* ---------- COMPONENTS BELOW ---------- */

const ImpactCard = ({ label, icon, prefix, countTo, suffix, description, colorClass }) => (
  <div className={`rounded-2xl border ${colorClass} p-4 shadow-sm hover:shadow-md transition-shadow`}>
    <div className="mb-2 flex items-center justify-between">
      <span className="inline-flex items-center rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700 border border-slate-200">
        {label}
      </span>
      <Icon icon={icon} width={20} className="text-slate-700" />
    </div>
    <p className="font-playfair text-2xl font-semibold text-slate-900">
      {prefix && <span className="mr-1 align-middle text-sm">{prefix}</span>}
      <CountUp end={countTo} duration={1.2} separator="," />
      {suffix && <span className="ml-1 align-middle text-sm">{suffix}</span>}
    </p>
    <p className="mt-1 text-xs text-slate-700">{description}</p>
  </div>
);

/* ----- PROJECT GRID CARD (MAIN PAGE) ----- */

const gridColors = [
  "bg-rose-50 border-rose-200",
  "bg-sky-50 border-sky-200",
  "bg-emerald-50 border-emerald-200",
  "bg-amber-50 border-amber-200",
  "bg-violet-50 border-violet-200",
  "bg-teal-50 border-teal-200",
];

const ProjectGridCard = ({ project, index, isActive, onOpen }) => {
  const firstImage = project.images?.[0];
  const colorClass = gridColors[index % gridColors.length];

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`
        group flex h-full flex-col overflow-hidden rounded-3xl border text-left shadow-sm transition-all
        ${colorClass}
        ${isActive ? "ring-2 ring-emerald-400 shadow-md" : "hover:shadow-md hover:border-emerald-300"}
      `}
    >
      {/* Top image/preview */}
      <div className="relative h-40 w-full overflow-hidden">
        {firstImage ? (
          <img
            src={firstImage.url}
            alt={firstImage.alt}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-slate-200" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/40 via-black/10 to-transparent" />

        <div className="pointer-events-none absolute bottom-2 left-2 flex items-center gap-2 rounded-full bg-black/55 px-2 py-1 text-[10px] text-slate-50">
          <Icon icon="mdi:image-multiple" width={14} />
          <span>
            {project.images?.length ?? 0} photos · {project.videos?.length ?? 0} videos
          </span>
        </div>
      </div>

      {/* Text content */}
      <div className="flex flex-1 flex-col justify-between px-4 py-3 md:px-5 md:py-4">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-[10px] font-semibold text-slate-800 shadow-sm">
                {String(project.number).padStart(2, "0")}
              </span>
              <h3 className="font-playfair text-sm font-semibold text-slate-900 md:text-base">{project.title}</h3>
            </div>

            <div className="flex flex-wrap gap-2 text-[11px] text-slate-600">
              {project.date && <span>{project.date}</span>}
              {project.date && project.location && <span>•</span>}
              {project.location && <span>{project.location}</span>}
              {(project.date || project.location) && project.headlineMetric && <span>•</span>}
              {project.headlineMetric && <span>{project.headlineMetric}</span>}
            </div>

            {/* full shortDescription - no truncation */}
            {project.shortDescription && (
              <p className="text-[11px] text-slate-700 text-justify">{project.shortDescription}</p>
            )}
          </div>

          {/* Small chip */}
          <div className="ml-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-1 text-[10px] text-slate-600 border border-slate-200">
              <Icon icon="mdi:open-in-new" width={14} />
              Gallery
            </span>
          </div>
        </div>

        {/* Bottom chips */}
        <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-slate-600">
          {project.images?.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 border border-slate-200">
              <Icon icon="mdi:camera-outline" width={12} />
              <span>{project.images.length} photos</span>
            </span>
          )}
          {project.videos?.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 border border-slate-200">
              <Icon icon="mdi:movie-open-outline" width={12} />
              <span>{project.videos.length} videos</span>
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

/* ----- FULL-SCREEN LIGHTBOX VIEWER (GMAIL STYLE) ----- */

const LightboxViewer = ({ project, media, index, onClose, onNext, onPrev, onJump }) => {
  const current = media[index];

  if (!current) return null;

  const title = project?.title ?? "Project gallery";
  const imagesCount = project?.imagesCount ?? 0;
  const videosCount = project?.videosCount ?? 0;
  const shortDescription = project?.shortDescription ?? "";

  return (
    // OVERLAY: clicking here closes the gallery
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col" onClick={onClose}>
      {/* INNER CONTENT: allow some children to stopPropagation */}
      <div className="flex h-full flex-col">
        {/* TOP BAR (does NOT close on click) */}
        <div
          className="flex items-center justify-between px-4 py-3 text-xs text-slate-100"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Icon icon="mdi:image-multiple" width={16} />
              <span className="font-medium">{title}</span>
            </div>
            <span className="text-[10px] text-slate-300">
              {index + 1} / {media.length} &nbsp;·&nbsp; {imagesCount} photos · {videosCount} videos
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1 rounded-full border border-slate-500/70 px-3 py-1 text-[11px] text-slate-100 hover:bg-slate-700/60"
          >
            <Icon icon="mdi:close" width={14} />
            Close
          </button>
        </div>

        {/* MAIN MEDIA AREA */}
        <div
          className="relative flex flex-1 items-center justify-center px-4"
          // clicking the dark background here should close
          onClick={onClose}
        >
          {/* Prev / next buttons (do NOT close) */}
          {media.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onPrev();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-slate-100 hover:bg-black/80"
              >
                <Icon icon="mdi:chevron-left" width={20} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-slate-100 hover:bg-black/80"
              >
                <Icon icon="mdi:chevron-right" width={20} />
              </button>
            </>
          )}

          <div
            className="max-h-[70vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()} // clicking directly on media shouldn't close
          >
            {current.kind === "image" && (
              <img
                src={current.src}
                alt={current.alt}
                className="max-h-[70vh] max-w-[90vw] rounded-xl object-contain shadow-[0_10px_40px_rgba(0,0,0,0.6)]"
              />
            )}

            {current.kind === "video" && (
              <div className="max-h-[70vh] max-w-[90vw]">
                {current.platform === "youtube" && current.embedId ? (
                  <iframe
                    className="h-[60vh] w-[80vw] max-w-[900px] rounded-xl border border-slate-700/70 bg-black"
                    src={`https://www.youtube.com/embed/${current.embedId}`}
                    title={current.description || title}
                    allowFullScreen
                  />
                ) : (
                  <video
                    controls
                    className="max-h-[70vh] max-w-[90vw] rounded-xl border border-slate-700/70 bg-black object-contain shadow-[0_10px_40px_rgba(0,0,0,0.6)]"
                    src={current.src}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* THUMBNAIL STRIP (do NOT close when clicking thumbnails) */}
        <div className="border-t border-slate-700/70 bg-black/70 px-3 py-2" onClick={(e) => e.stopPropagation()}>
          <div className="flex gap-2 overflow-x-auto">
            {media.map((item, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onJump(i)}
                className={`relative flex h-16 w-24 items-center justify-center overflow-hidden rounded-lg border text-[10px]
                  ${
                    i === index
                      ? "border-emerald-400 ring-2 ring-emerald-400"
                      : "border-slate-600 hover:border-emerald-300"
                  }`}
              >
                {item.kind === "image" ? (
                  <img src={item.src} alt={item.alt} className="h-full w-full object-cover" />
                ) : (
                  <>
                    {item.platform === "youtube" && item.embedId ? (
                      <div className="flex h-full w-full items-center justify-center bg-slate-900">
                        <Icon icon="mdi:play-circle-outline" width={22} className="text-slate-100" />
                      </div>
                    ) : (
                      <video className="h-full w-full object-cover" src={item.src} muted />
                    )}
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/35">
                      <Icon icon="mdi:play-circle-outline" width={22} className="text-white" />
                    </div>
                  </>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
