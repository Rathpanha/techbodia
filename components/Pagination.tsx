import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';
import styles from '@/styles/Pagination.module.scss';

type Props = {
  total: number
  limit: number
  offset: number
}

export function Pagination(props: Props) {
  const router = useRouter();
  let pageCount = Math.ceil(props.total / props.limit);
  let start = (props.offset < 4) ? 1 : props.offset - 1;
  let end = 3 + start;
  end = (pageCount < end) ? pageCount : end;
  let diff = start - end + 4;
  start -= (start - diff > 0) ? diff : 0;

  const asPaths = router.asPath.split("?");
  const pathname = asPaths[0];
  const queryString = asPaths[1] ? `?${asPaths[1]}` : '';
  const search = new URLSearchParams(queryString);
  search.delete("page");
  const base: string = pathname + '?' + (search.toString() !== "" ? search.toString() + "&" : "");
  let pages: ReactNode[] = [];
  
  //Construct Previous Page
  pages.push(
    <li key="_previous" className={`${styles.pageButton} ${(props.offset === 1 ? styles.disabled : "")}`}>
      <Link className={styles.pageLink} href={ base + 'page=' + (props.offset - 1) }>Previous Page</Link>
    </li>
  );

  pages.push(
    <li key="_next" className={`${styles.pageButton} ${(props.offset === pageCount || props.total === 0 ? styles.disabled : "")}`}>
      <Link className={styles.pageLink} href={ base + 'page=' + (props.offset + 1 ) }>Next Page</Link>
    </li>
  );
  
  return (
    <div className={styles.paginationWrapper}>
      <ul className={styles.paginationButton}>
        { pages }
      </ul>
    </div>
  );
}