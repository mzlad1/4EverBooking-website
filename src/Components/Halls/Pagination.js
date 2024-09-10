import React from "react";
import "./pagination.css";
import { useTranslation } from "react-i18next"; // Import translation hook

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const { t } = useTranslation(); // Initialize the translation hook
  const pageNumbers = [];
  const maxPagesToShow = 5; // Maximum number of pages to show at once

  // Calculate the start and end pages (1-based indexing)
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  // Create an array of page numbers
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="pagination">
      {/* Previous Button */}
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        {t('previous')} {/* Translated "Previous" */}
      </button>

      {/* Page Numbers */}
      {startPage > 1 && (
        <>
          <button onClick={() => onPageChange(1)}>1</button>
          <span className="dots">...</span>
        </>
      )}
      {pageNumbers.map((page) => (
        <button
          key={page}
          className={page === currentPage ? "active" : ""}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}
      {endPage < totalPages && (
        <>
          <span className="dots">...</span>
          <button onClick={() => onPageChange(totalPages)}>{totalPages}</button>
        </>
      )}

      {/* Next Button */}
      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        {t('next')} {/* Translated "Next" */}
      </button>
    </div>
  );
};

export default Pagination;
