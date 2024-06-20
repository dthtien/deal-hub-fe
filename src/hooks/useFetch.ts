import { useEffect, useState, useCallback } from 'react'
import qs from 'qs';
import { useSearchParams } from 'react-router-dom';

type MethodType = 'GET' | 'POST' | 'PUT'

type FetchDataType<T> = {
  path: string,
  requestOptions?: { method: MethodType, headers?: any },
  isAutoFetch?: boolean,
  onComplete?: (data: T) => void,
  onError?: () => void,
  query?: any,
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
    query = {},
    onComplete = () => {},
    onError = () => {}
  }: FetchDataType<DataType>
) => {
  const [data, setData] = useState<DataType | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setLoading] = useState(false)
  const [_, setSearchParams] = useSearchParams();
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

    const isAttachedQueryString = method === 'GET' && body
    isAttachedQueryString && setSearchParams(queryString);
    const fetchUrl = isAttachedQueryString ? `${url}?${queryString}` : url

    const isSendingBody = method !== 'GET' && body
    fetch(fetchUrl, isSendingBody ? { ...sendingRequestOptions, body: JSON.stringify(body) } : sendingRequestOptions )
      .then((res) => res.json())
      .then((data) => {
        setData(data)
        setLoading(false)
        onComplete(data)
      }).catch(error => {
        setError({ message: error.message, status: error.status })
        onError()
        setLoading(false);
    });
  }, [])

  if (isAutoFetch) {
    useEffect(() => fetchData(query), [])
  }

  return { fetchData, data, isLoading, error }
}

export default useFetch;
