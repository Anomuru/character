# 3D character models

Drop your `.glb` files here using **the same job ids** as the PNGs:

```
public/characters/
├── chef.glb
├── doctor.glb
├── mechanic.glb
├── builder.glb
├── scientist.glb
├── programmer.glb
├── teacher.glb
└── police.glb
```

## How to generate them from the existing PNGs

Each profession already has a Microsoft Fluent 3D illustration next to this file (e.g. `chef.png`). Use any of these free image-to-3D services:

1. **Hunyuan3D 2** — https://huggingface.co/spaces/tencent/Hunyuan3D-2 (free, no signup)
2. **Tripo3D** — https://www.tripo3d.ai/ (free credits on signup)
3. **Meshy** — https://www.meshy.ai/ (free credits on signup)

### Steps

For each of the 8 PNGs:

1. Open the service.
2. Upload the PNG (e.g. `chef.png`).
3. Wait for processing (~30s–2 min).
4. Download the **GLB** export (not OBJ, not FBX).
5. Rename it to match the profession id (`chef.glb`, `doctor.glb`, ...).
6. Drop it into this folder.

### After the files land

Tell me they're in place. I'll add `modelUrl: "/characters/<id>.glb"` to each entry in `src/lib/jobs.ts` and the profile/game screen will switch from the floating-PNG sprite to the real 3D model automatically.

If only some are ready, that's fine — I'll wire them per-profession and the rest will keep using the PNG sprite until the GLBs arrive.
