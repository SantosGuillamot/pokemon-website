import type { FC } from 'hono/jsx'

const IndexPage: FC = () => {
  return (
    <main class="max-w-7xl mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-4">Pokemon Website</h1>
      <div
        data-wp-interactive="pokemon"
        data-wp-context='{ "pokemonId": 1 }'
      >
        <p data-wp-text="state.pokemon.name">Loading...</p>
      </div>
    </main>
  )
}

export default IndexPage
