import Link from "next/link";

export default function Home() {
  return (
    <main>
      <h1>Void: encoded Next.js asset paths</h1>
      <p>The dynamic page should display "Package: demo".</p>
      <p>
        <a href="/package/demo">Open the dynamic page directly</a>
      </p>
      <p>
        <Link href="/package/demo" prefetch={false}>
          Open with next/link
        </Link>
      </p>
      <p>
        Inspect the request for
        /_next/static/chunks/pages/package/%5B...slug%5D-*.js.
      </p>
    </main>
  );
}
