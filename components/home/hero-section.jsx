import CategoriesSidebar from "./categories-sidebar"
import HeroBanner from "./hero-banner"

export default function HeroSection() {
  return (
    <section className="py-6 px-[5%]">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 ">
          {/* Categories sidebar - only visible on desktop */}
          <div className="hidden lg:block">
            <CategoriesSidebar />
          </div>

          {/* Hero banner - takes full width on mobile, 3/4 width on desktop */}
          <div className="lg:col-span-3">
            <HeroBanner />
          </div>
        </div>
      </div>
    </section>
  )
}

