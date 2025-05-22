import { ImageGallery } from "@/components/image-gallery";
import { LqipDemo } from "@/components/lqip-css-demo";

export default function Home() {
  return (
    <main className="min-h-screen p-6 md:p-12 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900">
          CSS-Only LQIP Generator
        </h1>
        <p className="text-gray-600 mb-8 max-w-3xl">
          This tool is implemented based on{" "}
          <a className="text-blue-500" target="_blank" href="https://github.com/Kalabasa">
            Lean Rada
          </a>
          ’s article on{" "}
          <a
            className="text-blue-500"
            target="_blank"
            href="https://leanrada.com/notes/css-only-lqip/"
          >
            CSS-only LQIP
          </a>
          . It generates low-quality image placeholders (LQIP) using only CSS.
          You can convert images into LQIP hashes and embed them into any
          webpage—no JavaScript or React required—for fast, lightweight image
          previews.
          <br /><br />
          Check out the source code on{" "}
          <a
            className="text-blue-500"
            target="_blank"
            href="https://github.com/enohuang3108/css-only-lqip-generator"
          >
            GitHub
          </a>
          .
        </p>

        <div className="space-y-12">
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-900">LQIP Demo</h2>
            <LqipDemo />
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              Image Gallery
            </h2>
            <ImageGallery />
          </div>
        </div>
      </div>
    </main>
  );
}
