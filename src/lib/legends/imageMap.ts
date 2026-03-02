/**
 * 記事スラグごとのマーカー→実ファイル名マップ。
 * 画像は public/legends/{slug}/ に置く。
 * パス: /legends/{slug}/{filename}
 */
export const legendImageMap: Record<
  string,
  Partial<Record<"cover" | "scene1" | "scene2" | "scene3" | "scene4", string>>
> = {
  kotoribako: {
    cover: "37e639b7-b2d4-4b3e-a39b-21e741552685-1024x683.jpg",
    scene1: "38892a38-272b-4a3e-90c5-585faf378f0c-768x512.jpg",
    scene2: "0084767a-f540-47b0-a7a7-1af3b4e96f0d.jpg",
    scene3: "b4e0e593-e1bb-46ee-8c16-4447b6b11ac8-768x512.jpg",
    scene4: "f6fd9494-2d0e-4b57-b317-bfbdc0d91c3b-1024x683.jpg",
  },
};
