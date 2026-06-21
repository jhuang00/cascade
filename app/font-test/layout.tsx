export default function FontTestLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ overflow: 'auto', height: '100dvh' }}>
      {children}
    </div>
  );
}
