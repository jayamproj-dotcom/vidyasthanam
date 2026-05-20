import HomeContent, { generateMetadata } from "./(homepage)/home/page";
import Layout from "./(homepage)/layout";

export { generateMetadata };

export default function Home() {
  return (
    <Layout>
      <HomeContent />
    </Layout>
  );
}
