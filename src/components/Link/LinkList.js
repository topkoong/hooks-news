import React from "react";
import { FirebaseContext } from "../../firebase";
import LinkItem from './LinkItem';
import { LINKS_PER_PAGE } from "../../utils";
import axios from 'axios';



function LinkList(props) {
  const { firebase } = React.useContext(FirebaseContext);
  const [links, setLinks] = React.useState([]);
  const [cursor, setCursor] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const isNewPage = props.location.pathname.includes('new');
  const isTopPage = props.location.pathname.includes('top');
  const page = Number(props.match.params.page);
  const linksRef = firebase.db.collection('links');
  
  // Make a request
  React.useEffect(() => {
    const unsubscribe = getLinks();
    // cleanup to make sure we get rid of listener on unmount
    return () => unsubscribe();
  }, [isTopPage, page]);

  // Note that we always limit only after we've executed after orderby
  
  function getLinks() {
    const hasCursor = Boolean(cursor);
    setLoading(true);
    if(isTopPage) {
      return linksRef
      .orderBy('voteCount', 'desc')
      .limit(LINKS_PER_PAGE)
      .onSnapshot(handleSnapshot);
    } else if(page === 1) {
      return linksRef
        .orderBy('created', 'desc')
        .limit(LINKS_PER_PAGE)
        .onSnapshot(handleSnapshot);
    } else if(hasCursor) {
      return linksRef
      .orderBy('voteCount', 'desc')
      .startAfter(cursor.created)
      .limit(LINKS_PER_PAGE)
      .onSnapshot(handleSnapshot);
    } else {
      const offset = page * LINKS_PER_PAGE - LINKS_PER_PAGE;
      axios.get(`https://us-central1-hooks-news-app-e115c.cloudfunctions.net/linksPagination?offset=${offset}`)
        .then(response => {
          const links = response.data;
          const lastLink = links[links.length - 1];
          setLinks(links);
          setCursor(lastLink);
        });
      setLoading(false);
      return () => {}
    }
  }

  function handleSnapshot(snapshot) {
    const links = snapshot.docs.map(doc => {
      return { id: doc.id, ...doc.data() }
    });
    const lastLink = links[links.length - 1]
    setLinks(links);
    setCursor(lastLink);
    setLoading(false);
  }

  function visitPreviousPage() {
    if(page > 1) {
      props.history.push(`/new/${page - 1}`);
    }
  }

  function visitNextPage() {
    // that means only if we have more links that can be displayed on the current page
    // only in that case should we be able to visit the next page
    if(page <= links.length/LINKS_PER_PAGE) {
      props.history.push(`/new/${page + 1}`);
    }
  }
  const pageIndex = page ? (page - 1) * LINKS_PER_PAGE + 1 : 0;
  return (
    <div style={{ opacity: loading ? 0.25 : 1}}>
      {links.map((link, index) => (
        <LinkItem key={link.id} showCount={true} link={link} index={index + pageIndex} />
      ))}
      {
        isNewPage && (
          <div className="pagination">
            <div className="pointer mr2" onClick={visitPreviousPage}>Previous</div>
            <div className="pointer" onClick={visitNextPage}>Next</div>
          </div>
        )
      }
    </div>
  )
}

export default LinkList;
