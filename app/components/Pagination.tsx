import React from "react";
import { PaginationButton } from "./Button";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxButtons?: number; // số nút hiển thị tối đa
}

const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  onPageChange,
  maxButtons = 5,
}) => {
  if (totalPages <= 1) return null;

  let start = Math.max(1, page - Math.floor(maxButtons / 2));
  let end = start + maxButtons - 1;
  if (end > totalPages) {
    end = totalPages;
    start = Math.max(1, end - maxButtons + 1);
  }

  const pages = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className="flex justify-center items-center gap-2 mt-6">
      <PaginationButton
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
      >
        Trang trước
      </PaginationButton>
      {start > 1 && (
        <>
          <PaginationButton onClick={() => onPageChange(1)}>1</PaginationButton>
          {start > 2 && <span className="px-2">...</span>}
        </>
      )}
      {pages.map((p) => (
        <PaginationButton
          key={p}
          onClick={() => onPageChange(p)}
          disabled={p === page}
          className={p === page ? "bg-pink-700 text-white" : ""}
        >
          {p}
        </PaginationButton>
      ))}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-2">...</span>}
          <PaginationButton onClick={() => onPageChange(totalPages)}>
            {totalPages}
          </PaginationButton>
        </>
      )}
      <PaginationButton
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Trang sau
      </PaginationButton>
    </div>
  );
};

export default Pagination;
