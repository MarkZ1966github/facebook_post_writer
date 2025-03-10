# Facebook Post Writer

An AI-powered tool for creating engaging Facebook posts using OpenAI's GPT models.

## Features

- Generate engaging Facebook posts on any topic
- Customize the writing style to match your voice or favorite content creator
- Optimize posts for engagement, link clicks, or general content
- Include call-to-action links in follow-up comments
- Choose between short, medium, or long content formats
- Easy-to-use web interface
- Save and retrieve post history (stored locally)
- One-click copy functionality for posts and comments
- Mobile-responsive design

## Requirements

- Node.js
- NPM or Yarn
- OpenAI API key

## Installation

1. Clone the repository:
```
git clone https://github.com/yourusername/facebook_post_writer.git
cd facebook_post_writer
```

2. Install dependencies:
```
npm install
```

3. Create a `.env` file with your OpenAI API key:
```
PORT=3000
OPENAI_API_KEY=your_openai_api_key
```

4. Start the server:
```
npm start
```

5. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Enter a topic or keyword for your Facebook post
2. Optionally specify a writing style (e.g., "Gary Vaynerchuk", "my personal blog")
3. Choose your post goal (engagement, link clicks, or general content)
4. If driving traffic to a link, enter your CTA link
5. Select your preferred content length
6. Click "Generate Facebook Post"
7. Copy the generated post and comment (if applicable) to use on Facebook

## License

MIT

## Acknowledgements

- OpenAI for providing the API that powers the content generation
- Express.js for the web server framework