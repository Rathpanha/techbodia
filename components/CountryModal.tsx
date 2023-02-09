import { Country } from "@/types/Country";
import styles from '@/styles/Modal.module.scss';
import Image from "next/image";

const CountryModal = ({ country, showPopup, onClose }: {
  country: Country
  showPopup: boolean
  onClose: () => void 
}) => {
  const nativeNames = [];
  for(const key in country.name.nativeName) {
    nativeNames.push(country.name.nativeName[key].official);
  }

  const callingCodes = country.idd.suffixes.map((code, inx) => {
    return `${country.idd.root}${code}`;
  });

  return (
    <div 
      className={`${styles.modalWrapper} ${(showPopup ? styles.show : "")}`}
      onClick={(e) => {
        //Ignore when click on child element
        if(e.target !== e.currentTarget) return;
        onClose();
      }}
    >
      <div className={styles.modal}>
        <h1>{country.name.official}</h1>
        <table>
          <tbody>
            <tr>
              <td>Flag</td>
              <td>: <Image unoptimized={true} src={country.flags.png} alt={country.name.official} width={50} height={36}/></td>
            </tr>
            <tr>
              <td>Name</td>
              <td>: {country.name.official}</td>
            </tr>
            <tr>
              <td>Native Name</td>
              <td>: {nativeNames.join(", ")}</td>
            </tr>
            <tr>
              <td>Alternative Name</td>
              <td>: {country.altSpellings.join(", ")}</td>
            </tr>
            <tr>
              <td>CCA2</td>
              <td>: {country.cca2}</td>
            </tr>
            <tr>
              <td>CCA3</td>
              <td>: {country.cca3}</td>
            </tr>
            <tr>
              <td>IDD</td>
              <td>: {callingCodes.join(", ")}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CountryModal;