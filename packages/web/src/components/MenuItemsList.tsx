import { DietBadge } from "./Layout";
import { getNonVegItems, getVegItems } from "../utils/menuItems";
import type { DietType, MealSchedule } from "../api/types";

type DietFilter = DietType | "all";

export function MenuItemsList({
  schedule,
  dietFilter = "all",
}: {
  schedule: MealSchedule;
  /** "veg" | "non_veg" shows only that list; "all" shows both (admin) */
  dietFilter?: DietFilter;
}) {
  const veg = getVegItems(schedule);
  const nonVeg = getNonVegItems(schedule);
  const showVeg = dietFilter === "all" || dietFilter === "veg";
  const showNonVeg = dietFilter === "all" || dietFilter === "non_veg";
  const singleColumn = dietFilter === "veg" || dietFilter === "non_veg";

  return (
    <div className={`menu-items-grid ${singleColumn ? "menu-items-single" : ""}`}>
      {showVeg && (
        <div className="menu-items-col">
          <p className="menu-items-heading">
            <DietBadge diet="veg" /> Veg items
          </p>
          {veg.length === 0 ? (
            <p className="menu-items-empty">No veg items listed</p>
          ) : (
            <ul className="menu-items-list">
              {veg.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      )}
      {showNonVeg && (
        <div className="menu-items-col">
          <p className="menu-items-heading">
            <DietBadge diet="non_veg" /> Non-veg items
          </p>
          {nonVeg.length === 0 ? (
            <p className="menu-items-empty">No non-veg items listed</p>
          ) : (
            <ul className="menu-items-list">
              {nonVeg.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
