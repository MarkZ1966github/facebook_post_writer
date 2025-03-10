require('dotenv').config();
const express = require('express');
const { OpenAI } = require('openai');
const path = require('path');
const rateLimit = require('express-rate-limit');
const app = express();
const PORT = process.env.PORT || 8080;

// Rate limiting middleware to prevent abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests, please try again after 15 minutes'
  }
});

// Initialize OpenAI client with API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(express.static('public'));
app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!'
  });
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint to generate Facebook post
app.post('/api/generate-post', apiLimiter, async (req, res) => {
  try {
    const { topic, writeStyle, postGoal, ctaLink, contentLength } = req.body;
    
    let prompt = `Write an engaging Facebook post about ${topic}. `;
    
    if (writeStyle) {
      prompt += `Write in the style of ${writeStyle}. `;
    }
    
    if (postGoal === 'engagement') {
      prompt += 'Make it highly engaging to encourage comments, likes, and shares. ';
    } else if (postGoal === 'link') {
      prompt += 'Structure the post to lead people to click on a link in the comments. ';
    }
    
    prompt += `The post should be ${contentLength} in length.`;
    
    // Generate the post content
    const postCompletion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are an expert social media content creator specializing in Facebook posts that drive engagement and conversions. Create content that feels authentic, conversational, and tailored to Facebook's audience. Use emojis appropriately, include questions to encourage engagement, and create hooks that capture attention in the first sentence."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: contentLength === 'short' ? 150 : contentLength === 'medium' ? 300 : 500,
    });
    
    let postContent = postCompletion.choices[0].message.content;
    let commentContent = '';
    
    // If there's a CTA link, generate a follow-up comment
    if (ctaLink && postGoal === 'link') {
      const commentCompletion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "You are an expert social media content creator specializing in Facebook posts that drive engagement and conversions. Create natural-sounding comments that don't feel spammy or overly promotional. The comment should feel like a genuine follow-up that adds value while smoothly incorporating the CTA link."
          },
          {
            role: "user",
            content: `Write a brief follow-up comment for a Facebook post about ${topic} that includes this call-to-action link: ${ctaLink}. Make it compelling and natural, as if it's a comment on your own post. The comment should not appear promotional but should encourage clicks through curiosity or value proposition.`
          }
        ],
        temperature: 0.7,
        max_tokens: 150,
      });
      commentContent = commentCompletion.choices[0].message.content;
    }
    
    res.json({
      success: true,
      postContent,
      commentContent
    });
  } catch (error) {
    console.error('Error generating post:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate post'
    });
  }
});

// Simple request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to use the Facebook Post Writer`);
  console.log('Facebook Post Writer is ready to create engaging content!');
});;