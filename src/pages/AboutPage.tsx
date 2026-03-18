import type { FC } from "hono/jsx";

const AboutPage: FC = () => {
  return (
    <main class="max-w-7xl mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-4">About</h1>
      <div data-wp-interactive="about">
        <p data-wp-text="state.greeting"></p>
      </div>
    </main>
  );
};

export default AboutPage;
