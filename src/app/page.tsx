import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import LinkGenerator from "@/components/LinkGenerator";
import WhyChooseUs from "@/components/WhyChooseUs";
import HowItWorks from "@/components/HowItWorks";
import dynamic from "next/dynamic";
import Faq from "@/components/Faq";
import Cta from "@/components/Cta";
import Footer from "@/components/Footer";
import Background from "@/components/Background";

// Below-the-fold section — loaded lazily so it doesn't add to initial JS.
const BlogSection = dynamic(() => import("@/components/BlogSection"), {
  ssr: true,
  loading: () => <div className="h-40" />,
});

export default function Home() {
  return (
    <>
      <Background />
      <Navbar />
      <main id="main">
        <Hero />
        <LinkGenerator />
        <WhyChooseUs />
        <HowItWorks />
        <BlogSection />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
