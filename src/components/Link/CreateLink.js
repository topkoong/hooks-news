import React from "react";
import useFormValidation from '../Auth/useFormValidation';
import validateCreateLink from '../Auth/validateCreateLink';
import { FirebaseContext } from "../../firebase";

const INITIAL_STATE = {
  description: '',
  url: ''
};

function CreateLink(props) {
  const {firebase, user} = React.useContext(FirebaseContext);
  const { handleSubmit, handleChange, values, errors } = useFormValidation(INITIAL_STATE, validateCreateLink, handleCreateLink);
  function handleCreateLink() {
    // If there is no user, we want to take them to a login page to sign in
    if(!user) {
      props.history.push('/login');
    } else {
      const {url, description} = values;
      const newLink = {
        url,
        description,
        postedBy: {
          id: user.uid,
          name: user.displayName
        },
        voteCount: 0,
        votes: [],
        comments: [],
        created: Date.now()
      }
      // create a document and let Cloud Firestore auto-generate an ID for you
      firebase.db.collection('links').add(newLink);
      props.history.push('/');
    }
  }

  return (
    <form onSubmit={handleSubmit} className='flex flex-column mt3'>
      <input
        onChange={handleChange}
        value={values.description}
        name='description'
        type="text"
        placeholder='A description for your link'
        autoComplete='off'
        className={errors.description && 'error-input'}
      />
      {errors.description && <p className='error-text'>{errors.description}</p>}
      <input
        onChange={handleChange}
        value={values.url}
        name='url'
        type="url"
        placeholder='The URL for the link'
        autoComplete='off'
        className={errors.url && 'error-input'}
      />
      {errors.url && <p className='error-text'>{errors.url}</p>}
      <button className='button' type='submit'>Submit</button>
    </form>
  );
}

export default CreateLink;
