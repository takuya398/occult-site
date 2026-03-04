/**
 * 記事スラグごとのマーカー→実ファイル名マップ。
 * 画像は public/legends/{slug}/ に置く。
 * パス: /legends/{slug}/{filename}
 */
export const legendImageMap: Record<
  string,
  Partial<Record<"cover" | "scene1" | "scene2" | "scene3" | "scene4", string>>
> = {
  "hasshaku-sama": {
    cover: "602fbc81-e54b-4dce-a298-63c9634782ef.png",
    scene1: "0f42a318-5701-430f-aa49-6c959a12287d.png",
    scene2: "834da4ed-e5d8-47fa-bd0f-4b2ddcb74052.png",
    scene3: "844d2781-254d-4f8c-b448-6f04153c3572.png",
    scene4: "b5657bf7-4462-4397-8a13-2114ad8959b7.png",
  },
  "kisaragi-station": {
    cover: "17243fc2-00af-4c65-946a-2114e33034a3.png",
    scene1: "14660af6-6cb0-4c39-ab01-e049dabfe303.png",
    scene2: "2712e2c4-5c71-43ff-9749-91fc98e792f8.png",
    scene3: "4ed7f9ad-346e-4b44-9c60-c4c5d549aaf9.png",
    scene4: "997a7126-272b-4eb6-93bc-326cdd53dd6e.png",
  },
  kotoribako: {
    cover: "37e639b7-b2d4-4b3e-a39b-21e741552685-1024x683.jpg",
    scene1: "38892a38-272b-4a3e-90c5-585faf378f0c-768x512.jpg",
    scene2: "0084767a-f540-47b0-a7a7-1af3b4e96f0d.jpg",
    scene3: "b4e0e593-e1bb-46ee-8c16-4447b6b11ac8-768x512.jpg",
    scene4: "f6fd9494-2d0e-4b57-b317-bfbdc0d91c3b-1024x683.jpg",
  },
  "saru-yume": {
    cover: "9cce5b14-8acd-4c67-819a-37c8b54de175.png",
    scene1: "78c47132-d5c2-43b2-ae3c-bbe558cecd39.png",
    scene2: "3bca4f76-0454-4f32-ba64-2562beb1af8d.png",
    scene3: "e5736791-b621-4d89-b9b6-d7d983b1cd8b.png",
    scene4: "ed2a223d-28ba-4a51-9b33-34d362b5afd5.png",
  },
};
