
export default function QueryResult({ result }) {
    if (!result) return null
  
    const { sql_query, data, error } = result
    const hasData = data && Array.isArray(data) && data.length > 0
    const columns = hasData ? Object.keys(data[0]) : []
  
    return (
      <div className="w-full max-w-3xl mx-auto p-6 space-y-8 bg-white rounded-lg shadow-lg mt-6 transition-all duration-300">
        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold text-gray-800">Generated SQL Query</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(sql_query)
                  alert("SQL Query copied to clipboard!");
                }}
                className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-2 rounded transition-colors duration-200"
              >
                Copy
              </button>
            </div>
          </div>
          <div className="relative">
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap text-sm shadow-inner">
              {sql_query || "No SQL query generated yet"}
            </pre>
          </div>
        </div>
  
        {hasData ? (
          <div className="animate-fadeIn transition-all duration-300 hover:shadow-md rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Query Results</h2>
              <p className="text-sm text-gray-500 mt-1">{data.length} records found</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200">
                    {columns.map((column, index) => (
                      <th key={index} className="py-3 px-4 text-left font-medium text-gray-700 uppercase tracking-wider">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className={`
                        ${rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"} 
                        hover:bg-blue-50 transition-colors duration-150
                      `}
                    >
                      {columns.map((column, colIndex) => (
                        <td key={colIndex} className="py-3 px-4 border-t border-gray-200 text-gray-700">
                          {row[column] !== null ? (
                            String(row[column])
                          ) : (
                            <span className="text-gray-400 italic">NULL</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200 transition-all duration-300">
            {error ? (
              <div className="text-red-500 space-y-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="font-medium">Invalid Query</p>
            <p className="text-sm">{error}</p>
            <p className="text-xs text-gray-500">Please refine your query and try again.</p>
          </div>
            ) : (
              <div className="space-y-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <p className="font-medium text-gray-700">No results to display</p>
                <p className="text-sm text-gray-500">Try modifying your query or uploading a different database</p>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }
  
  