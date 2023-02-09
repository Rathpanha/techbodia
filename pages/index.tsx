import CountryModal from '@/components/CountryModal';
import CountryRow from '@/components/CountryRow';
import { Pagination } from '@/components/Pagination';
import { CountryFilter } from '@/functions/CountryHelper';
import styles from '@/styles/Home.module.scss';
import { Country } from '@/types/Country';
import Fuse from 'fuse.js';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useRef, useState } from 'react';

export default function Home({ countries, offset, limit, total }: { 
  countries: Country[]
  offset: number 
  limit: number
  total: number
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);
  let searchTimeOut: NodeJS.Timeout;
  const router = useRouter();
  const { name, sort: sort = "default", page: page = 1 } = router.query;
  const asPaths = router.asPath.split("?");
  const queryString = asPaths[1] ? `?${asPaths[1]}` : '';
  const searchParams = new URLSearchParams(queryString);
  const startIndex = (( offset - 1 ) * limit) + ( total > 0 ? 1 : 0);
  const endIndex = offset  * limit > total ? total : offset * limit;
  const [ showPopup, setShowPopup ] = useState(false);
  const [ countryPopup, setCountryPopup ] = useState<Country>(countries[0]);

  const onSearch = () => {
    // Delay 0.5sec before searching
    clearTimeout(searchTimeOut);
    searchTimeOut = setTimeout (() => {
      if(inputRef.current) {
        resetFilter();
        let searchName = inputRef.current.value.trim();

        if(searchName) {
          searchParams.set("name", searchName);
        } else {
          searchParams.delete("name");
        }

        router.push(`?${searchParams.toString()}`);
      }
    }, 500);
  }

  const onSort = () => {
    if(selectRef.current) {
      const sortOrder = selectRef.current.value;
      searchParams.set("sort", sortOrder);

      router.push(`?${searchParams.toString()}`);
    }
  }

  const resetFilter = () => {
    if(selectRef.current) {
      searchParams.delete("sort");
      selectRef.current.value = "default";
    }

    searchParams.delete("page");
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

        <CountryModal country={countryPopup} showPopup={showPopup} onClose={() => setShowPopup(false)}/>

        <div className={styles.tool}>
          <div>
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
          </div>

          <Pagination offset={offset} limit={25} total={total}/>
          <div className={styles.result}><small>Showing { startIndex } to { endIndex } of { total } entries</small></div>
        </div>

        <table>
          <thead>
            <tr>
              <th>No</th>
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
              countries.map((country, inx) => {
                return (
                  <CountryRow 
                    key={inx} 
                    no={inx + 1} 
                    country={country} 
                    onNameClick={() => {
                      setCountryPopup(country);
                      setShowPopup(true);
                    }}
                  />
                )
              })
            }
          </tbody>
        </table>
      </main>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const res = await fetch(`https://restcountries.com/v3.1/all?fields=flags,name,cca2,cca3,altSpellings,idd`);
  const data: Country[] = await res.json();

  // Set up Fuse instance for fuzzy search
  let fuse = new Fuse(data, {
    keys: ["name.official", "name.common"]
  });

  const { countries, offset, limit, total } = CountryFilter({ countries: data, fuse, query });

  return { props: { countries, offset, limit, total } };
}