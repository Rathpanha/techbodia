import CountryRow from '@/components/CountryRow';
import styles from '@/styles/Home.module.scss';
import { Country } from '@/types/Country';
import Fuse from 'fuse.js';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useRef, useState } from 'react';

export default function Home({ countries }: { countries: Country[] }) {
  const inputRef = useRef<HTMLInputElement>(null);
  let searchTimeOut: NodeJS.Timeout;
  const router = useRouter();
  const { name } = router.query;
  
  // Set up Fuse instance for fuzzy search
  let fuse = new Fuse(countries, {
    keys: ["name.official", "name.common"]
  });
  const [ countriesFiltered, setCountriesFiltered ] = useState(!name ? countries : fuse.search(String(name)).map(result => result.item));

  const onSearch = () => {
    // Delay 1sec before searching
    clearTimeout(searchTimeOut);
    searchTimeOut = setTimeout (() => {
      if(inputRef.current) {
        console.log("search");
        let searchName = inputRef.current.value.trim();
        router.replace(searchName ? `/?name=${searchName}` : "/");

        if(searchName) {
          const results = fuse.search(searchName).map(result => result.item);
          setCountriesFiltered(results);
        } else {
          setCountriesFiltered(countries);
        }
      }
    }, 500);
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
        <h1><Link href={"/"}>Countries Catalog</Link></h1>

        <input 
          ref={inputRef}
          defaultValue={name}
          placeholder="Search by country name..."
          autoComplete="off"
          onKeyDown={onSearch}
        />

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

export const getServerSideProps: GetServerSideProps = async () => {
  const res = await fetch(`https://restcountries.com/v3.1/all?fields=flags,name,cca2,cca3,altSpellings,idd`);
  const data = await res.json();

  return { props: { countries: data } };
}