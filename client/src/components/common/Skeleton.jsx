const Skeleton = ({ width = '100%', height = '20px', borderRadius = '8px', style = {} }) => (
  <div aria-hidden="true" style={{
    width, height, borderRadius,
    background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    ...style
  }}>
    <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
  </div>
);

export const SkeletonCard = ({ lines = 3, cardStyle = {} }) => (
  <div style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', background: '#fff', ...cardStyle }}>
    <Skeleton height="180px" borderRadius="12px" style={{ marginBottom: '1rem' }} />
    <Skeleton height="22px" width="60%" style={{ marginBottom: '0.5rem' }} />
    {Array.from({ length: lines - 1 }).map((_, i) => (
      <Skeleton key={i} height="14px" width={`${80 - i * 15}%`} style={{ marginBottom: '0.4rem' }} />
    ))}
  </div>
);

export default Skeleton;
