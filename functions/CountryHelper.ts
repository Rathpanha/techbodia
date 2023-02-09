import Fuse from "fuse.js";
import { Country } from "@/types/Country";

export const CountryFilter = ({ countries, fuse, query }: {
  countries: Country[]
  fuse: Fuse<Country>
  query: any
}) => {
  let countriesFiltered: Country[] = countries;
  let total = countriesFiltered.length;
  const offset = query.page ? Number(query.page) : 1;
  const limit = 25;

  if(query.name) {
    countriesFiltered = fuse.search(String(query.name)).map(result => result.item);
    total = countriesFiltered.length;
  }

  if(query.sort) {
    countriesFiltered = CountrySort(countriesFiltered, query.sort);
  }

  countriesFiltered = countriesFiltered.slice((offset - 1) * limit, offset * limit);
  
  return { countries: countriesFiltered, offset, limit, total };
}

export const CountrySort = (countries: Country[], sortOrder: string) => {
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