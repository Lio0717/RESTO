# KARINDIRYA — Expo / React Native

React Native implementation of the KARINDIRYA restaurant POS design from Figma
(`figma.com/design/Im0DYcY1NBCu5v1PnYX0D6`), built for Expo Go.

## Run

```bash
npm install
npx expo start
```

Then scan the QR code with **Expo Go** on your phone. The phone and the computer
must be on the same Wi‑Fi network. If the LAN connection fails, press `t` in the
terminal to switch to tunnel mode.

The app opens on the Get Started gate. Tap **Get Started** to enter the menu.

## Screens

| Route | Figma node | Notes |
| --- | --- | --- |
| `src/app/index.tsx` | — (new) | Get Started gate: K mark, KARINDIRYA, Get Started |
| `src/app/home.tsx` | `28:405` Mobile/Home | Category pills filter the grid; ADD updates the cart badge |
| `src/app/cart.tsx` | `28:638` Mobile/Cart | Steppers, Remove, live totals, Checkout |
| `src/app/confirmed.tsx` | `28:739` Mobile/Order Confirmed | Randomised order number |
| `src/app/profile.tsx` | `28:749` Mobile/Profile | Logout empties the cart and returns to Get Started |
| `src/app/inventory.tsx` | — (new) | **Lab 05** SQLite CRUD: search, add modal, delete, stock steppers |

## Lab 05 — SQLite persistence

`src/services/db.ts` owns the embedded database (`pos_inventory.db`). Menu items are
stored as `products` rows, with `stock` as available quantity.

| Function | Purpose |
| --- | --- |
| `initDatabase()` | WAL mode, `products` DDL, name index, auto-seed. Runs once per launch from `_layout.tsx` |
| `getAllProducts()` | `ORDER BY id DESC` read for the FlatList |
| `searchProducts(term)` | `WHERE name LIKE ? ESCAPE '\'` with `%`/`_` escaped so they're literal |
| `insertProduct()` / `deleteProduct(id)` | Parameterized create and delete |
| `adjustStock(id, delta)` | `MAX(stock + ?, 0)` so stock can't go negative |

Schema matches the lab brief: `id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL,
category TEXT NOT NULL, price REAL NOT NULL, stock INTEGER NOT NULL`. Seeding is guarded by
`PRAGMA user_version`, so relaunching never duplicates or wipes rows.

**Deviations from the lab blueprint, both deliberate.** The blueprint uses plain `.js` and a
monolithic screen; this project is `strict` TypeScript with Expo Router, so the SQL is
identical but the file layout follows the repo's conventions. And the CRUD screen reuses the
app's design tokens rather than the blueprint's `#00758F` slate palette, so it matches the
rest of the app.

**Verified**: the schema, seeding, `LIKE` search, wildcard/injection escaping, stock clamping,
and cross-restart durability were all executed against a real SQLite engine (22/22 checks).
`tsc --noEmit` and `expo-doctor` (21/21) pass, and android + web exports bundle.

**Still needs a human:** the on-device durability test (Airplane Mode, kill Expo Go, relaunch)
can only be done on your phone.

The app opens on Get Started (`/`), which is the logged-out entry gate — it shows on
every launch, and Logout returns to it. Get Started routes to Home via `replace`, so
pressing back on Android exits the app rather than returning to the gate.

Checkout navigates to Order Confirmed and empties the cart. "Start New Order"
returns to Home with a clean slate.

## Layout

```
src/
  app/            Expo Router routes — one file per screen, plus _layout.tsx
  components/
    Art.tsx       react-native-svg ports of every Figma asset
    ui.tsx        Screen shell, ButtonPrimary, CategoryPills, Stepper, Avatar
  state/
    MenuContext.tsx   menu data + cart reducer (no external state library)
  theme/
    tokens.ts     colors, radii, type scale, shadows — all traced to Figma nodes
```

## Design decisions worth knowing

**No raw SVG files.** The Figma assets are hand-ported to `react-native-svg`
primitives in `src/components/Art.tsx` (same viewBox, same primitives, same
fills). This keeps `react-native-svg` — already bundled in Expo Go — as the only
dependency and avoids a Metro SVG transform, so the app runs in Expo Go with no
custom dev client.

**The desktop frames were skipped.** The Figma file also contains 1440×1080
desktop frames (dashboard, sidebar, order panel). Those don't map to a phone
form factor, so only the four `Mobile/*` frames are implemented.

**Figma grid → flexbox.** Figma lays the menu out as three fixed 2-column rows at
a 390pt frame width. The RN version uses `flexWrap` so the same two-up grid holds
at any device width instead of clipping on narrower phones.

**The broken `+` stepper was corrected.** In Figma the cart `+` buttons
(node `28:665`) render as a red/green blob colliding with the "Remove" label. The
implementation styles them to match the working `−` control rather than
reproducing the defect. Fix it in Figma if you want the source to match.

**Cart state is in-memory.** Reloading resets it. Add AsyncStorage if you want
the cart to survive an app restart.

## Verification

`npx tsc --noEmit` and `npx expo-doctor` (21/21) both pass, and
`npx expo export --platform android` bundles successfully.