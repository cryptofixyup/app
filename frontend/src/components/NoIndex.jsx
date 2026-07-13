import { Helmet } from "react-helmet-async";

/**
 * Blocks a route from search-engine indexing.
 * Use on /admin, /admin/dashboard, /success and any non-marketing route.
 */
export default function NoIndex({ title }) {
  return (
    <Helmet>
      <meta name="robots" content="noindex, nofollow" />
      <meta name="googlebot" content="noindex, nofollow" />
      {title ? <title>{title}</title> : null}
    </Helmet>
  );
}
