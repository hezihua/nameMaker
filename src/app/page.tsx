import { NameMakerApp } from "@/components/NameMakerApp";

export default function Home() {
  return (
    <div className="min-h-full bg-[radial-gradient(ellipse_at_top,_#faf6ef_0%,_#f0ebe3_45%,_#e8e0d4_100%)]">
      <NameMakerApp />
      <footer className="pb-10 text-center text-xs text-stone-500">
        仅供文化娱乐与起名参考 · 重要决定请结合家族意愿与专业意见
      </footer>
    </div>
  );
}
