import CountryRow from '@/components/CountryRow';
import styles from '@/styles/Home.module.scss';
import { Country } from '@/types/Country';
import { GetServerSideProps } from 'next';
import Head from 'next/head';

export default function Home({ countries }: { countries: Country[] }) {
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
              countries.map((country, inx) => {
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