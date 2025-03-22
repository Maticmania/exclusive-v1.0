"use client"

import { useSession } from "next-auth/react"
import { useState } from "react"

export default function SessionDebug() {
  const { data: session, status } = useSession()
  const [isVisible, setIsVisible] = useState(false)

  if (status === "loading") {
    return <div>Loading session...</div>
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button onClick={() => setIsVisible(!isVisible)} className="bg-gray-800 text-white px-3 py-1 rounded-md text-sm">
        {isVisible ? "Hide" : "Debug"} Session
      </button>

      {isVisible && (
        <div className="mt-2 p-4 bg-white border rounded-md shadow-lg max-w-md max-h-96 overflow-auto">
          <h3 className="font-bold mb-2">Session Status: {status}</h3>
          {session ? (
            <>
              <p>
                <strong>User ID:</strong> {session.user?.id || "Not available"}
              </p>
              <p>
                <strong>Name:</strong> {session.user?.name || "Not available"}
              </p>
              <p>
                <strong>Email:</strong> {session.user?.email || "Not available"}
              </p>
              <p>
                <strong>Role:</strong> {session.user?.role || "Not available"}
              </p>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                {JSON.stringify(session, null, 2)}
              </pre>
            </>
          ) : (
            <p>No active session</p>
          )}
        </div>
      )}
    </div>
  )
}

