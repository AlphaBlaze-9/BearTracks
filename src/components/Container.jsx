// Container.jsx: Standard horizontal padding + responsive max-width wrapper.
// Wrapping page sections in Container keeps spacing perfectly consistent across
// every route and makes adjusting the site's layout breakpoints a one-line change.
// Used by Navbar, ProtectedRoute loading screen, auth pages, and most page sections.

export default function Container({ children, className = "" }) {
  // mx-auto centers the block; max-w-6xl caps line length on large screens;
  // px-4 / sm:px-6 / lg:px-8 adds breathing room that grows with the viewport.
  return (
    <div
      className={`mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${className}`}
    >
      {children}
    </div>
  );
}
