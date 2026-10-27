# Plant snow placement

Snow dusting is independent of leaf season and damage. `recipe.snowDusting`
accepts `none` or `dusted`; the Workbench Snow selector previews and exports it.
Catalog plants with eligible habitats export `ecology.snow` with biome names and
an authored 0.65 maximum probability. Only upward-facing triangles get patches.

Runtime integration uses `plantSnowState(species, environment, placementSeed,
{heightMeters, baseElevationMeters, scale})` from `plant-snow.js`. Supply the
selected baked variant's local top bound as heightMeters, after condition and
season selection, and its actual instance scale. Use a per-instance placement
seed so nearby copies do not all get the same snow state.

Environment fields:
- `biome`: current local biome, not the species' whole habitat list.
- `snowCover`: 0–1 local snow coverage; zero/absent gives no dusting.
- `temperature`: optional Celsius; values above 2 suppress dusting.
- `snowDepthMeters`: nonnegative local depth over the plant's terrain anchor.
- `snowSurfaceElevationMeters`: optional absolute local snow elevation,
  overriding depth for burial; same coordinate system as baseElevationMeters.

Cull when plant top <= snow surface, in any biome. Keep taller plants anchored
on terrain. Do not lift roots to the snow surface. Snow terrain rendering should
occlude their submerged portions. No triangle clipping or terrain snow mesh is
performed by this workbench.

`selectCommunitySpecies` requires `environment.plantHeights[speciesId]` for
eligible candidates when snow depth is positive (or a snow surface is provided).
These must be the actual chosen variants' bounds. Missing heights are an error,
not permission to spawn a potentially buried plant. `plantScale` and
`baseElevationMeters` describe the proposed placement.

`generatePlacedSpecies` provides an authoring adapter returning null for burial
or a generated plant with its resolved snow appearance. Gameplay should use the
baked bounds and snow decision helper without importing the generator.

Taiga and the spelling tiaga resolve to boreal-forest; deciduous-forest resolves
to temperate-woodland. High-desert is an explicit habitat for desert tussocks and
angular scrub. Eligibility never overrides the other ecology constraints.

These changes are implemented in Plant Workbench. Game/Interiors consumers still
need synchronization and must pass local snow fields and variant bounds.
