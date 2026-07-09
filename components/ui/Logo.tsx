export default function Logo({ id = "lg" }: { id?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path
        d="M14 46V20l12 14 6-8 6 8 12-14v26"
        stroke={`url(#${id})`}
        strokeWidth="5.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#22d3ee" />
          <stop offset="1" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
    </svg>
  );
}
