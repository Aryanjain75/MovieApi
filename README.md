
---

# Movie Review API

## Overview

This is a RESTful API for managing movies and their reviews. It allows users to:
- Add, update, and delete movie details.
- Submit, update, and delete reviews for movies.
- Fetch movies and reviews based on different parameters.

This API supports user reviews, ratings, and other movie-related information like title, release year, runtime, and tags.

## Features

- Add, update, and delete movies.
- Add, update, and delete reviews for movies.
- View all reviews for a specific movie.
- Fetch all reviews submitted by a specific user.

## API Endpoints

### Movies

| **Route**                | **Method** | **Description**                                          |
|--------------------------|------------|----------------------------------------------------------|
| `/in/:id`                | GET        | Get details of a specific movie.                          |
| `/in/:id`                | PUT        | Update details of a specific movie.                       |
| `/in/:id`                | DELETE     | Delete a specific movie.                                 |

### Reviews

| **Route**                | **Method** | **Description**                                          |
|--------------------------|------------|----------------------------------------------------------|
| `/in/:id/review`         | POST       | Add a review for a movie.                                |
| `/Review/:email`         | GET        | Get all reviews submitted by a specific user.            |
| `/Review/:id/:Movieid`   | PUT        | Update a specific review for a movie.                    |
| `/Review/:id/:Movieid`   | DELETE     | Delete a specific review for a movie.                    |
| `/Review/:id`            | GET        | Get all reviews for a specific movie.                    |

## Example Request and Responses

### Add a Review for a Movie

- **Route:** `POST /in/:id/review`
- **Request Body:**
  ```
  {
    "name": "Jane Doe",
    "email": "janedoe@example.com",
    "review": "Amazing movie!",
    "stars": 5
  }
  ```
- **Response:**
  ```
  {
    "message": "Review added successfully"
  }
  ```

### Update Movie Details

- **Route:** `PUT /in/:id`
- **Request Body:**
  ```
  {
    "title": "New Movie Title",
    "movieImage": "https://example.com/image.jpg",
    "releaseYear": 2024,
    "tags": ["action", "comedy"]
  }
  ```
- **Response:**
  ```
  {
    "message": "Movie details updated successfully"
  }
  ```

### Get All Reviews for a Specific Movie

- **Route:** `GET /Review/:id`
- **Response:**
  ```
  [
    {
      "name": "Jane Doe",
      "review": "Amazing movie!",
      "stars": 5
    },
    {
      "name": "John Smith",
      "review": "Great plot but slow pacing.",
      "stars": 3
    }
  ]
  ```

## Technologies Used

- Node.js
- Express.js
- MongoDB (or another database)
- JSON Web Tokens (JWT) for authentication (if applicable)
- Body-parser (for parsing incoming request bodies)

## Installation

### Prerequisites

Ensure you have the following installed on your machine:

- Node.js
- npm or yarn

### Steps to Run Locally

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/movie-review-api.git
   cd movie-review-api
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables (if applicable):
   - Create a `.env` file in the root of the project.
   - Add your environment variables (e.g., database connection string, JWT secret).

4. Run the server:
   ```
   npm start
   ```

5. Open your browser and navigate to `http://localhost:3000` to test the API.

## Contributing

We welcome contributions! To contribute, please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m 'Add new feature'`).
4. Push to your fork (`git push origin feature/your-feature`).
5. Open a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Feel free to modify the above template to fit your project.
