"use client"

import { useState } from "react"
import QueryInput from "./components/query-input"
import QueryResult from "./components/query-result"

export default function App() {
  const [queryResult, setQueryResult] = useState(null)

  const handleQuerySubmit = (result) => {
    setQueryResult(result)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <QueryInput onSubmit={handleQuerySubmit} />
        <QueryResult result={queryResult} />
      </div>
    </div>
  )
}

