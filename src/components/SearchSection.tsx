import SearchBar from "@/components/searchbar"

export default function SearchSection() {
  return (
    <section className="bg-purple-900 bg-opacity-50 p-10 md:p-20">
      <h2 className="text-3xl font-bold text-center mb-8">Find Your Perfect Helper</h2>
      <SearchBar />
    </section>
  )
}

