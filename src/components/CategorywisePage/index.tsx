import { useState, useEffect } from "react";
import axiosFetch from "@/Utils/fetchBackend"; // Assuming this returns { results: [], page: number, total_pages: number } or throws error
import styles from "./style.module.scss";
import MovieCardSmall from "@/components/MovieCardSmall";
import ReactPaginate from "react-paginate"; // for pagination
import { AiFillLeftCircle, AiFillRightCircle } from "react-icons/ai";
import { MdFilterAlt, MdFilterAltOff } from "react-icons/md";
import Filter from "../Filter";
import Skeleton from "react-loading-skeleton";
import NProgress from "nprogress";
// import MoviePoster from '@/components/MoviePoster';

// Added safety check for undefined/null/empty string
function capitalizeFirstLetter(string: string | undefined | null): string {
  if (!string) return ""; // Return empty string if input is falsy
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const dummyList = Array.from({ length: 10 }, (_, i) => i + 1); // Slightly cleaner dummy list generation

// Added default prop for categoryDiv to prevent it from being undefined
const CategorywisePage = ({ categoryDiv = "movie", categoryPage = null }: any) => {
  const [categoryType, setCategoryType] = useState(categoryDiv);
  const [category, setCategory] = useState("latest"); // latest, trending, topRated
  const [data, setData] = useState<any[]>([]); // Explicitly type as array
  const [currentPage, setCurrentPage] = useState(1);
  const [totalpages, setTotalpages] = useState(1);
  const [showFilter, setShowFilter] = useState(false);
  const [filterGenreList, setFilterGenreList] = useState("");
  const [filterCountry, setFiltercountry] = useState<string | undefined>(); // Type state
  const [filterYear, setFilterYear] = useState<number | undefined>();       // Type state
  const [sortBy, setSortBy] = useState<string | undefined>();             // Type state
  const [trigger, setTrigger] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Add error state

  // Memoize CapitalCategoryType to avoid recalculation on every render
  const CapitalCategoryType = useMemo(
    () => capitalizeFirstLetter(categoryType),
    [categoryType]
  );

  // NProgress effect
  useEffect(() => {
    if (loading) {
      NProgress.start();
    } else {
      NProgress.done(); // Use NProgress.done() without false argument
    }
    // Cleanup function for NProgress
    return () => {
      NProgress.done();
    };
  }, [loading]);

  // Data fetching effect
  useEffect(() => {
    setLoading(true);
    setError(null); // Reset error on new fetch
    // Cancel previous requests if needed (using AbortController - advanced, optional)
    // const controller = new AbortController();

    const fetchData = async () => {
      // Reset data only if not paginating within the same category/filter to avoid blink
      // setData([]); // Consider if you *really* want the blink effect

      // Determine sort parameter cleanly
      let sortParam: string | undefined;
      if (category === "latest") {
        sortParam = categoryType === "tv" ? "first_air_date.desc" : "primary_release_date.desc";
      } else if (category === "trending") {
        sortParam = "popularity.desc";
      } else if (category === "topRated") {
        sortParam = "vote_count.desc";
      } else if (category === "filter" && sortBy) { // Use sortBy only when category is 'filter'
          sortParam = sortBy;
      }

      // Determine request ID and parameters
      let requestID: string;
      let params: any = { page: currentPage }; // Base params

      if (category === "filter") {
        requestID = `${category}${CapitalCategoryType}`;
        params = {
            ...params,
            genreKeywords: filterGenreList,
            country: filterCountry,
            year: filterYear,
            sortBy: sortParam // Use the determined sortParam
        };
      } else if (categoryPage === "anime") {
        requestID = categoryType === "tv" ? "withKeywordsTv" : "withKeywordsMovie";
        params = { ...params, sortBy: sortParam, genreKeywords: "210024," }; // ID for Anime genre? Ensure this is correct.
      } else if (categoryPage === "kdrama") {
        requestID = categoryType === "tv" ? "withKeywordsTv" : "withKeywordsMovie";
        params = { ...params, sortBy: sortParam, genreKeywords: ",", country: "KR" }; // Empty genreKeywords? Check if intended.
      } else {
        requestID = `${category}${CapitalCategoryType}`;
        params = { ...params, sortBy: sortParam }; // Apply sortParam for non-filter/special pages too
      }

      try {
        console.log("Fetching with:", { requestID, params }); // Debug fetch call
        const response = await axiosFetch({
          requestID: requestID,
          ...params
          // signal: controller.signal // Optional: For aborting requests
        });

        // **Safeguard API response**: Check if response and results exist
        if (response && Array.isArray(response.results)) {
          // Clamp total pages to API limit (e.g., 500 for TMDB)
          const apiTotalPages = response.total_pages ?? 1;
          const clampedTotalPages = Math.min(apiTotalPages, 500);
          setTotalpages(clampedTotalPages);

          // Adjust current page if it's out of bounds *after* fetch
          if (response.page > clampedTotalPages && clampedTotalPages > 0) {
            // If fetched page is invalid, refetch page 1 or clampedTotalPages?
            // For simplicity, just set state, but ideally, refetch or handle differently.
            setCurrentPage(clampedTotalPages);
             // Avoid setting data from an invalid page response if possible
             // setData([]); // Clear data if page was invalid? Or let it refetch?
          } else {
             setData(response.results);
          }

        } else {
          // Handle cases where response is not as expected
          console.error("Invalid data structure received:", response);
          setData([]);
          setTotalpages(1);
          setError("Failed to load data. Invalid response structure.");
        }
      } catch (error: any) {
        console.error("Error fetching data:", error);
        setError(`Error fetching data: ${error.message || 'Unknown error'}`);
        setData([]); // Clear data on error
        setTotalpages(1); // Reset pages on error
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Optional: Cleanup function to abort fetch if component unmounts or dependencies change
    // return () => {
    //   controller.abort();
    // };

  // Dependencies: Ensure all variables used inside the effect are listed
  }, [
      categoryType,
      category,
      currentPage,
      trigger,
      categoryPage,
      filterGenreList,
      filterCountry,
      filterYear,
      sortBy,
      CapitalCategoryType // Added CapitalCategoryType as it's used for requestID
  ]);


  // Reset page number when category/filters change (but not just 'trigger')
  useEffect(() => {
      setCurrentPage(1);
  }, [categoryType, category, filterGenreList, filterCountry, filterYear, sortBy, categoryPage]);


  const handlePageClick = (event: { selected: number }) => {
    // `event.selected` is 0-based index
    const newPage = event.selected + 1;
    setCurrentPage(newPage);
    window.scrollTo(0, 0); // Scroll to top on page change
  };


  const handleFilterClick = () => {
    // No need to set current page here, the useEffect above handles it
    setCategory("filter");
    setShowFilter(!showFilter); // Toggle filter visibility
  };

  return (
    <div className={styles.MoviePage}>
      <h1>
        {(categoryPage === null && CapitalCategoryType) ||
          (categoryPage === "anime" && "Anime") ||
          (categoryPage === "kdrama" && "K-Drama")}
        {/* Add Loading/Error indicators */}
         {loading && ' (Loading...)'}
         {error && ' (Error!)'}
      </h1>

      <div className={styles.category}>
        {/* Category Selection */}
        {["latest", "trending", "topRated"].map((cat) => (
            <p
              key={cat}
              className={`${category === cat ? styles.active : styles.inactive}`}
              onClick={() => setCategory(cat)}
            >
              {capitalizeFirstLetter(cat)}
            </p>
        ))}

        {/* Filter Toggle OR Type Select */}
        {categoryPage === null ? (
          <p
            className={`${category === "filter" ? styles.active : styles.inactive} ${styles.filter}`}
            onClick={handleFilterClick}
            role="button" // Improve accessibility
            tabIndex={0}  // Improve accessibility
            onKeyPress={(e) => e.key === 'Enter' && handleFilterClick()} // Improve accessibility
          >
            Filter{" "}
            {category === "filter" ? (
              <MdFilterAlt className={styles.active} />
            ) : (
              <MdFilterAltOff />
            )}
          </p>
        ) : (
          <select
            name="categoryType"
            id="categoryType"
            value={categoryType}
            onChange={(e) => setCategoryType(e.target.value)}
            className={styles.filter}
            aria-label="Select media type" // Improve accessibility
          >
            <option value="movie">Movie</option>
            <option value="tv">Tv</option> {/* Removed defaultChecked - value controls it */}
          </select>
        )}
      </div>

      {/* Filter Component */}
      {showFilter && categoryPage === null && ( // Only show Filter if categoryPage is null
        <Filter
          categoryType={categoryType}
          setShowFilter={setShowFilter}
          setFilterYear={setFilterYear}
          setFiltercountry={setFiltercountry}
          setFilterGenreList={setFilterGenreList}
          filterGenreList={filterGenreList}
          filterCountry={filterCountry}
          filterYear={filterYear}
          sortBy={sortBy}
          setSortBy={setSortBy}
          setCategory={setCategory} // Pass setCategory if Filter needs to change it
          setTrigger={setTrigger}
          trigger={trigger}
        />
      )}

      {/* Error Message */}
      {error && <p className={styles.error}>Error: {error}</p>}

      {/* Movie List / Skeletons / No Results */}
      <div className={styles.movieList}>
        {loading &&
          dummyList.map((i) => (
            <Skeleton key={`skel-${i}`} className={styles.loading} height={280} width={185} /> // Give skeleton explicit size if possible
          ))}
        {!loading && !error && data?.length > 0 && // **FIX**: Use optional chaining `data?.map`
          data.map((ele: any) => ( // Consider defining a type for 'ele'
            <MovieCardSmall key={ele.id} data={ele} media_type={categoryType} /> // Add unique key prop
          ))}
        {!loading && !error && data?.length === 0 && (
          <p className={styles.noResults}>No results found.</p> // Show message when empty
        )}
      </div>

      {/* Pagination - Only show if more than one page and not loading/error */}
      {!loading && !error && totalpages > 1 && (
        <ReactPaginate
          containerClassName={styles.pagination}
          pageClassName={styles.page_item}
          activeClassName={styles.paginateActive}
          onPageChange={handlePageClick}
          forcePage={currentPage - 1} // react-paginate is 0-based index
          pageCount={totalpages}
          pageRangeDisplayed={3} // Adjust as needed
          marginPagesDisplayed={1} // Adjust as needed
          breakLabel=" ... "
          previousLabel={<AiFillLeftCircle className={styles.paginationIcons} aria-label="Previous page" />}
          nextLabel={<AiFillRightCircle className={styles.paginationIcons} aria-label="Next page" />}
          renderOnZeroPageCount={null} // Don't render if pageCount is 0
        />
      )}
      {/* Remove trailing semicolon */}
    </div>
  );
};

export default CategorywisePage;
