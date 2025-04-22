"use client"

export default function StoreSettings() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <svg
        className="w-40 h-40 animate-bounce mb-6 text-muted-foreground"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v6l4 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>

      <h1 className="text-3xl font-bold mb-2">Store Settings</h1>
      <p className="text-muted-foreground max-w-md">
        This feature is currently under development. Please check back soon for more updates.
      </p>
    </div>
  )
}
