import CountryRow from '@/components/CountryRow';
import styles from '@/styles/Home.module.scss';
import { Country } from '@/types/Country';
import Fuse from 'fuse.js';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useRef, useState } from 'react';

export default function Home({ countries }: { countries: Country[] }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);
  let searchTimeOut: NodeJS.Timeout;
  const router = useRouter();
  const { name, sort: sort = "default" } = router.query;
  const asPaths = router.asPath.split("?");
  const queryString = asPaths[1] ? `?${asPaths[1]}` : '';
  const searchParams = new URLSearchParams(queryString);
  
  // Set up Fuse instance for fuzzy search
  let fuse = new Fuse(countries, {
    keys: ["name.official", "name.common"]
  });

  // Filter country by query params
  const [ countriesFiltered, setCountriesFiltered ] = useState(filterCountriesByQueryParams({
    countries: countries,
    fuse: fuse,
    params: router.query
  }));

  const onSearch = () => {
    // Delay 1sec before searching
    clearTimeout(searchTimeOut);
    searchTimeOut = setTimeout (() => {
      if(inputRef.current) {
        resetFilter();
        let searchName = inputRef.current.value.trim();

        if(searchName) {
          searchParams.set("name", searchName);
          const results = fuse.search(searchName).map(result => result.item);
          setCountriesFiltered(results);
        } else {
          searchParams.delete("name");
          setCountriesFiltered(countries);
        }

        router.replace(`?${searchParams.toString()}`);
      }
    }, 500);
  }

  const onSort = () => {
    if(selectRef.current) {
      const sortOrder = selectRef.current.value;
      searchParams.set("sort", sortOrder);

      setCountriesFiltered(sortCountries(countriesFiltered, sortOrder));
      router.replace(`?${searchParams.toString()}`);
    }
  }

  const resetFilter = () => {
    if(selectRef.current) {
      searchParams.delete("sort");
      selectRef.current.value = "default";
    }
  }

  return (
    <>
      <Head>
        <title>Countries Catalog</title>
        <meta name="description" content="Countries Catalog Implementation" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1>Countries Catalog</h1>

        <input 
          ref={inputRef}
          defaultValue={name}
          placeholder="Search by country name..."
          autoComplete="off"
          onKeyDown={onSearch}
        />

        <select ref={selectRef} onChange={onSort} defaultValue={sort}>
          <option value="default" disabled>Sort</option>
          <option value="asc">ASC</option>
          <option value="desc">DESC</option>
        </select>

        <table>
          <thead>
            <tr>
              <th>Flag</th>
              <th>Name</th>
              <th>Native Name</th>
              <th>Alternative Name</th>
              <th>CCA2</th>
              <th>CCA3</th>
              <th>IDD</th>
            </tr>
          </thead>

          <tbody>
            {
              countriesFiltered.map((country, inx) => {
                return <CountryRow key={inx} country={country}/>;
              })
            }
          </tbody>
        </table>
      </main>
    </>
  )
}

const filterCountriesByQueryParams = ({ countries, fuse, params }: {
  countries: Country[]
  fuse: Fuse<Country>
  params: any
}) => {
  let countriesFiltered: Country[] = countries;

  if(params.name) {
    countriesFiltered = fuse.search(String(params.name)).map(result => result.item);
  }

  if(params.sort) {
    countriesFiltered = sortCountries(countriesFiltered, params.sort);
  }

  return countriesFiltered;
}

const sortCountries = (countries: Country[], sortOrder: string) => {
  countries.sort((a, b) => {
    const nameA = a.name.official.toUpperCase(); // ignore upper and lowercase
    const nameB = b.name.official.toUpperCase(); // ignore upper and lowercase

    if(sortOrder === "asc") {
      if(nameA < nameB) return -1;
      if(nameA > nameB) return 1;
    } else if(sortOrder === "desc") {
      if(nameA < nameB) return 1;
      if(nameA > nameB) return -1;
    }

    return 0;
  });

  return [...countries];
}

export const getServerSideProps: GetServerSideProps = async () => {
  const res = await fetch(`https://restcountries.com/v3.1/all?fields=flags,name,cca2,cca3,altSpellings,idd`);
  const data = await res.json();

  return { props: { countries: data } };
}