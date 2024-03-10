import { useState, useEffect } from 'react';
import {
  Container,
  Card,
  Button,
  Row,
  Col
} from 'react-bootstrap';

import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';
import { useMutation, useQuery } from '@apollo/client';
import { GET_ME } from '../utils/queries';
import { REMOVE_BOOK } from '../utils/mutations';

// Component for displaying saved books
const SavedBooks = () => {
  // Fetching user data using GraphQL query
  const { loading, data } = useQuery(GET_ME);

  // Mutation for deleting a book
  const [deleteBook, { error }] = useMutation(REMOVE_BOOK);

  // Extracting user data if available
  const userData = data?.me || {};

  // Function to handle book deletion
  const handleDeleteBook = async (bookId) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    // If user is not authenticated, return false
    if (!token) {
      return false;
    }
    try {
      // Deleting book using GraphQL mutation
      await deleteBook({
        variables: { bookId },
      });

      // If error occurred during deletion, throw an error
      if (error) {
        throw new Error('Something went wrong, could not delete!');
      }

      // Remove book ID from local storage upon successful deletion
      removeBookId(bookId);
    } catch (err) {
      // Log any errors during deletion process
      console.error(error);
    }
  };

  // If user data is still loading, display a loading message
  if (loading) {
    return <h2>LOADING...</h2>;
  }

  return (
    <>
      {/* Header section */}
      <div fluid className="text-light bg-dark p-5">
        <Container>
          <h1>Viewing saved books!</h1>
        </Container>
      </div>
      {/* Main content section */}
      <Container>
        {/* Displaying the number of saved books */}
        <h2 className='pt-5'>
          {userData.savedBooks.length
            ? `Viewing ${userData.savedBooks.length} saved ${userData.savedBooks.length === 1 ? 'book' : 'books'}:`
            : 'You have no saved books!'}
        </h2>
        {/* Displaying saved books in a grid layout */}
        <Row>
          {userData.savedBooks.map((book) => {
            return (
              <Col md="4">
                <Card key={book.bookId} border='dark'>
                  {/* Display book cover image if available */}
                  {book.image ? <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' /> : null}
                  <Card.Body>
                    {/* Display book title, authors, and description */}
                    <Card.Title>{book.title}</Card.Title>
                    <p className='small'>Authors: {book.authors}</p>
                    <Card.Text>{book.description}</Card.Text>
                    {/* Button to delete the book */}
                    <Button className='btn-block btn-danger' onClick={() => handleDeleteBook(book.bookId)}>
                      Delete this Book!
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;
