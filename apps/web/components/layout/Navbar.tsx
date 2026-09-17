"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/lib/session";
import { logout } from "@/lib/auth";

export default function Navbar() {
  const router = useRouter();
  const { user, loading } = useCurrentUser();

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // session may already be gone server-side; clear locally regardless
    } finally {
      sessionStorage.removeItem("accessToken");
      router.push("/login");
    }
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold text-gray-900">
          HAMMR
        </Link>

        <div className="flex items-center gap-6 text-sm font-medium text-gray-700">
          <Link href="/auctions" className="hover:text-black">
            Browse
          </Link>

          {!loading && user?.role === "SELLER" && (
            <Link href="/auctions/new" className="hover:text-black">
              Create auction
            </Link>
          )}

          {!loading && user ? (
            <>
              <Link href="/dashboard" className="hover:text-black">
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-lg bg-black px-4 py-2 text-white transition hover:bg-gray-800"
              >
                Logout
              </button>
            </>
          ) : (
            !loading && (
              <Link
                href="/login"
                className="rounded-lg bg-black px-4 py-2 text-white transition hover:bg-gray-800"
              >
                Login
              </Link>
            )
          )}
        </div>
      </nav>
    </header>
  );
}