import Link from 'next/link'
import Image from 'next/image'
import notFoundSketch from '@/public/images/notfoundpage.png' // Assuming you move the image to /public folder

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <div className="max-w-md w-full">
        <Image
          src={notFoundSketch}
          alt="Not Found Sketch"
          width={400}
          height={400}
          className="mx-auto animate-fadeIn"
        />
        <h2 className="text-3xl font-semibold mt-6">Oops! Page not found</h2>
        <p className="text-gray-600 mt-2">
          We couldn't find the page you're looking for.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition"
        >
          Return Home
        </Link>
      </div>
    </div>
  )
}
