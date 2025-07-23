const express = require('express');
const path = require('path');
const cors = require('cors');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// API routes
app.post('/api/search', (req, res) => {
  console.log('Search API called with query:', req.body.query);
  try {
    const { query } = req.body;
    
    if (!query) {
      console.log('No query provided');
      return res.status(400).json({ error: 'Query is required' });
    }

    console.log('Making request to n8n webhook...');
    const postData = JSON.stringify({ query });
    
    const options = {
      hostname: 'shalkin.app.n8n.cloud',
      path: '/webhook/search',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const request = https.request(options, (response) => {
      console.log('n8n response status:', response.statusCode);
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        console.log('n8n response received, length:', data.length);
        try {
          if (!data || data.trim() === '') {
            console.log('Empty response from n8n, sending default message');
            res.json([{ output: 'Search completed successfully, but no results were returned from the workflow.' }]);
            return;
          }

          const responseData = JSON.parse(data);
          const outputHtml = responseData.output_html;

          if (!outputHtml) {
            console.log('No output_html in n8n response, sending default message');
            res.json([{ output: 'Search completed successfully, but no HTML results were returned from the workflow.' }]);
            return;
          }
          
          const formattedResponse = [{
            output_html: outputHtml,
            output: responseData.output || ''
          }];
          
          console.log('Sending formatted HTML response to client');
          res.json(formattedResponse);
        } catch (error) {
          console.error('Response processing error:', error);
          res.status(500).json({ error: 'Failed to process webhook response' });
        }
      });
    });

    request.on('error', (error) => {
      console.error('Search API error:', error);
      res.status(500).json({ error: 'Search request failed' });
    });

    request.write(postData);
    request.end();
  } catch (error) {
    console.error('Search API error:', error);
    res.status(500).json({ error: 'Search request failed' });
  }
});

// Catch-all for other API routes
app.use('/api', (req, res, next) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Serve the Vue.js app for all other routes (SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Deep Research App server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});