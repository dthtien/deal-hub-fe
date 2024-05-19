import { useEffect, useState, useCallback } from 'react'
import qs from 'qs';

type MethodType = 'GET' | 'POST' | 'PUT'

type FetchDataType = {
  path: string,
  requestOptions?: { method: MethodType, headers?: any },
  isAutoFetch?: boolean,
  onComplete?: () => void,
  onError?: () => void
}

type Error = {
  message: string,
  status: number
}


const useFetch = <DataType>(
  {
    isAutoFetch = false,
    path,
    requestOptions = { method: 'GET' },
    onComplete = () => {},
    onError = () => {}
  }: FetchDataType
) => {
  const [data, setData] = useState<DataType | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setLoading] = useState(false)
  const fetchData = useCallback((body?: any) => {
    setLoading(true)
    const method = requestOptions.method
    const headers = requestOptions.headers || {}
    const sendingRequestOptions = {
      method,
      headers: ( method === 'GET' ? {} : { ...headers, 'Content-Type': 'application/json' } )
    }

    const url = `${ import.meta.env.PROD ? import.meta.env.VITE_API_URL : 'http://localhost:3000'}/api/${path}`;
    const queryString = qs.stringify(body)
    const fetchUrl = method === 'GET' && body ? `${url}?${queryString}` : url
    const isSendingBody = method !== 'GET' && body
    fetch(fetchUrl, isSendingBody ? { ...sendingRequestOptions, body: JSON.stringify(body) } : sendingRequestOptions )
      .then((res) => res.json())
      .then((data) => {
        setData(data)
        setLoading(false)
        onComplete()
      }).catch(error => {
        setError({ message: error.message, status: error.status })
        onError()
        setLoading(false);
    });
  }, [])

  if (isAutoFetch) {
    useEffect(() => fetchData(), [])
  }

  return { fetchData, data, isLoading, error }
}

export default useFetch;
