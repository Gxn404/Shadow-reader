

# Shadow reader API

A serverless API built with Node.js to fetch and display manga details using the MangaDex API. This project is designed for easy deployment on Vercel and supports caching for efficient performance.

---

## 🚀 Features

- **Search Manga**: Fetch manga details by title.
- **Detailed Results**: Includes title, description, cover image, genres, and more.
- **Caching**: Reduces API calls with a configurable TTL cache.
- **Serverless**: Optimized for deployment on Vercel.

---

## 📁 Project Structure

```bash
.
├── api/
│   ├── manga/
│   │   └── search.js      # Main API handler for manga search
│   └── index.js           # Entry point for serverless functions
├── .env                   # Environment variables
├── .gitignore             # Ignored files
├── package.json           # Dependencies and scripts
├── README.md              # Project documentation
└── vercel.json            # Vercel configuration
```

---

🛠️ Setup and Installation

1. Clone the repository:

```bash
git clone https://github.com/ShadowmaxCoder/Shadow-reader.git
cd Shadow-reader
```

2. Install dependencies:

```bash
npm install
```

3. Environment Variables: Create a .env file in the root directory and add:

```bash
MANGADX_API_URL=https://api.mangadex.org
CACHE_TTL=600
```

4. Run the application locally:

```bash
npm run dev
```

5. Test the API locally: Open http://localhost:3000/api/manga/search?query=naruto in your browser or use a tool like Postman.




---

🌐 Deployment on Vercel

1. Install Vercel CLI:

```bash
npm install -g vercel
```

2. Login to Vercel:

```bash
vercel login
```

3. Deploy the application:

```bash
vercel
```

4. Vercel will provide a live deployment URL after completion.




---

🔗 API Endpoints

/api/manga/search

Method: GET<br>
Description: Search for manga details by title.

Query Parameters:

Example Request:

GET /api/manga/search?query=naruto

Example Response:

```json
[
  {
    "id": "123456",
    "title": {
      "en": "Naruto"
    },
    "description": {
      "en": "A story about ninjas and bonds."
    },
    "cover": "https://uploads.mangadex.org/covers/123456/cover.jpg",
    "status": "completed",
    "year": 1999,
    "genres": ["Action", "Adventure", "Fantasy"]
  }
]
```

---

🔧 Configuration

Environment Variables


---

❗ Troubleshooting

Common Errors

500 Internal Server Error

Cause: An unexpected server error occurred.

Solution: Check the server logs or console output for more details.


ReferenceError: require is not defined

Cause: Module syntax conflict (CommonJS vs ES modules).

Solution: Ensure "type": "module" is defined in package.json or adjust imports.


404 No Manga Found

Cause: No results found for the search query.

Solution: Verify the query or check MangaDex API status.



---

🤝 Contributing

Contributions are welcome! Follow these steps to contribute:

1. Fork the repository.


2. Create a feature branch:

git checkout -b feature/your-feature-name


3. Commit your changes:

git commit -m "Add your message here"


4. Push to your branch:

git push origin feature/your-feature-name


5. Submit a pull request.




---

📜 License

This project is licensed under the MIT License. See the LICENSE file for more information.


---

💬 Support

For questions or issues, please open an issue on GitHub.


