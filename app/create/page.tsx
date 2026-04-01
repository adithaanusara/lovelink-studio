import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CreateMemoryForm } from "@/components/CreateMemoryForm";

export default function CreatePage() {
  return (
    <main>
      <Navbar />
      <section className="container py-10 lg:py-14">
        <CreateMemoryForm />
      </section>
      <Footer />
    </main>
  );
}
