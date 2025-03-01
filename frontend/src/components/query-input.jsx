
"use client"
import { useState } from "react"

export default function QueryInput({ onSubmit }) {
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [file, setFile] = useState(null)
  const [fileName, setFileName] = useState("")
  const [isHovered, setIsHovered] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const sampleQueries = [
    "Retrieve all records where the petal length is greater than 5.",
    "Find the species with the highest average sepal width.",
    "Count the number of records for each species.",
    "Retrieve records where sepal length is between 5.0 and 6.5.",
    "Find the species with the smallest petal width.",
    "Get the top 10 records ordered by sepal length in descending order.",
    "Retrieve all records where sepal width is less than the average sepal width.",
    "Find the maximum and minimum petal length for each species.",
    "Retrieve records where species is 'Iris-virginica' and sepal length is greater than 6.5.",
    "Find the total number of records where petal width is greater than 1.5.",
  ]

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0]
    if (!uploadedFile) return

    setFile(uploadedFile)
    setFileName(uploadedFile.name)
    const formData = new FormData()
    formData.append("file", uploadedFile)

    try {
      setIsLoading(true)
      const response = await fetch("http://localhost:5000/api/upload_db", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("File upload failed. Please try again.")
      }

      document.getElementById("success-message").classList.remove("opacity-0")
      document.getElementById("success-message").classList.add("opacity-100")

      setTimeout(() => {
        document.getElementById("success-message").classList.remove("opacity-100")
        document.getElementById("success-message").classList.add("opacity-0")
      }, 3000)
    } catch (error) {
      console.error("Error uploading database:", error)
      setErrorMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsLoading(true)
    setErrorMessage("") // Clear previous errors

    try {
      const response = await fetch("http://localhost:5000/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to process query")
      }

      onSubmit(data)
    } catch (error) {
      console.error("Error processing query:", error)
      setErrorMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg transition-all duration-300">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-3">
        Natural Language to SQL
        <p className="mt-3 text-xs text-gray-500">By Diksha Velhal</p>
      </h1>

      <div className="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
        <p className="font-bold">Disclaimer:</p>
        <p>The hosted version of this application only supports the Iris dataset.</p>
        <p>
          To test the 'Upload Database' feature with custom datasets, please run the application locally using the
          provided GitHub code.
        </p>
      </div>

      {errorMessage && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{errorMessage}</div>}

      <div
        id="success-message"
        className="mb-4 p-3 bg-green-100 text-green-700 rounded-md opacity-0 transition-opacity duration-300"
      >
        Database uploaded successfully!
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
        <div className="transition-all duration-300 hover:shadow-md p-4 rounded-lg border border-gray-200">
          <label className="block mb-3 font-medium text-gray-700">Upload Your Database</label>
          <div
            className={`relative cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200 rounded-md border-2 border-dashed ${
              isHovered ? "border-blue-400" : "border-gray-300"
            } p-4 w-full`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <input
              type="file"
              accept=".db,.csv"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="text-center">
              <p className="text-sm text-gray-500">
                {fileName ? fileName : "Drag & drop your file here or click to browse"}
              </p>
              {fileName && <p className="text-xs text-green-600 mt-1">File selected</p>}
            </div>
          </div>
        </div>

        <div className="transition-all duration-300 hover:shadow-md p-4 rounded-lg border border-gray-200">
          <label className="block mb-3 font-medium text-gray-700">Enter Your Query</label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., What is the average sepal length?"
            className="p-4 border border-gray-300 rounded-md w-full min-h-[120px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
          />
        </div>

        <div className="transition-all duration-300 hover:shadow-md p-4 rounded-lg border border-gray-200">
          <label className="block mb-3 font-medium text-gray-700">Sample Queries for Iris Dataset</label>
          <select className="w-full p-2 border border-gray-300 rounded-md" onChange={(e) => setQuery(e.target.value)}>
            <option value="">Select a sample query</option>
            {sampleQueries.map((q, index) => (
              <option key={index} value={q}>
                {q}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className={`py-3 px-6 rounded-md text-white font-medium transition-all duration-300 transform ${
            isLoading || !query.trim()
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 hover:shadow-md active:scale-95"
          }`}
        >
          {isLoading ? "Processing..." : "Generate SQL & Execute"}
        </button>
      </form>
    </div>
  )
}

