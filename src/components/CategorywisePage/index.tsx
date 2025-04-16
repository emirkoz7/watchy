import { useState, useEffect } from "react";
import axiosFetch from "@/Utils/fetchBackend";
import styles from "./style.module.scss";
import MovieCardSmall from "@/components/MovieCardSmall";
import ReactPaginate from "react-paginate";
import { AiFillLeftCircle, AiFillRightCircle } from "react-icons/ai";
import { MdFilterAlt, MdFilterAltOff } from "react-icons/md";
import Filter from "../Filter";
import Skeleton from "react-loading-skeleton";
import NProgress from "nprogress";

function capitalizeFirstLetter(str: string = "") {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const dummyList = Array.from({ length: 10 }, (_, i) => i);

const CategorywisePage = ({ categoryDiv = "movie", categoryPage = null }: any) => {
  const [categoryType, setCategoryType] = useState<string>(categoryDiv);
  const [category, setCategory] = useState<string>("latest");
  const [data, setData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalpages, setTotalpages] = useState<number>(1);
  const [showFilter, setShowFilter] = useState<boolean>(false);
  const [filterGenreList, setFilterGenreList] = useState<string>("");
  const [filterCountry, setFiltercountry] = useState<string | undefined>();
  const [filterYear, setFilterYear] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [trigger, setTrigger] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const CapitalCategoryType = capitalizeFirstLetter(categoryType);

  useEffect(() => {
    if (loading) {
      NProgress.start();
    } else {
      NProgress.done();
    }
  }, [loading]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let result;
        const requestID = `${category}${CapitalCategoryType}`;
        const sortMap = {
          latest: categoryType === "tv" ? "first_air_date.desc" : "primary_release_date.desc",
          trending: "popularity.desc",
          topRated: "vote_count.desc",
        };

        if (category === "filter") {
          result = await axiosFetch({
            requestID,
            page: currentPage,
            genreKeywords: filterGenreList,
            country: filterCountry,
            year: filterYear,
            sortBy,
          });
        } else if (categoryPage === "anime") {
          result = await axiosFetch({
            requestID: categoryType === "tv" ? "withKeywordsTv" : "withKeywordsMovie",
            sortBy: sortMap[category as keyof typeof sortMap],
            genreKeywords: "210024,",
            page: currentPage,
          });
        } else if (categoryPage === "kdrama") {
          result = await axiosFetch({
            requestID: categoryType === "tv" ? "withKeywordsTv" : "withKeywordsMovie",
            sortBy: sortMap[category as keyof typeof sortMap],
            genreKeywords: ",",
            country: "KR",
            page: currentPage,
          });
        } else {
          result = await axiosFetch({
            requestID,
            page: currentPage,
          });
        }

        const safePage = Math.min(result?.page || 1, result?.total_pages || 1);
        if (currentPage > safePage) {
          setCurrentPage(safePage);
          return;
        }

        setData(result?.results || []);
        setTotalpages(Math.min(result?.total_pages || 1, 500));
      } catch (err) {
        console.error("Error fetching data:", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryType, category, currentPage, trigger]);

  const handleFilterClick = () => {
    setCurrentPage(1);
    setCategory("filter");
    setShowFilter(!showFilter);
  };

  return (
    <div className={styles.MoviePage}>
      <h1>
        {(categoryPage === null && CapitalCategoryType) ||
          (categoryPage === "anime" && "Anime") ||
          (categoryPage === "kdrama" && "K-Drama")}
      </h1>

      <div className={styles.category}>
        {["latest", "trending", "topRated"].map((cat) => (
          <p
            key={cat}
            className={`${category === cat ? styles.active : styles.inactive}`}
            onClick={() => setCategory(cat)}
          >
            {capitalizeFirstLetter(cat.replace("topRated", "Top-Rated"))}
          </p>
        ))}
        {categoryPage === null ? (
          <p
            className={`${category === "filter" ? styles.active : styles.inactive} ${styles.filter}`}
            onClick={handleFilterClick}
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
          >
            <option value="movie">Movie</option>
            <option value="tv">Tv</option>
          </select>
        )}
      </div>

      {showFilter && (
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
          setCategory={setCategory}
          setTrigger={setTrigger}
          trigger={trigger}
        />
      )}

      <div className={styles.movieList}>
        {data.length > 0
          ? data.map((ele: any, idx: number) => (
              <MovieCardSmall
                key={ele.id || `movie-${idx}`}
                data={ele}
                media_type={categoryType}
              />
            ))
          : dummyList.map((ele) => (
              <Skeleton key={ele} className={styles.loading} />
            ))}
      </div>

      <ReactPaginate
        containerClassName={styles.pagination}
        pageClassName={styles.page_item}
        activeClassName={styles.paginateActive}
        onPageChange={(event) => {
          const newPage = event.selected + 1;
          if (newPage <= totalpages) {
            setCurrentPage(newPage);
            window.scrollTo(0, 0);
          }
        }}
        forcePage={Math.max(0, currentPage - 1)}
        pageCount={totalpages}
        breakLabel="..."
        previousLabel={<AiFillLeftCircle className={styles.paginationIcons} />}
        nextLabel={<AiFillRightCircle className={styles.paginationIcons} />}
      />
    </div>
  );
};

export default CategorywisePage;
