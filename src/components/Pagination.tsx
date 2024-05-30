import { Button, IconButton } from "@material-tailwind/react";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

type PaginationProps = {
  page: number;
  setPage: (page: number) => void;
  totalPage?: number;
  showPage?: boolean;
  showNextPage?: boolean;
}

export function Pagination({
  page, totalPage, setPage, showPage = true, showNextPage
  }: PaginationProps ) {
  const getItemProps = (index: number) =>
    ({
      variant: page === index ? "filled" : "text",
      color: "gray",
      onClick: () => setPage(index),
    } as any);

  const next = () => {
    setPage(page + 1);
  };

  const prev = () => {
    if (page === 0) return;
    setPage(page - 1);
  };

  return (
    <div className="flex items-center gap-4 overflow-auto">
      <Button
        variant="text"
        className="flex items-center gap-2"
        onClick={prev}
        disabled={page === 1}
      >
        <ArrowLeftIcon strokeWidth={2} className="h-4 w-4" /> Previous
      </Button>
      <div className="flex items-center gap-2">
      {
        showPage && [...Array(totalPage)].map((_, index) => (
          <IconButton
            key={index}
            {...getItemProps(index + 1)}
          >
            {index + 1}
          </IconButton>
        ))
      }
      </div>
      <Button
        variant="text"
        className="flex items-center gap-2"
        onClick={next}
        disabled={page === totalPage || !showNextPage}
      >
        Next
        <ArrowRightIcon strokeWidth={2} className="h-4 w-4" />
      </Button>
    </div>
  );
}
