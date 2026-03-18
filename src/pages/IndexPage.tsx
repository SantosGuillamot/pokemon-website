import type { FC } from "hono/jsx";

const IndexPage: FC = () => {
  return (
    <main class="max-w-7xl mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-4">Pokemon Website</h1>
      <div data-wp-interactive="pokemon">
        <p data-wp-text="state.pokemon.name">Loading...</p>
        <button
          data-wp-on--click="actions.toggle"
          class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Toggle Pokemon
        </button>
      </div>
    </main>
  );
};

export default IndexPage;
