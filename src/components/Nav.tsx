import type { FC } from 'hono/jsx'

const Nav: FC = () => {
  return (
    <nav class="sticky top-0 z-50 bg-gray-900 px-6 py-4 flex items-center">
      <a href="/" class="text-xl font-bold text-white hover:text-gray-300 transition-colors">
        Pokemon
      </a>
    </nav>
  )
}

export default Nav
