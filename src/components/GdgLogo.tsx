export function GdgLogo({ size = 28 }: { size?: number }) {
  return (
    <span className="inline-flex items-center" aria-hidden style={{ height: size }}>
      <span className="gdg-dots inline-flex items-end" style={{ fontSize: size * 0.9 }}>
        <span /><span /><span /><span />
      </span>
    </span>
  );
}
