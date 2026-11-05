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
  it?.amc_sub_type_name || it?.amc_type_name || it?.service_type || "";

export default function CatalogBody({
  styles,
  search,
  setSearch,
  catalogTypes,
  activeTypes,
  setActiveTypes,
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
  const [sectorOpen, setSectorOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);
  const sectorRef = React.useRef(null);

  React.useEffect(() => {
    if (!dropdownOpen && !sectorOpen) return;
    const onClick = (e) => {
      if (dropdownOpen && dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (sectorOpen && sectorRef.current && !sectorRef.current.contains(e.target)) {
        setSectorOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [dropdownOpen, sectorOpen]);

  const [localSector, setLocalSector] = React.useState("All");
  const [localTypes, setLocalTypes] = React.useState([]);

  const usingParentSector =
    typeof activeSector === "string" && typeof setActiveSector === "function";
  const sectorValue = usingParentSector ? activeSector : localSector;
  const changeSector = usingParentSector ? setActiveSector : setLocalSector;

  const usingParentTypes =
    Array.isArray(activeTypes) && typeof setActiveTypes === "function";
  const typesValue = usingParentTypes ? activeTypes : localTypes;
  const changeTypes = usingParentTypes ? setActiveTypes : setLocalTypes;

// Hardcoded sector options — All + the three fixed sectors
const FIXED_SECTORS = ["All", "Commercial", "Residential", "Industrial"];

const derivedSectors = React.useMemo(() => {
  // If the parent explicitly passes a non-empty `sectors` list, honor it
  // (so you can still override from outside later).
  if (Array.isArray(sectors) && sectors.length > 0) return sectors;
  return FIXED_SECTORS;
}, [sectors]);

  const derivedTypes = React.useMemo(() => {
    if (Array.isArray(catalogTypes) && catalogTypes.length > 0) return catalogTypes;
    const source = Array.isArray(allItems) && allItems.length > 0
      ? allItems
      : (filteredCatalog || []);
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
  }, [catalogTypes, allItems, filteredCatalog, sectorValue]);

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
  const isAllSectors = sectorValue === "All";

  const toggleType = (key) => {
    changeTypes((prev) =>
      Array.isArray(prev)
        ? prev.includes(key)
          ? prev.filter((k) => k !== key)
          : [...prev, key]
        : [key]
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

  return (
    <>
      <div className={styles.catalogFilters}>
        {/* 1. SECTOR */}
        {derivedSectors.length > 0 && (
          <div className={styles.catalogDropdown} ref={sectorRef}>
            <button
              type="button"
              className={styles.catalogDropdown__trigger}
              onClick={() => setSectorOpen((v) => !v)}
              aria-expanded={sectorOpen}
            >
              <span>{isAllSectors ? "All sectors" : sectorValue}</span>
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

            {sectorOpen && (
              <div className={styles.catalogDropdown__menu}>
                {derivedSectors.map((s) => (
                  <label key={s} className={styles.catalogDropdown__item}>
                    <input
                      type="radio"
                      name="sector-filter"
                      checked={sectorValue === s}
                      onChange={() => {
                        changeSector(s);
                        setSectorOpen(false);
                      }}
                    />
                    <span>{s === "All" ? "All sectors" : s}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. SERVICE / TYPE */}
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
                    onChange={() => changeTypes([])}
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
                    onClick={() => changeTypes([])}
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* 3. SEARCH */}
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

      {!isAllSectors && (
        <div className={styles.catalogChips}>
          <button
            type="button"
            className={`${styles.catalogChip} ${styles["catalogChip--active"]}`}
            onClick={() => changeSector("All")}
          >
            {sectorValue}
            <span>×</span>
          </button>
        </div>
      )}

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

      {selectedLines.length > 0 && (
        <div className={styles.catalogSelected}>
          <div className={styles.catalogSelected__head}>
            <strong>Selected ({selectedLines.length})</strong>
            <div className={styles.catalogSelected__headRight}>
              {hasSelectedTotal && (
                <span className={styles.catalogSelected__total}>
                  {inr(selectedTotal)}
                </span>
              )}
              {onClearAll && (
                <button type="button" onClick={onClearAll}>
                  Clear all
                </button>
              )}
            </div>
          </div>
          <ul className={styles.catalogSelected__list}>
            {selectedLines.map((line) => {
              const { total, hasPayable } = lineTotal(line, line.selectedDuration);
              const subCount = (line.subItems || []).length;
              const qtyLabel = hasUnitControl(line)
                ? line.units || 1
                : line.qty || 1;

              return (
                <li key={line.item_code}>
                  <div className={styles.catalogSelected__info}>
                    <strong title={line.item_name || line.item_code}>
                      {prettyName(line.item_name || line.item_code)}
                    </strong>
                    <span>
                      {qtyLabel} {hasUnitControl(line) ? "Units" : "Qty"}
                      {subCount > 0 &&
                        ` · ${subCount} add-on${subCount > 1 ? "s" : ""}`}
                      {line.selectedDuration && ` · ${line.selectedDuration}`}
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
                        aria-label={`Remove ${line.item_name || line.item_code}`}
                      >
                        ×
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
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
            <button type="button" className={styles.catalogRetry} onClick={retry}>
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
                  <span className={styles.catalogItem__tag}>
                    {it.amc_sub_type_name || it.amc_type_name || "AMC"}
                  </span>
                  {/* <strong title={displayName}>{prettyName(displayName)}</strong> */}
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