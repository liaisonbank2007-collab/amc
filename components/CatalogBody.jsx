// components/CatalogBody.jsx
"use client";

import React from "react";
import { inr, prettyName } from "../lib/format";
import { hasUnitControl } from "../lib/visibility";
import { lineTotal } from "../lib/calculations";

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

  const isAll = activeTypes.length === 0;

  const toggleType = (key) => {
    setActiveTypes((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const selectedTotal = selectedLines.reduce(
    (sum, line) => sum + lineTotal(line).total,
    0
  );
  const hasSelectedTotal = selectedLines.some(
    (line) => lineTotal(line).hasPayable
  );

  return (
    <>
      <div className={styles.catalogFilters}>
        {catalogTypes.length > 1 && (
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
                  : activeTypes.length === 1
                    ? activeTypes[0]
                    : `${activeTypes.length} types selected`}
              </span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                aria-hidden="true"
              >
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
                    onChange={() => setActiveTypes([])}
                  />
                  <span>All types</span>
                  <em>{catalogTypes[0]?.count ?? 0}</em>
                </label>

                {catalogTypes.slice(1).map((t) => (
                  <label key={t.key} className={styles.catalogDropdown__item}>
                    <input
                      type="checkbox"
                      checked={activeTypes.includes(t.key)}
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
                    onClick={() => setActiveTypes([])}
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

      {activeTypes.length > 0 && (
        <div className={styles.catalogChips}>
          {activeTypes.map((key) => (
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
              const { total, hasPayable } = lineTotal(line);
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
                      {line.item_code} · Qty {qtyLabel}
                      {subCount > 0 &&
                        ` · ${subCount} add-on${subCount > 1 ? "s" : ""}`}
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
                        aria-label={`Remove ${
                          line.item_name || line.item_code
                        }`}
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
            <button
              type="button"
              className={styles.catalogRetry}
              onClick={retry}
            >
              Retry
            </button>
          </div>
        )}

        {!catalogLoading &&
          !catalogError &&
          filteredCatalog.length === 0 && (
            <div className={styles.catalogState}>
              <p>No items match your search.</p>
            </div>
          )}

        {!catalogLoading &&
          !catalogError &&
          filteredCatalog.map((it) => {
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
                  <strong title={displayName}>
                    {prettyName(displayName)}
                  </strong>
                  <span className={styles.catalogItem__meta}>
                    {it.item_code} · {it.uom || "Nos"}
                  </span>
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