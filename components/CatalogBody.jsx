// components/CatalogBody.jsx
"use client";

import React from "react";
import { inr, prettyName } from "../lib/format";
import { hasUnitControl } from "../lib/visibility";
import { lineTotal } from "../lib/calculations";

const getSector = (it) =>
  it?.sector_type ||
  it?.sectorType ||
  it?.sector ||
  it?.industry ||
  it?.amc_sector_type ||
  "";

const getTypeKey = (it) =>
  (it?.amc_type_name ||
    it?.amc_type ||
    it?.service_type ||
    it?.amc_sub_type_name ||
    it?.amc_sub_type ||
    "").trim();

const FIXED_SECTORS = ["Commercial", "Residential", "Industrial"];
const DEFAULT_SECTOR = "Commercial";

export default function CatalogBody({
  styles,
  search,
  setSearch,
  catalogLoading,
  catalogError,
  filteredCatalog,
  onAdd,
  onRemove,
  isAdded,
  retry,
  addLabel,
  selectedLines = [],
  onClearAll,
  sectors,
  activeSector,
  setActiveSector,
  allItems,
}) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);

  React.useEffect(() => {
    if (!dropdownOpen) return;
    const onClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [dropdownOpen]);

  const [localSector, setLocalSector] = React.useState(DEFAULT_SECTOR);
  const usingParentSector =
    typeof activeSector === "string" && typeof setActiveSector === "function";
  const sectorValue = usingParentSector ? activeSector : localSector;
  const changeSector = usingParentSector ? setActiveSector : setLocalSector;

  const [typesValue, setTypesValue] = React.useState([]);

  const derivedSectors = React.useMemo(() => {
    const list =
      Array.isArray(sectors) && sectors.length > 0 ? sectors : FIXED_SECTORS;
    return list.filter((s) => s && s !== "All");
  }, [sectors]);

  const derivedTypes = React.useMemo(() => {
    const source =
      Array.isArray(allItems) && allItems.length > 0
        ? allItems
        : Array.isArray(filteredCatalog)
          ? filteredCatalog
          : [];

    const scoped =
      sectorValue && sectorValue !== "All"
        ? source.filter((it) => getSector(it) === sectorValue)
        : source;

    const counts = new Map();
    scoped.forEach((it) => {
      const key = getTypeKey(it);
      if (!key) return;
      counts.set(key, (counts.get(key) || 0) + 1);
    });

    return [
      { key: "All", label: "All types", count: scoped.length },
      ...Array.from(counts.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([key, count]) => ({ key, label: key, count })),
    ];
  }, [allItems, filteredCatalog, sectorValue]);

  const visibleCatalog = React.useMemo(() => {
    const base = Array.isArray(filteredCatalog) ? filteredCatalog : [];
    return base.filter((it) => {
      const matchSector =
        sectorValue === "All" || !sectorValue || getSector(it) === sectorValue;
      const key = getTypeKey(it);
      const matchType =
        typesValue.length === 0 || (key && typesValue.includes(key));
      return matchSector && matchType;
    });
  }, [filteredCatalog, sectorValue, typesValue]);

  const isAll = typesValue.length === 0;

  const toggleType = (key) => {
    setTypesValue((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const selectedTotal = selectedLines.reduce((sum, line) => {
    const { total } = lineTotal(line, line.selectedDuration);
    return sum + total;
  }, 0);

  const hasSelectedTotal = selectedLines.some((line) => {
    const { hasPayable } = lineTotal(line, line.selectedDuration);
    return hasPayable;
  });

  /* ── Collapsed by default ─────────────────────────────────────────── */
  const [selectedOpen, setSelectedOpen] = React.useState(false);

  return (
    <>
      <div className={styles.catalogFilters}>
        {derivedSectors.length > 0 && (
          <div className={styles.catalogSectorButtons}>
            {derivedSectors.map((s) => {
              const active = sectorValue === s;
              return (
                <button
                  key={s}
                  type="button"
                  className={`${styles.catalogSectorButton} ${
                    active ? styles["catalogSectorButton--active"] : ""
                  }`}
                  onClick={() => changeSector(s)}
                  aria-pressed={active}
                >
                  <span
                    className={styles.catalogSectorButton__dot}
                    aria-hidden="true"
                  />
                  {s}
                </button>
              );
            })}
          </div>
        )}

        {derivedTypes.length > 0 && (
          <div className={styles.catalogDropdown} ref={dropdownRef}>
            <button
              type="button"
              className={styles.catalogDropdown__trigger}
              onClick={() => setDropdownOpen((v) => !v)}
              aria-expanded={dropdownOpen}
            >
              <span>
                {isAll
                  ? "All types"
                  : typesValue.length === 1
                    ? typesValue[0]
                    : `${typesValue.length} types selected`}
              </span>
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                <path
                  d="M2.5 4.5 6 8l3.5-3.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {dropdownOpen && (
              <div className={styles.catalogDropdown__menu}>
                <label className={styles.catalogDropdown__item}>
                  <input
                    type="checkbox"
                    checked={isAll}
                    onChange={() => setTypesValue([])}
                  />
                  <span>All types</span>
                  <em>{derivedTypes[0]?.count ?? 0}</em>
                </label>

                {derivedTypes.slice(1).map((t) => (
                  <label key={t.key} className={styles.catalogDropdown__item}>
                    <input
                      type="checkbox"
                      checked={typesValue.includes(t.key)}
                      onChange={() => toggleType(t.key)}
                    />
                    <span>{t.label}</span>
                    <em>{t.count}</em>
                  </label>
                ))}

                {!isAll && (
                  <button
                    type="button"
                    className={styles.catalogDropdown__clear}
                    onClick={() => setTypesValue([])}
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        <div className={styles.catalogSearch}>
          <span className={styles.catalogSearch__icon}>⌕</span>
          <input
            type="text"
            placeholder="Search by name or code…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className={styles.catalogSearch__clear}
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {typesValue.length > 0 && (
        <div className={styles.catalogChips}>
          {typesValue.map((key) => (
            <button
              key={key}
              type="button"
              className={`${styles.catalogChip} ${styles["catalogChip--active"]}`}
              onClick={() => toggleType(key)}
            >
              {key}
              <span>×</span>
            </button>
          ))}
        </div>
      )}

      {/* ── COMPACT SELECTED BAR ────────────────────────────────────
           Collapsed by default → always leaves the catalog list visible.
           Tap the bar (or the chevron) to expand the full item list.  */}
      {selectedLines.length > 0 && (
        <section
          className={`${styles.catalogSelected} ${
            selectedOpen ? styles["catalogSelected--open"] : ""
          }`}
          aria-label="Selected items"
        >
          <button
            type="button"
            className={styles.catalogSelected__bar}
            onClick={() => setSelectedOpen((v) => !v)}
            aria-expanded={selectedOpen}
          >
            <span className={styles.catalogSelected__barLeft}>
              <span className={styles.catalogSelected__badge}>
                {selectedLines.length}
              </span>
              <strong>
                {selectedLines.length === 1
                  ? "item selected"
                  : "items selected"}
              </strong>
              {hasSelectedTotal && (
                <span className={styles.catalogSelected__barTotal}>
                  · {inr(selectedTotal)}
                </span>
              )}
            </span>

            <span className={styles.catalogSelected__barRight}>
              {onClearAll && (
                <span
                  role="button"
                  tabIndex={0}
                  className={styles.catalogSelected__clear}
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearAll();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.stopPropagation();
                      onClearAll();
                    }
                  }}
                >
                  Clear
                </span>
              )}
              <span
                className={styles.catalogSelected__chevron}
                aria-hidden="true"
              >
                {selectedOpen ? "▴" : "▾"}
              </span>
            </span>
          </button>

          {selectedOpen && (
            <ul className={styles.catalogSelected__list}>
              {selectedLines.map((line) => {
                const { total, hasPayable } = lineTotal(
                  line,
                  line.selectedDuration
                );
                const subCount = (line.subItems || []).length;
                const displayName = line.item_name || line.item_code;
                const isUnit = hasUnitControl(line);
                const qtyLabel = isUnit ? line.units || 1 : line.qty || 1;

                return (
                  <li
                    key={line.item_code}
                    className={styles.catalogSelected__item}
                  >
                    <div
                      className={styles.catalogSelected__thumb}
                      aria-hidden="true"
                    >
                      {prettyName(displayName).slice(0, 2).toUpperCase()}
                    </div>

                    <div className={styles.catalogSelected__info}>
                      <strong title={displayName}>
                        {prettyName(displayName)}
                      </strong>
                      <span className={styles.catalogSelected__meta}>
                        <span className={styles.catalogSelected__qty}>
                          {qtyLabel} {isUnit ? "Units" : "Qty"}
                        </span>
                        {subCount > 0 && (
                          <span>
                            · {subCount} add-on{subCount > 1 ? "s" : ""}
                          </span>
                        )}
                        {line.selectedDuration && (
                          <span>· {line.selectedDuration}</span>
                        )}
                      </span>
                    </div>

                    <div className={styles.catalogSelected__price}>
                      <span>
                        {hasPayable ? inr(total, line.currency) : "On request"}
                      </span>
                      {onRemove && (
                        <button
                          type="button"
                          onClick={() => onRemove(line)}
                          aria-label={`Remove ${displayName}`}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      <div className={styles.catalogList}>
        {catalogLoading && (
          <div className={styles.catalogState}>
            <div className={styles.catalogSpinner} />
            <p>Loading items…</p>
          </div>
        )}

        {catalogError && !catalogLoading && (
          <div className={styles.catalogState}>
            <p>{catalogError}</p>
            <button
              type="button"
              className={styles.catalogRetry}
              onClick={retry}
            >
              Retry
            </button>
          </div>
        )}

        {!catalogLoading && !catalogError && visibleCatalog.length === 0 && (
          <div className={styles.catalogState}>
            <p>No items match your search.</p>
          </div>
        )}

        {!catalogLoading &&
          !catalogError &&
          visibleCatalog.map((it) => {
            const added = isAdded(it.item_code);
            const displayName = it.item_name || it.item_code;
            return (
              <div
                key={it.item_code}
                className={`${styles.catalogItem} ${
                  added ? styles["catalogItem--inCart"] : ""
                }`}
              >
                <div className={styles.catalogItem__thumb}>
                  {displayName.slice(0, 2).toUpperCase()}
                </div>
                <div className={styles.catalogItem__info}>
                  <strong title={displayName}>{prettyName(displayName)}</strong>
                </div>
                <div className={styles.catalogItem__price}>
                  {it.rate && it.rate > 0 ? (
                    inr(it.rate, it.currency)
                  ) : (
                    <span className={styles.catalogItem__onRequest}>
                      On request
                    </span>
                  )}
                </div>
                {added && onRemove ? (
                  <button
                    type="button"
                    className={`${styles.catalogItem__add} ${styles["catalogItem__add--remove"]}`}
                    onClick={() => onRemove(it)}
                  >
                    Remove
                    <span>×</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className={`${styles.catalogItem__add} ${
                      added ? styles["catalogItem__add--added"] : ""
                    }`}
                    onClick={() => onAdd(it)}
                  >
                    {addLabel(added)}
                    <span>+</span>
                  </button>
                )}
              </div>
            );
          })}
      </div>
    </>
  );
}