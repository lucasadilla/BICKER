// Redirect individual deliberation routes to the main deliberate page
// while preserving the debate ID via a query parameter.

export default function DeliberateRedirect() {
  // This component never renders because getServerSideProps redirects first.
  return null;
}

export async function getServerSideProps({ params }) {
  return {
    redirect: {
      destination: `/deliberate?id=${params.id}`,
      permanent: false,
    },
  };
}

