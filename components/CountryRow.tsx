import { Country } from "@/types/Country";
import Image from "next/image";

const CountryRow = ({ country, no, onNameClick } : { 
  country: Country
  no: number
  onNameClick: () => void 
}) => {
  const nameNativeRow = [];
  for(const key in country.name.nativeName) {
    nameNativeRow.push(<li key={key}>{country.name.nativeName[key].official}</li>);
  }

  const nameAlternative = country.altSpellings.map((name, inx) => {
    return <li key={inx}>{name}</li>;
  });

  const callingCodes = country.idd.suffixes.map((code, inx) => {
    return <li key={inx}>{country.idd.root}{code}</li>;
  });

  return (
    <tr>
      <td>{no}</td>
      <td><Image unoptimized={true} src={country.flags.png} alt={country.name.official} width={100} height={72}/></td>
      <td onClick={onNameClick} style={{ cursor: "pointer" }}>{country.name.official}</td>
      <td>
        <ul>
          {nameNativeRow}
        </ul>
      </td>
      <td>
        <ul>
          {nameAlternative}
        </ul>
      </td>
      <td>{country.cca2}</td>
      <td>{country.cca3}</td>
      <td> 
        {
          country.idd.suffixes.length > 1 ?
            <ul>
              {callingCodes}
            </ul> : (
              country.idd.suffixes.length > 0 ? 
                `${country.idd.root}${country.idd.suffixes[0]}` : "Unknown"
            )
        }
      </td>
    </tr>
  );
}

export default CountryRow;