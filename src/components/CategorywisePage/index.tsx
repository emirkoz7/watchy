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

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const dummyList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

interface CategorywisePageProps {
  categoryDiv: string;
  categoryPage?: "anime" | "kdrama" | null;
}

const CategorywisePage: React.FC<CategorywisePageProps> = ({
  categoryDiv,
  categoryPage = null,
}) => {
  const [categoryType, setCategoryType] = useState(categoryDiv || "movie");
  const [category, setCategory] = useState("latest");
  const [data, setData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalpages, setTotalpages] = useState(1);
  const [showFilter, setShowFilter] = useState(false);
  const [filterGenreList, setFilterGenreList] = useState("");
  const [filterCountry, setFiltercountry] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [trigger, setTrigger] = useState(false);
  const [loading, setLoading] = useState(true);
  const CapitalCategoryType = capitalizeFirstLetter(categoryType);

  useEffect(() => {
    if (loading) {
      NProgress.start();
    } else {
      NProgress.done(false);
    }
  }, [loading]);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        let data;
        if (category === "filter") {
          data = await axiosFetch({
            requestID: `${category}${CapitalCategoryType}`,
            page: currentPage,
            genreKeywords: filterGenreList,
            ...(filterCountry && { country: filterCountry }),
            ...(filterYear && { year: filterYear }),
            ...(sortBy && { sortBy }),
          });
        } else if (categoryPage === "anime") {
          data = await axiosFetch({
            requestID:
              categoryType === "tv" ? "withKeywordsTv" : "withKeywordsMovie",
            sortBy: category === "latest"
              ? categoryType === "tv"
                ? "first_air_date.desc"
                : "primary_release_date.desc"
              : category === "trending"
                ? "popularity.desc"
                : category === "topRated"
                  ? "vote_count.desc"
                  : undefined,
            genreKeywords: "210024,",
            page: currentPage,
          });
        } else if (categoryPage === "kdrama") {
          data = await axiosFetch({
            requestID:
              categoryType === "tv" ? "withKeywordsTv" : "withKeywordsMovie",
            sortBy: category === "latest"
              ? categoryType === "tv"
                ? "first_air_date.desc"
                : "primary_release_date.desc"
              : category === "trending"
                ? "popularity.desc"
                : category === "topRated"
                  ? "vote_count.desc"
                  : undefined,
            genreKeywords: ",",
            country: "KR",
            page: currentPage,
          });
        } else {
          data = await axiosFetch({
            requestID: `${category}${CapitalCategoryType}`,
            page: currentPage,
          });
        }

        if (data.page > data.total_pages) {
          setCurrentPage(data.total_pages);
        }
        if (currentPage > data.total_pages) {
          setCurrentPage(data.total_pages);
          return;
        }
        setData(data.results || []);
        setTotalpages(data.total_pages > 500 ? 500 : data.total_pages);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setData([]);
        setLoading(false);
      }
    };
    fetchData();
  }, [categoryType, category, currentPage, trigger, CapitalCategoryType]);

  const handleFilterClick = () => {
    setCurrentPage(1);
    setCategory("filter");
    setShowFilter(!showFilter);
  };

  return (
    <div className={styles.MoviePage}>
      <h1>
        {categoryPage === null
          ? CapitalCategoryType
          : categoryPage === "anime"
            ? "Anime"
            : "K-Drama"}
      </h1>
      <div className={styles.category}>
        <p
          className={`${category === "latest" ? styles.active : styles.inactive}`}
          onClick={() => setCategory("latest")}
        >
          Latest
        </p>
        <p
          className={`${category === "trending" ? styles.active : styles.inactive}`}
          onClick={() => setCategory("trending")}
        >
          Trending
        </p>
        <p
          className={`${category === "topRated" ? styles.active : styles.inactive}`}
          onClick={() => setCategory("topRated")}
        >
          Top-Rated
        </p>
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
        {Array.isArray(data) &&
          data.map((ele: any) => (
            <MovieCardSmall key={ele.id} data={ele} media_type={categoryType} />
          ))}
        {(!data || data.length === 0) &&
          dummyList.map((ele) => (
            <Skeleton key={ele} className={styles.loading} />
          ))}
      </div>
      <ReactPaginate
        containerClassName={styles.pagination}
        pageClassName={styles.page_item}
        activeClassName={styles.paginateActive}
        onPageChange={(event) => {
          setCurrentPage(event.selected + 1);
          if (currentPage > totalpages) {
            setCurrentPage(totalpages);
          }
          window.scrollTo(0, 0);
        }}
        forcePage={currentPage - 1}
        pageCount={totalpages}
        breakLabel=" ... "
        previousLabel={<AiFillLeftCircle className={styles.paginationIcons} />}
        nextLabel={<AiFillRightCircle className={styles.paginationIcons} />}
      />
    </div>
  );
};

export default CategorywisePage;
