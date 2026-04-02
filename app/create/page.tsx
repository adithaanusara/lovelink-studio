import { AdvancedCreateForm } from "../../components/AdvancedCreateForm";

export default function CreatePage() {
  return (
    <main className="min-h-screen bg-[#050816] px-6 py-10 text-white">
      <div className="mx-auto max-w-[1500px] space-y-8">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-pink-200">Editor</p>
          <h1 className="mt-2 text-4xl font-black">Build your immersive memory page</h1>
          <p className="mt-2 text-slate-300">
            Choose a design, drag elements, customize text and images, then publish.
          </p>
        </div>

        <AdvancedCreateForm />
      </div>
    </main>
  );
}