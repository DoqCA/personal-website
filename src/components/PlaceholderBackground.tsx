// TEMPORARY: solid black backdrop until the polygon background replaces it.
export default function PlaceholderBackground() {
  return <div aria-hidden="true" className="fixed inset-0 -z-10 bg-black" />;
}
