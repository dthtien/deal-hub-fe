import { useParams } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import { Button, Card, CardBody, CardFooter, List, Spinner, Typography } from "@material-tailwind/react";
import { QuoteProps } from "./types";
import { useEffect } from "react";
import VehicleRegisterDetails from "../VehicleRegisterDetails";

type QuoteItem = {
  id: number;
  provider: string;
  cover_type: string;
  description?: string;
  annual_price: string;
  monthly_price: string;
  created_at: string;
}

type QuoteDetails = QuoteProps & {
  id: string;
  quote_items: QuoteItem[];
  status: string;
  driver_first_name: string;
  driver_last_name: string;
}

const QuoteShow = () => {
  const { id } = useParams();
  const { data, isLoading, fetchData} = useFetch<QuoteDetails>({
    path: `v1/insurances/quotes/${id}`,
    isAutoFetch: true
  });

  useEffect(() => {
    if (!data) return;

    if (data.status === 'initiated' || data.status === 'pending') {
      setTimeout(() => {
        fetchData();
      }, 500);
    }
  }, [data]);


  if (!data && isLoading) return <Spinner color="blue" />;
  if (!data) return null;

  return (
    <div>
      <Typography className="ml-3">
        Driver Name: {data.driver_first_name} {data.driver_last_name}
      </Typography>

      <VehicleRegisterDetails
        plate={data.plate}
        plateState={data.plate_state as string}
      />
      <List>
      {
        data.quote_items.map(quoteItem => (
          <Card className="mt-3" key={quoteItem.id}>
            <CardBody>
              <Typography variant="h5" color="blue-gray" className="mb-2">
                {quoteItem.provider} - {quoteItem.cover_type}
              </Typography>
              {
                quoteItem.description && (
                  <Typography>{quoteItem.description}</Typography>
                )
              }
              {
                quoteItem.annual_price && (
                  <Typography>Annual Price: ${quoteItem.annual_price}</Typography>
                )
              }

              {
                quoteItem.monthly_price && (
                  <Typography>Monthly Price: ${quoteItem.monthly_price}</Typography>
                )
              }

              <Typography variant="small" color="blue-gray" className="mt-2">
                Created at: {quoteItem.created_at}
              </Typography>
            </CardBody>
            <CardFooter className="pt-0">
              <Button>Read More</Button>
            </CardFooter>
          </Card>
        ))
      }
      </List>

    </div>
  )
}

export default QuoteShow;
