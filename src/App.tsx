import './App.css'
import useFetch from './hooks/useFetch'

const url = 'http://localhost:3000/api/v1/deals';
type Deal = {
  id: number,
  name: string,
  description: string,
  image_url: string,
  store: string,
  store_product_id: string,
  price: number,
  brand: string,
  categories: string[],
  store_url: string,
}

const Item = ({ deal }: { deal: Deal }) => (
  <div
    className="flex flex-col items-center bg-white border border-gray-200 rounded-lg shadow md:flex-row hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 my-2"
  >
    <img
      className="object-cover w-full rounded-t-lg h-96 md:h-auto md:w-48 md:rounded-none md:rounded-s-lg"
      src={deal.image_url}
      alt=""
    />
    <div className="flex flex-col justify-between p-4 leading-normal">
      <a href={deal.store_url} target="_blank" rel="noreferrer">
        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white hover:cursor-pointer">
          {deal.name}
        </h5>
      </a>
      <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
        {deal.description}
      </p>

      <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
        <span className="bg-purple-100 text-purple-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-purple-900 dark:text-purple-300">{deal.brand.toUpperCase()}</span>
      </p>

      <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
        <span className="bg-red-100 text-red-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300">$ {deal.price}</span>
      </p>
      <div>
      {
        deal.categories.map((category: string) => (
          <span className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300 cursor-pointer">
            {category}
          </span>
        ))
      }
      </div>
    </div>
  </div>
)

function App() {
  const { data, isLoading } = useFetch<Deal[]>({ url, isAutoFetch: true });

  if (isLoading || !data) {
    return <div className="w-full container mx-auto">Loading...</div>
  }

  return (
    <div className="w-full container mx-auto">
    {
      data.map((deal: Deal) => <Item key={deal.id} deal={deal} />)
    }
    </div>
  )
}

export default App
