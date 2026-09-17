import Image from "next/image";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="mb-8">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900">
            HAMMR
          </h1>

          <p className="mt-3 text-lg text-gray-500">
            Bid. Win. Own.
          </p>
        </div>

        <p className="max-w-md text-base leading-7 text-gray-600">
          Discover auctions, place competitive bids, and get the items you
          want.
        </p>

        <div className="mt-8 flex gap-4">
          <a
            href="/login"
            className="rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Login
          </a>

          <a
            href="/register"
            className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
          >
            Register
          </a>
        </div>
      </section>
    </main>
  );
}
